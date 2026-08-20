import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TASK_TYPE_LABELS } from '@/lib/types'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: submissions } = await supabase
    .from('writing_submissions')
    .select('*, writing_prompts(task_type, title), writing_results(overall_band)')
    .eq('user_id', user!.id)
    .order('submitted_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Submission History</h1>

      {!submissions?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-4">📂</p>
          <p className="text-slate-700 font-medium">No submissions yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Your completed tests will appear here.</p>
          <Link href="/writing" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
            Start a Writing Test
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {submissions.map(sub => (
            <Link
              key={sub.id}
              href={`/writing/result/${sub.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900">{sub.writing_prompts?.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sub.writing_prompts?.task_type
                    ? TASK_TYPE_LABELS[sub.writing_prompts.task_type as keyof typeof TASK_TYPE_LABELS]
                    : ''}{' '}
                  · {new Date(sub.submitted_at).toLocaleDateString('en-GB')}
                  {' '}· {sub.word_count} words
                </p>
              </div>
              <div>
                {sub.writing_results?.overall_band ? (
                  <span className="bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1 rounded-full">
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
