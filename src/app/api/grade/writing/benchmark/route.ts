/**
 * HYBRID BENCHMARK ROUTE — Sonnet scoring + Haiku corrections in parallel.
 * Does NOT save to DB. Returns timing data + merged result for quality review.
 * Use this to benchmark before switching production to hybrid architecture.
 *
 * POST /api/grade/writing/benchmark
 * Body: { submissionId: string, imageBase64?: string, imageMediaType?: string }
 */
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  SCORING_SYSTEM_PROMPT,
  CORRECTIONS_SYSTEM_PROMPT,
  buildScoringUserPrompt,
  buildCorrectionsUserPrompt,
  TASK_LABELS,
  computeOverallBand,
} from '@/lib/grading'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const t0 = Date.now()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId, imageBase64, imageMediaType: rawMediaType } = await request.json()
  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 })

  const { data: submission } = await supabase
    .from('writing_submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('user_id', user.id)
    .single()

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  const tDb = Date.now()

  const { response_text: essay, question, task_type: taskType, word_count: wordCount } = submission
  const taskLabel = TASK_LABELS[taskType as string] ?? taskType
  const imageMediaType = (rawMediaType ?? 'image/png') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const questionSection = imageBase64
    ? `QUESTION:\n${question?.trim() ? question.trim() + '\n' : ''}[A chart/diagram image is provided — use it to assess Task Achievement accuracy and data selection.]`
    : question?.trim()
    ? `QUESTION:\n${question.trim()}`
    : `NOTE: No question provided. For Task Response/Achievement, mark as not fully assessable. Assess Coherence, Lexical Resource, and Grammatical Range normally.`

  const scoringUserPrompt     = buildScoringUserPrompt({ taskLabel, questionSection, wordCount: wordCount ?? 'unknown', essay })
  const correctionsUserPrompt = buildCorrectionsUserPrompt({ essay })

  // ── Parallel AI calls ──────────────────────────────────────────────────────
  let sonnetData: Record<string, unknown>
  let haikuData:  Record<string, unknown>
  let sonnetMs:   number
  let haikuMs:    number
  let sonnetUsage: Record<string, number>
  let haikuUsage:  Record<string, number>

  try {
    const tAiStart = Date.now()

    const [sonnetMsg, haikuMsg] = await Promise.all([
      // Sonnet: IELTS scoring only
      (async () => {
        const s0 = Date.now()
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
                  { type: 'text' as const, text: scoringUserPrompt },
                ]
              : scoringUserPrompt,
          }],
        })
        sonnetMs    = Date.now() - s0
        sonnetUsage = msg.usage as unknown as Record<string, number>
        return msg
      })(),

      // Haiku: corrections + improvements only
      (async () => {
        const h0 = Date.now()
        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          system: CORRECTIONS_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: correctionsUserPrompt,
          }],
        })
        haikuMs    = Date.now() - h0
        haikuUsage = msg.usage as unknown as Record<string, number>
        return msg
      })(),
    ])

    const parallelWallMs = Date.now() - tAiStart

    // Parse Sonnet scoring
    const sonnetText = sonnetMsg.content[0].type === 'text' ? sonnetMsg.content[0].text : ''
    const sonnetJson = sonnetText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
    sonnetData = JSON.parse(sonnetJson)

    // Parse Haiku corrections
    const haikuText = haikuMsg.content[0].type === 'text' ? haikuMsg.content[0].text : ''
    const haikuJson = haikuText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
    haikuData = JSON.parse(haikuJson)

    const tEnd = Date.now()

    // ── Validate scoring ───────────────────────────────────────────────────
    const c = sonnetData?.criteria as Record<string, { band: number }> | undefined
    const criterionBands = [
      c?.task_response?.band,
      c?.coherence_cohesion?.band,
      c?.lexical_resource?.band,
      c?.grammatical_range_accuracy?.band,
    ]
    if (criterionBands.some(b => typeof b !== 'number' || b < 1 || b > 9)) {
      return NextResponse.json({ error: 'Sonnet returned invalid bands', raw_sonnet: sonnetData }, { status: 500 })
    }

    const overallBand = computeOverallBand(criterionBands as number[])
    const targetBand  = Math.min(Math.round((overallBand + 1.0) * 2) / 2, 9.0)

    // ── Build benchmark report ─────────────────────────────────────────────
    const benchmark = {
      db_ms:            tDb - t0,
      sonnet_ms:        sonnetMs!,
      haiku_ms:         haikuMs!,
      parallel_wall_ms: parallelWallMs,
      total_ms:         tEnd - t0,
      sonnet_tokens: {
        input:         sonnetUsage!.input_tokens,
        output:        sonnetUsage!.output_tokens,
        cache_created: sonnetUsage!.cache_creation_input_tokens ?? 0,
        cache_read:    sonnetUsage!.cache_read_input_tokens     ?? 0,
      },
      haiku_tokens: {
        input:  haikuUsage!.input_tokens,
        output: haikuUsage!.output_tokens,
      },
      total_output_tokens: (sonnetUsage!.output_tokens ?? 0) + (haikuUsage!.output_tokens ?? 0),
    }

    console.log('[benchmark] timing ms:', {
      db:           benchmark.db_ms,
      sonnet:       benchmark.sonnet_ms,
      haiku:        benchmark.haiku_ms,
      parallel_wall: benchmark.parallel_wall_ms,
      total:        benchmark.total_ms,
    })
    console.log('[benchmark] tokens:', benchmark.sonnet_tokens, '| haiku:', benchmark.haiku_tokens)

    // ── Merged result (same shape as production process route) ────────────
    const merged = {
      overall_band:    overallBand,
      target_band:     targetBand,
      criteria_detail: {
        task_response:      c?.task_response,
        coherence_cohesion: c?.coherence_cohesion,
        lexical_resource:   c?.lexical_resource,
        grammatical_range:  (sonnetData.criteria as Record<string, unknown>)?.grammatical_range_accuracy,
      },
      overall_feedback:        sonnetData.overall_feedback,
      priority_improvements:   sonnetData.priority_improvements,
      corrections:             haikuData.corrections             ?? [],
      vocabulary_improvements: haikuData.vocabulary_improvements ?? [],
      sentence_improvements:   haikuData.sentence_improvements   ?? [],
    }

    return NextResponse.json({ benchmark, result: merged })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[benchmark] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
