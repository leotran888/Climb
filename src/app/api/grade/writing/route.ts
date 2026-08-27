import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndRecordUsage } from '@/lib/entitlement'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, essay, taskType, wordCount, completionTimeSeconds } = await request.json()

  if (!essay?.trim() || !taskType) {
    return NextResponse.json({ error: 'Essay and task type are required' }, { status: 400 })
  }

  // Check entitlement before creating submission
  const entitlement = await checkAndRecordUsage(user.id, 'writing_grading')
  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: 'quota_exceeded',
        message: 'Bạn đã dùng hết lượt chấm Writing tháng này. Nâng cấp gói để tiếp tục.',
        remaining: 0,
      },
      { status: 403 }
    )
  }

  const { data: submission, error: subError } = await supabase
    .from('writing_submissions')
    .insert({
      user_id: user.id,
      prompt_id: null,
      question: question?.trim() || null,
      task_type: taskType,
      response_text: essay,
      word_count: wordCount ?? 0,
      time_taken: null,
      completion_time_seconds: typeof completionTimeSeconds === 'number' ? completionTimeSeconds : null,
    })
    .select()
    .single()

  if (subError || !submission) {
    console.error('[grade/writing] submission insert error:', subError)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  return NextResponse.json({ submissionId: submission.id })
}
