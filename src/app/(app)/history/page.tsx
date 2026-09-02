import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingSubmission, TASK_TYPE_LABELS } from '@/lib/types'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: submissions } = await supabase
    .from('writing_submissions')
    .select('*, writing_prompts(task_type, title), writing_results(overall_band)')
    .eq('user_id', user!.id)
    .order('submitted_at', { ascending: false })

  const typedSubmissions = (submissions ?? []) as WritingSubmission[]

  function getTitle(sub: WritingSubmission) {
    if (sub.writing_prompts?.title) return sub.writing_prompts.title
    if (sub.question) return sub.question.slice(0, 80) + (sub.question.length > 80 ? '…' : '')
    const type = sub.task_type ?? sub.writing_prompts?.task_type
    return type && TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS] + ' Essay'
      : 'Writing Submission'
  }

  function getType(sub: WritingSubmission) {
    const type = sub.task_type ?? sub.writing_prompts?.task_type
    return type && TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      : ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">History</h1>
        <p className="text-slate-500 mt-1">All your writing checks and AI feedback.</p>
      </div>

      {typedSubmissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-emerald-600">
          <p className="text-4xl mb-4">📂</p>
          <p className="text-slate-700 font-medium">No essays checked yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Your writing checks will appear here.</p>
          <Link href="/writing" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
            Check My Writing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-emerald-600 divide-y divide-slate-100">
          {typedSubmissions.map(sub => (
            <Link
              key={sub.id}
              href={`/writing/result/${sub.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 mr-4">
                <p className="font-medium text-slate-900 text-sm truncate">{getTitle(sub)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {getType(sub)} · {new Date(sub.submitted_at).toLocaleDateString('en-GB')} · {sub.word_count} words
                </p>
              </div>
              <div className="shrink-0">
                {sub.writing_results?.overall_band ? (
                  <span className="bg-emerald-50 text-emerald-700 font-bold text-sm px-3 py-1 rounded-full">
                    Band {sub.writing_results.overall_band}
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">No result</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
