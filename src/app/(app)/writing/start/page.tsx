import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WritingTaskType } from '@/lib/types'
import WritingTestClient from '@/components/WritingTestClient'

export default async function WritingStartPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const taskType = params.type as WritingTaskType

  const validTypes: WritingTaskType[] = ['academic_task1', 'general_task1', 'task2']
  if (!taskType || !validTypes.includes(taskType)) {
    redirect('/writing')
  }

  const supabase = await createClient()

  // Pick a random prompt for this task type
  const { data: prompts } = await supabase
    .from('writing_prompts')
    .select('*')
    .eq('task_type', taskType)

  if (!prompts || prompts.length === 0) redirect('/writing')

  const prompt = prompts[Math.floor(Math.random() * prompts.length)]

  return <WritingTestClient prompt={prompt} />
}
