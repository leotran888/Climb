import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingSubmission } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: submissions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase
      .from('writing_submissions')
      .select('*, writing_prompts(task_type, title), writing_results(overall_band)')
      .eq('user_id', user!.id)
      .order('submitted_at', { ascending: false })
      .limit(5),
  ])

  const typedSubmissions = (submissions ?? []) as WritingSubmission[]
  const bandScores = typedSubmissions
    .map(s => s.writing_results?.overall_band)
    .filter((b): b is number => b !== undefined && b !== null)

  const latestBand = bandScores[0] ?? null
  const avgBand = bandScores.length
    ? Math.round((bandScores.reduce((a, b) => a + b, 0) / bandScores.length) * 2) / 2
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Track your IELTS progress and keep practising.</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Latest Writing Band</p>
          <p className="text-4xl font-bold text-blue-700">{latestBand ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-1">AI estimate</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Average Band</p>
          <p className="text-4xl font-bold text-slate-700">{avgBand ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-1">Across {bandScores.length} test(s)</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 font-medium mb-1">Target Band</p>
          <p className="text-4xl font-bold text-emerald-600">{profile?.target_band ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-1">Set in your profile</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Start Practising</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/writing" className="bg-blue-700 text-white rounded-2xl p-6 hover:bg-blue-800 transition-colors group">
            <div className="text-2xl mb-3">📝</div>
            <h3 className="font-semibold text-lg mb-1">Writing Test</h3>
            <p className="text-blue-200 text-sm">Task 1 (Academic & General) · Task 2</p>
          </Link>
          <div className="bg-slate-100 text-slate-400 rounded-2xl p-6 cursor-not-allowed">
            <div className="text-2xl mb-3">🎤</div>
            <h3 className="font-semibold text-lg mb-1">Speaking Test</h3>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      {typedSubmissions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Submissions</h2>
            <Link href="/history" className="text-sm text-blue-700 hover:underline font-medium">View all</Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {typedSubmissions.map(sub => (
              <Link
                key={sub.id}
                href={`/writing/result/${sub.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 text-sm">{sub.writing_prompts?.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sub.writing_prompts?.task_type?.replace('_', ' ').toUpperCase()} ·{' '}
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {sub.writing_results?.overall_band ? (
                    <span className="bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1 rounded-full">
                      Band {sub.writing_results.overall_band}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">Grading...</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {typedSubmissions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-slate-700 font-medium">No submissions yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Complete your first writing test to get AI feedback.</p>
          <Link href="/writing" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
            Start a Writing Test
          </Link>
        </div>
      )}
    </div>
  )
}
