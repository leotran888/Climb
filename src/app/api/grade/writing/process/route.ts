/**
 * POST /api/grade/writing/process
 *
 * Production writing assessment endpoint.
 * Supports two modes via WRITING_AI_MODE env var:
 *   "hybrid"  — Sonnet scoring + Haiku corrections in parallel (default)
 *   "sonnet"  — Single Sonnet call with full prompt (rollback path)
 *
 * Architecture (hybrid):
 *   SONNET: sole source of IELTS band scores (TR, CC, LR, GR, overall)
 *   HAIKU:  error corrections only; failure is non-fatal (Sonnet result still saved)
 * @version 2.0 hybrid — 2026-08-21
 */
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  SYSTEM_PROMPT,
  SCORING_SYSTEM_PROMPT,
  CORRECTIONS_SYSTEM_PROMPT,
  buildUserPrompt,
  buildScoringUserPrompt,
  buildCorrectionsUserPrompt,
  TASK_LABELS,
  computeOverallBand,
} from '@/lib/grading'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type AIMode       = 'hybrid' | 'sonnet'
type ImageMType   = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
type HaikuStatus  = 'ok' | 'failed' | 'skipped'

function parseModelJson(text: string): unknown {
  return JSON.parse(
    text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
  )
}

export async function POST(request: NextRequest) {
  const t0   = Date.now()
  const mode = (process.env.WRITING_AI_MODE ?? 'hybrid') as AIMode

  // ── Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tAuth = Date.now()

  const { submissionId, imageBase64, imageMediaType: rawMediaType } = await request.json()
  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 })

  // ── DB: fetch submission + duplicate-check in parallel ──────────────────
  const [{ data: submission }, { data: existing }] = await Promise.all([
    supabase.from('writing_submissions').select('*').eq('id', submissionId).eq('user_id', user.id).single(),
    supabase.from('writing_results').select('id').eq('submission_id', submissionId).single(),
  ])

  const tDb = Date.now()

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  if (existing)    return NextResponse.json({ error: 'Already graded' },       { status: 409 })

  const { response_text: essay, question, task_type: taskType, word_count: wordCount } = submission
  const taskLabel      = TASK_LABELS[taskType as string] ?? taskType
  const imageMediaType = (rawMediaType ?? 'image/png') as ImageMType

  const questionSection = imageBase64
    ? `QUESTION:\n${question?.trim() ? question.trim() + '\n' : ''}[A chart/diagram image is provided — use it to assess Task Achievement accuracy and data selection.]`
    : question?.trim()
    ? `QUESTION:\n${question.trim()}`
    : `NOTE: No question provided. For Task Response/Achievement, mark as not fully assessable. Assess Coherence, Lexical Resource, and Grammatical Range normally.`

  // ── AI assessment ────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gradeData: any
  let haikuStatus: HaikuStatus = 'skipped'

  // Metrics accumulated below, logged before DB save
  let sonnetMs = 0, haikuMs = 0
  let sonnetIn = 0, sonnetOut = 0, sonnetCacheRead = 0, sonnetCacheCreated = 0
  let haikuIn  = 0, haikuOut  = 0
  let scoringVersion = 'sonnet-4-6', correctionVersion = 'sonnet-4-6'

  const tAiStart = Date.now()

  if (mode === 'hybrid') {
    // ═══════════════════════════════════════════════════════════════════════
    // HYBRID: Sonnet (scoring) ‖ Haiku (corrections) — parallel
    // ═══════════════════════════════════════════════════════════════════════
    const scoringPrompt     = buildScoringUserPrompt({ taskLabel, questionSection, wordCount: wordCount ?? 'unknown', essay })
    const correctionsPrompt = buildCorrectionsUserPrompt({ essay })

    // Promise.allSettled: Haiku failure never kills the Sonnet result
    const [sonnetSettled, haikuSettled] = await Promise.allSettled([

      // ── Sonnet: IELTS band scoring (sole source of truth for bands) ──────
      (async () => {
        const s0  = Date.now()
        const msg = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 5000,
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
        sonnetIn           = usage.input_tokens                  ?? 0
        sonnetOut          = usage.output_tokens                 ?? 0
        sonnetCacheRead    = usage.cache_read_input_tokens       ?? 0
        sonnetCacheCreated = usage.cache_creation_input_tokens   ?? 0
        const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
        return parseModelJson(text)
      })(),

      // ── Haiku: corrections only — failure is non-fatal ───────────────────
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

    // Sonnet failure → no fake scores, return error immediately
    if (sonnetSettled.status === 'rejected') {
      const reason = sonnetSettled.reason instanceof Error ? sonnetSettled.reason.message : String(sonnetSettled.reason)
      console.error('[process/hybrid] Sonnet scoring failed:', reason)
      return NextResponse.json({ error: 'AI scoring failed. Please try again.' }, { status: 500 })
    }

    // Haiku failure → non-fatal: save empty corrections, still save Sonnet result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let haikuData: any
    if (haikuSettled.status === 'rejected') {
      const reason = haikuSettled.reason instanceof Error ? haikuSettled.reason.message : String(haikuSettled.reason)
      console.error('[process/hybrid] Haiku corrections failed (non-fatal):', reason)
      haikuStatus  = 'failed'
      correctionVersion = 'unavailable'
      haikuData = { corrections: [], vocabulary_improvements: [], sentence_improvements: [] }
    } else {
      haikuStatus       = 'ok'
      correctionVersion = 'haiku-4-5-20251001'
      haikuData = haikuSettled.value
    }

    scoringVersion = 'hybrid-sonnet-4-6'
    const sonnetData = sonnetSettled.value as Record<string, unknown>

    // Merge: Sonnet bands/feedback + Haiku corrections (no upper limit on corrections)
    gradeData = {
      criteria:                sonnetData.criteria,
      overall_feedback:        sonnetData.overall_feedback,
      priority_improvements:   sonnetData.priority_improvements   ?? [],
      corrections:             haikuData.corrections              ?? [],
      vocabulary_improvements: haikuData.vocabulary_improvements  ?? [],
      sentence_improvements:   haikuData.sentence_improvements    ?? [],
    }

  } else {
    // ═══════════════════════════════════════════════════════════════════════
    // SONNET-ONLY: single call with full combined prompt (rollback path)
    // ═══════════════════════════════════════════════════════════════════════
    const userPrompt = buildUserPrompt({ taskLabel, questionSection, wordCount: wordCount ?? 'unknown', essay })

    try {
      const s0  = Date.now()
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: [
          {
            type: 'text' as const,
            text: SYSTEM_PROMPT,
            // @ts-ignore
            cache_control: { type: 'ephemeral' },
          },
        ],
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
      sonnetMs = Date.now() - s0
      const usage = msg.usage as unknown as Record<string, number>
      sonnetIn           = usage.input_tokens                  ?? 0
      sonnetOut          = usage.output_tokens                 ?? 0
      sonnetCacheRead    = usage.cache_read_input_tokens       ?? 0
      sonnetCacheCreated = usage.cache_creation_input_tokens   ?? 0
      scoringVersion     = 'sonnet-4-6'
      correctionVersion  = 'sonnet-4-6'
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      gradeData = parseModelJson(text)
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      console.error('[process/sonnet] AI failed:', reason)
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
    }
  }

  const tAiEnd = Date.now()

  // ── Log metrics ──────────────────────────────────────────────────────────
  const metrics = {
    mode,
    total_latency:        tAiEnd - t0,
    sonnet_latency:       sonnetMs,
    haiku_latency:        haikuMs || null,
    input_tokens:         sonnetIn  + haikuIn,
    output_tokens:        sonnetOut + haikuOut,
    cache_read_tokens:    sonnetCacheRead,
    cache_created_tokens: sonnetCacheCreated,
    sonnet_input_tokens:  sonnetIn,
    sonnet_output_tokens: sonnetOut,
    haiku_input_tokens:   haikuIn  || null,
    haiku_output_tokens:  haikuOut || null,
    model:                mode === 'hybrid' ? 'claude-sonnet-4-6+haiku-4-5' : 'claude-sonnet-4-6',
    scoring_version:      scoringVersion,
    correction_version:   correctionVersion,
    haiku_status:         haikuStatus,
    auth_ms:              tAuth - t0,
    db_fetch_ms:          tDb - tAuth,
  }
  console.log('[process] metrics:', JSON.stringify(metrics))

  // ── Validate bands ───────────────────────────────────────────────────────
  const c = gradeData?.criteria as Record<string, { band: number; justification?: string }> | undefined
  const criterionBands = [
    c?.task_response?.band,
    c?.coherence_cohesion?.band,
    c?.lexical_resource?.band,
    c?.grammatical_range_accuracy?.band,
  ]
  if (criterionBands.some(b => typeof b !== 'number' || b < 1 || b > 9)) {
    console.error('[process] invalid criterion bands:', criterionBands)
    return NextResponse.json({ error: 'AI returned invalid scores.' }, { status: 500 })
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

  // ── Save to DB ───────────────────────────────────────────────────────────
  const { error: resultError } = await supabase.from('writing_results').insert({
    submission_id:      submissionId,
    task_achievement:   c!.task_response.band,
    coherence_cohesion: c!.coherence_cohesion.band,
    lexical_resource:   c!.lexical_resource.band,
    grammatical_range:  c!.grammatical_range_accuracy.band,
    overall_band:       overallBand,
    task_feedback:      c!.task_response.justification              ?? '',
    coherence_feedback: c!.coherence_cohesion.justification         ?? '',
    lexical_feedback:   c!.lexical_resource.justification           ?? '',
    grammar_feedback:   c!.grammatical_range_accuracy.justification ?? '',
    task_errors: [], coherence_errors: [], lexical_errors: [], grammar_errors: [],
    summary:                 gradeData.overall_feedback             ?? '',
    ai_model:                metrics.model,
    criteria_detail:         criteriaDetail,
    corrections:             gradeData.corrections                  ?? [],
    vocabulary_improvements: vocabImprovements,
    sentence_improvements:   gradeData.sentence_improvements        ?? [],
    priority_improvements:   gradeData.priority_improvements        ?? [],
    upgraded_essay:          null,
    target_band:             targetBand,
  })

  const tEnd = Date.now()
  console.log('[process] total wall ms:', tEnd - t0, '| db save ms:', tEnd - tAiEnd)

  if (resultError) {
    console.error('[process] DB insert error:', resultError)
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
