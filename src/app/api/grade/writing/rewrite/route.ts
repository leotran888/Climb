import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId } = await request.json()
  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 })

  // Fetch submission + result
  const { data: submission } = await supabase
    .from('writing_submissions')
    .select('*, writing_results(*)')
    .eq('id', submissionId)
    .eq('user_id', user.id)
    .single()

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = submission.writing_results as { overall_band: number; target_band: number | null } | null
  if (!result) return NextResponse.json({ error: 'Result not ready' }, { status: 400 })

  const targetBand = result.target_band ?? Math.min(result.overall_band + 1, 9)

  const prompt = `You are an expert IELTS writing tutor. Rewrite the following student essay to target Band ${targetBand}.

REQUIREMENTS:
- Fix ALL grammar, vocabulary, collocation, and spelling errors
- Upgrade vocabulary to Band 7+ level
- Improve coherence, cohesion, and paragraph structure
- Improve task achievement/response (address the question more precisely)
- Preserve the student's original position and main arguments
- Write a complete, full essay — not excerpts or notes
- Write ONLY in English

ORIGINAL ESSAY:
${submission.response_text}

${submission.question ? `QUESTION:\n${submission.question}\n` : ''}

Return ONLY the rewritten essay text — no JSON, no labels, no commentary.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const upgradedEssay = content.text.trim()

    // Save to DB
    await supabase
      .from('writing_results')
      .update({ upgraded_essay: upgradedEssay })
      .eq('submission_id', submissionId)

    return NextResponse.json({ upgradedEssay, targetBand })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[rewrite] error:', msg)
    return NextResponse.json({ error: 'Failed to generate rewrite' }, { status: 500 })
  }
}
