/**
 * Supabase Edge Function: grade-writing
 * Replaces /api/grade/writing/process (Vercel, 60s limit) with 150s timeout.
 *
 * Deploy:
 *   supabase login
 *   supabase link --project-ref szmxactxerlelqczklso
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... WRITING_AI_MODE=hybrid
 *   supabase functions deploy grade-writing --no-verify-jwt
 *
 * Env vars auto-injected by Supabase (no secrets set needed):
 *   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk'
import {
  TASK_LABELS,
  computeOverallBand,
  SCORING_SYSTEM_PROMPT,
  CORRECTIONS_SYSTEM_PROMPT,
  buildScoringUserPrompt,
  buildCorrectionsUserPrompt,
} from '../_shared/grading.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type AIMode      = 'hybrid' | 'sonnet'
type ImageMType  = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
type HaikuStatus = 'ok' | 'failed' | 'skipped'

const VALID_IMAGE_TYPES: ImageMType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function normalizeMediaType(t: string | null | undefined): ImageMType {
  if (!t) return 'image/png'
  if (t === 'image/jpg') return 'image/jpeg'
  if (VALID_IMAGE_TYPES.includes(t as ImageMType)) return t as ImageMType
  return 'image/png'  // fallback for unsupported types (heic, bmp, tiff, etc.)
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function parseModelJson(text: string): unknown {
  return JSON.parse(
    text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const t0 = Date.now()

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabaseUrl      = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey  = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicKey     = Deno.env.get('ANTHROPIC_API_KEY')!
    const mode             = (Deno.env.get('WRITING_AI_MODE') ?? 'hybrid') as AIMode

    // User client (respects JWT / RLS for reads)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── Parse body ────────────────────────────────────────────────────────
    const { submissionId, imageBase64, imageMediaType: rawMediaType } = await req.json()
    if (!submissionId) return json({ error: 'submissionId required' }, 400)

    // ── DB: fetch submission + duplicate check ────────────────────────────
    const [{ data: submission }, { data: existing }] = await Promise.all([
      supabase.from('writing_submissions').select('*').eq('id', submissionId).eq('user_id', user.id).single(),
      supabase.from('writing_results').select('id').eq('submission_id', submissionId).single(),
    ])

    if (!submission) return json({ error: 'Submission not found' }, 404)
    if (existing)    return json({ error: 'Already graded' }, 409)

    // ── Entitlement check ─────────────────────────────────────────────────
    // Service role client (already available as supabaseAdmin below — create early)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Idempotency: if quota was already recorded for this submission (normal flow),
    // skip to avoid double-counting. Only re-check for direct Edge Function calls.
    const { data: existingUsage } = await supabaseAdmin
      .from('usage_records')
      .select('id')
      .eq('submission_id', submissionId)
      .maybeSingle()

    if (!existingUsage) {
      const { data: quota, error: quotaErr } = await supabaseAdmin.rpc('check_and_record_usage', {
        p_user_id: user.id,
        p_feature: 'writing_grading',
        p_submission_id: submissionId,
      })
      if (quotaErr) {
        console.error('[grade-writing] entitlement RPC error:', quotaErr)
        // Fail open on RPC errors — do not block legitimate users
      } else if (!quota?.allowed) {
        return json({
          error: 'quota_exceeded',
          message: 'Bạn đã dùng hết lượt chấm Writing tháng này.',
        }, 403)
      }
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const { response_text: essay, question, task_type: taskType, word_count: wordCount } = submission
    const taskLabel      = TASK_LABELS[taskType as string] ?? taskType
    const imageMediaType = normalizeMediaType(rawMediaType)

    const questionSection = imageBase64
      ? `QUESTION:\n${question?.trim() ? question.trim() + '\n' : ''}[A chart/diagram image is provided — use it to assess Task Achievement accuracy and data selection.]`
      : question?.trim()
      ? `QUESTION:\n${question.trim()}`
      : `NOTE: No question provided. For Task Response/Achievement, mark as not fully assessable. Assess Coherence, Lexical Resource, and Grammatical Range normally.`

    // ── AI assessment ─────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gradeData: any
    let haikuStatus: HaikuStatus = 'skipped'
    let sonnetMs = 0, haikuMs = 0
    let sonnetIn = 0, sonnetOut = 0, haikuIn = 0, haikuOut = 0
    let scoringVersion = 'sonnet-4-6', correctionVersion = 'sonnet-4-6'

    if (mode === 'hybrid') {
      const scoringPrompt     = buildScoringUserPrompt({ taskLabel, questionSection, wordCount: wordCount ?? 'unknown', essay })
      const correctionsPrompt = buildCorrectionsUserPrompt({ essay })

      const [sonnetSettled, haikuSettled] = await Promise.allSettled([

        // Sonnet: IELTS band scoring
        (async () => {
          const s0  = Date.now()
          const msg = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            temperature: 0,
            system: [
              {
                type: 'text' as const,
                text: SCORING_SYSTEM_PROMPT,
                // @ts-ignore
                cache_control: { type: 'ephemeral' },
              },
            ],
            messages: [{
              role: 'user',
              content: imageBase64
                ? [
                    { type: 'image' as const, source: { type: 'base64' as const, media_type: imageMediaType, data: imageBase64 } },
                    { type: 'text' as const, text: scoringPrompt },
                  ]
                : scoringPrompt,
            }],
          })
          sonnetMs = Date.now() - s0
          const usage = msg.usage as unknown as Record<string, number>
          sonnetIn  = usage.input_tokens  ?? 0
          sonnetOut = usage.output_tokens ?? 0
          const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
          return parseModelJson(text)
        })(),

        // Haiku: corrections only — failure is non-fatal
        (async () => {
          const h0  = Date.now()
          const msg = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 4096,
            system: CORRECTIONS_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: correctionsPrompt }],
          })
          haikuMs = Date.now() - h0
          const usage = msg.usage as unknown as Record<string, number>
          haikuIn  = usage.input_tokens  ?? 0
          haikuOut = usage.output_tokens ?? 0
          const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
          return parseModelJson(text)
        })(),
      ])

      if (sonnetSettled.status === 'rejected') {
        const reason = sonnetSettled.reason instanceof Error ? sonnetSettled.reason.message : String(sonnetSettled.reason)
        console.error('[grade-writing/hybrid] Sonnet scoring failed:', reason)
        return json({ error: 'AI scoring failed. Please try again.' }, 500)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let haikuData: any
      if (haikuSettled.status === 'rejected') {
        const reason = haikuSettled.reason instanceof Error ? haikuSettled.reason.message : String(haikuSettled.reason)
        console.error('[grade-writing/hybrid] Haiku corrections failed (non-fatal):', reason)
        haikuStatus       = 'failed'
        correctionVersion = 'unavailable'
        haikuData = { corrections: [], vocabulary_improvements: [], sentence_improvements: [] }
      } else {
        haikuStatus       = 'ok'
        correctionVersion = 'haiku-4-5-20251001'
        haikuData = haikuSettled.value
      }

      scoringVersion = 'hybrid-sonnet-4-6'
      const sonnetData = sonnetSettled.value as Record<string, unknown>

      gradeData = {
        criteria:                sonnetData.criteria,
        overall_feedback:        sonnetData.overall_feedback,
        priority_improvements:   sonnetData.priority_improvements   ?? [],
        corrections:             haikuData.corrections              ?? [],
        vocabulary_improvements: haikuData.vocabulary_improvements  ?? [],
        sentence_improvements:   haikuData.sentence_improvements    ?? [],
      }

    } else {
      // Sonnet-only fallback
      const userPrompt = buildScoringUserPrompt({ taskLabel, questionSection, wordCount: wordCount ?? 'unknown', essay })
      try {
        const s0  = Date.now()
        const msg = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          temperature: 0,
          system: SCORING_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: imageBase64
              ? [
                  { type: 'image' as const, source: { type: 'base64' as const, media_type: imageMediaType, data: imageBase64 } },
                  { type: 'text' as const, text: userPrompt },
                ]
              : userPrompt,
          }],
        })
        sonnetMs           = Date.now() - s0
        const usage        = msg.usage as unknown as Record<string, number>
        sonnetIn           = usage.input_tokens  ?? 0
        sonnetOut          = usage.output_tokens ?? 0
        scoringVersion     = 'sonnet-4-6'
        correctionVersion  = 'sonnet-4-6'
        const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
        gradeData  = parseModelJson(text)
        gradeData.corrections             = []
        gradeData.vocabulary_improvements = []
        gradeData.sentence_improvements   = []
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        console.error('[grade-writing/sonnet] AI failed:', reason)
        return json({ error: 'AI analysis failed. Please try again.' }, 500)
      }
    }

    // ── Log metrics ───────────────────────────────────────────────────────
    console.log('[grade-writing] metrics:', JSON.stringify({
      mode,
      total_ms:    Date.now() - t0,
      sonnet_ms:   sonnetMs,
      haiku_ms:    haikuMs || null,
      sonnet_in:   sonnetIn,
      sonnet_out:  sonnetOut,
      haiku_in:    haikuIn  || null,
      haiku_out:   haikuOut || null,
      haiku_status: haikuStatus,
      scoring_version:    scoringVersion,
      correction_version: correctionVersion,
    }))

    // ── Validate bands ────────────────────────────────────────────────────
    const c = gradeData?.criteria as Record<string, { band: number; justification?: string; to_reach?: string }> | undefined
    const criterionBands = [
      c?.task_response?.band,
      c?.coherence_cohesion?.band,
      c?.lexical_resource?.band,
      c?.grammatical_range_accuracy?.band,
    ]
    if (criterionBands.some(b => typeof b !== 'number' || b < 1 || b > 9)) {
      console.error('[grade-writing] invalid criterion bands:', criterionBands)
      return json({ error: 'AI returned invalid scores.' }, 500)
    }

    const overallBand = computeOverallBand(criterionBands as number[])
    const targetBand  = Math.min(Math.round((overallBand + 1.0) * 2) / 2, 9.0)

    const criteriaDetail = {
      task_response:      c!.task_response,
      coherence_cohesion: c!.coherence_cohesion,
      lexical_resource:   c!.lexical_resource,
      grammatical_range:  c!.grammatical_range_accuracy,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vocabImprovements = (gradeData.vocabulary_improvements ?? []).map((v: any) => ({
      original:    v.original,
      suggested:   v.suggestion ?? v.suggested ?? '',
      explanation: v.explanation,
    }))

    // ── Save to DB via service role (bypass RLS) ──────────────────────────
    const { error: resultError } = await supabaseAdmin.from('writing_results').insert({
      submission_id:      submissionId,
      task_achievement:   c!.task_response.band,
      coherence_cohesion: c!.coherence_cohesion.band,
      lexical_resource:   c!.lexical_resource.band,
      grammatical_range:  c!.grammatical_range_accuracy.band,
      overall_band:       overallBand,
      task_feedback:      c!.task_response.to_reach              ?? c!.task_response.justification              ?? '',
      coherence_feedback: c!.coherence_cohesion.to_reach         ?? c!.coherence_cohesion.justification         ?? '',
      lexical_feedback:   c!.lexical_resource.to_reach           ?? c!.lexical_resource.justification           ?? '',
      grammar_feedback:   c!.grammatical_range_accuracy.to_reach ?? c!.grammatical_range_accuracy.justification ?? '',
      task_errors: [], coherence_errors: [], lexical_errors: [], grammar_errors: [],
      summary:                 (gradeData.overall_feedback ?? (Array.isArray(gradeData.priority_improvements) ? (gradeData.priority_improvements as string[]).join(' ') : '')) || '',
      ai_model:                mode === 'hybrid' ? 'claude-sonnet-4-6+haiku-4-5' : 'claude-sonnet-4-6',
      criteria_detail:         criteriaDetail,
      corrections:             gradeData.corrections                  ?? [],
      vocabulary_improvements: vocabImprovements,
      sentence_improvements:   gradeData.sentence_improvements        ?? [],
      priority_improvements:   gradeData.priority_improvements        ?? [],
      upgraded_essay:          null,
      target_band:             targetBand,
    })

    if (resultError) {
      console.error('[grade-writing] DB insert error:', resultError)
      return json({ error: 'Failed to save result' }, 500)
    }

    console.log('[grade-writing] done. total ms:', Date.now() - t0)
    return json({ ok: true })

  } catch (err) {
    console.error('[grade-writing] unexpected error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
