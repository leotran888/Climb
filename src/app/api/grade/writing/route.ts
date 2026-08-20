import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { promptId, responseText, wordCount, timeTaken } = await request.json()

  if (!promptId || !responseText?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch the prompt
  const { data: prompt } = await supabase
    .from('writing_prompts')
    .select('*')
    .eq('id', promptId)
    .single()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }

  // Save submission first
  const { data: submission, error: subError } = await supabase
    .from('writing_submissions')
    .insert({
      user_id: user.id,
      prompt_id: promptId,
      response_text: responseText,
      word_count: wordCount,
      time_taken: timeTaken,
    })
    .select()
    .single()

  if (subError || !submission) {
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  // Build grading prompt for Claude
  const taskLabel =
    prompt.task_type === 'task2' ? 'IELTS Writing Task 2 (Essay)'
    : prompt.task_type === 'academic_task1' ? 'IELTS Academic Writing Task 1'
    : 'IELTS General Training Writing Task 1'

  const gradingPrompt = `You are an experienced IELTS examiner. Grade the following submission strictly according to official IELTS band descriptors.

Task Type: ${taskLabel}
Task Prompt:
${prompt.prompt_text}
${prompt.image_description ? `\nData/Image Description:\n${prompt.image_description}` : ''}

Candidate's Response (${wordCount} words):
${responseText}

Grade this response on all four IELTS criteria. For each criterion:
1. Assign a band score (use 0.5 increments, e.g. 5.0, 5.5, 6.0, etc.)
2. Write 2-4 sentences of specific feedback, referencing actual phrases or sentences from the candidate's text
3. List 2-4 specific errors or issues with the format: "exact quote from text → specific improvement"

Criteria:
- task_achievement: (Task Achievement for Task 2) or (Task Achievement for Task 1)
- coherence_cohesion: Coherence and Cohesion
- lexical_resource: Lexical Resource
- grammatical_range: Grammatical Range and Accuracy

Calculate overall_band as the average of the 4 criterion scores, rounded to the nearest 0.5.

IMPORTANT:
- Base ALL feedback on the actual text submitted. Do not give generic advice.
- If you cannot reliably evaluate pronunciation (not applicable here), do not fabricate feedback.
- Do not give inflated scores. Be accurate.
- Return ONLY valid JSON, no other text.

JSON format:
{
  "task_achievement": {
    "band": 0.0,
    "feedback": "...",
    "errors": ["quote → suggestion", "quote → suggestion"]
  },
  "coherence_cohesion": {
    "band": 0.0,
    "feedback": "...",
    "errors": ["quote → suggestion"]
  },
  "lexical_resource": {
    "band": 0.0,
    "feedback": "...",
    "errors": ["quote → suggestion"]
  },
  "grammatical_range": {
    "band": 0.0,
    "feedback": "...",
    "errors": ["quote → suggestion"]
  },
  "overall_band": 0.0,
  "summary": "2-3 sentence overall summary of the response's strengths and main areas for improvement."
}`

  let gradeData: {
    task_achievement: { band: number; feedback: string; errors: string[] }
    coherence_cohesion: { band: number; feedback: string; errors: string[] }
    lexical_resource: { band: number; feedback: string; errors: string[] }
    grammatical_range: { band: number; feedback: string; errors: string[] }
    overall_band: number
    summary: string
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: gradingPrompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Strip markdown code fences if present
    const jsonText = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    gradeData = JSON.parse(jsonText)
  } catch {
    // Clean up submission on grading failure
    await supabase.from('writing_submissions').delete().eq('id', submission.id)
    return NextResponse.json({ error: 'Grading failed. Please try again.' }, { status: 500 })
  }

  // Save result
  const { error: resultError } = await supabase.from('writing_results').insert({
    submission_id: submission.id,
    task_achievement: gradeData.task_achievement.band,
    coherence_cohesion: gradeData.coherence_cohesion.band,
    lexical_resource: gradeData.lexical_resource.band,
    grammatical_range: gradeData.grammatical_range.band,
    overall_band: gradeData.overall_band,
    task_feedback: gradeData.task_achievement.feedback,
    coherence_feedback: gradeData.coherence_cohesion.feedback,
    lexical_feedback: gradeData.lexical_resource.feedback,
    grammar_feedback: gradeData.grammatical_range.feedback,
    task_errors: gradeData.task_achievement.errors,
    coherence_errors: gradeData.coherence_cohesion.errors,
    lexical_errors: gradeData.lexical_resource.errors,
    grammar_errors: gradeData.grammatical_range.errors,
    summary: gradeData.summary,
    ai_model: 'claude-sonnet-4-6',
  })

  if (resultError) {
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
  }

  return NextResponse.json({ submissionId: submission.id })
}
