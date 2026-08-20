import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingPrompt, WritingTaskType, TASK_TYPE_LABELS } from '@/lib/types'

const TASK_DESCRIPTIONS: Record<WritingTaskType, string> = {
  academic_task1: 'Describe a graph, chart, diagram or map. Min 150 words. 20 minutes.',
  general_task1: 'Write a letter — formal, semi-formal or informal. Min 150 words. 20 minutes.',
  task2: 'Write an essay in response to a point of view, argument or problem. Min 250 words. 40 minutes.',
}

const TASK_ICONS: Record<WritingTaskType, string> = {
  academic_task1: '📊',
  general_task1: '✉️',
  task2: '📄',
}

export default async function WritingPage() {
  const supabase = await createClient()

  const { data: promptCounts } = await supabase
    .from('writing_prompts')
    .select('task_type')

  const counts: Record<string, number> = {}
  ;(promptCounts ?? []).forEach((p: { task_type: string }) => {
    counts[p.task_type] = (counts[p.task_type] ?? 0) + 1
  })

  const taskTypes: WritingTaskType[] = ['task2', 'academic_task1', 'general_task1']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Writing Tests</h1>
        <p className="text-slate-500 mt-1">Choose a task type to get a random prompt and start the timer.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {taskTypes.map(type => (
          <div key={type} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <div className="text-3xl mb-4">{TASK_ICONS[type]}</div>
            <h2 className="font-semibold text-slate-900 text-lg mb-2">{TASK_TYPE_LABELS[type]}</h2>
            <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-6">
              {TASK_DESCRIPTIONS[type]}
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">{counts[type] ?? 0} prompts available</span>
            </div>
            {(counts[type] ?? 0) > 0 ? (
              <StartTestButton taskType={type} />
            ) : (
              <button disabled className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-semibold cursor-not-allowed text-sm">
                No prompts yet
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <strong>Reminder:</strong> These are AI-estimated band scores for practice purposes only. They are not official IELTS scores.
      </div>
    </div>
  )
}

function StartTestButton({ taskType }: { taskType: WritingTaskType }) {
  return (
    <Link
      href={`/writing/start?type=${taskType}`}
      className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-center text-sm"
    >
      Start Test
    </Link>
  )
}
