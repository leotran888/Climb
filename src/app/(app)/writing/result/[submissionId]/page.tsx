import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TASK_TYPE_LABELS, CRITERIA_LABELS } from '@/lib/types'

function BandBar({ band }: { band: number }) {
  const pct = (band / 9) * 100
  const color = band >= 7 ? 'bg-emerald-500' : band >= 5.5 ? 'bg-blue-500' : band >= 4 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-700 w-8 text-right">{band}</span>
    </div>
  )
}

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors?.length) return null
  return (
    <ul className="mt-3 space-y-2">
      {errors.map((err, i) => {
        const [quote, suggestion] = err.split('→').map(s => s.trim())
        return (
          <li key={i} className="text-sm bg-slate-50 rounded-lg p-3 border border-slate-100">
            {suggestion ? (
              <>
                <span className="text-red-600 italic">&ldquo;{quote}&rdquo;</span>
                <span className="text-slate-400 mx-2">→</span>
                <span className="text-slate-700">{suggestion}</span>
              </>
            ) : (
              <span className="text-slate-700">{err}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default async function WritingResultPage({
  params,
}: {
  params: Promise<{ submissionId: string }>
}) {
  const { submissionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: submission } = await supabase
    .from('writing_submissions')
    .select('*, writing_prompts(*), writing_results(*)')
    .eq('id', submissionId)
    .eq('user_id', user!.id)
    .single()

  if (!submission) notFound()

  const result = submission.writing_results
  const prompt = submission.writing_prompts

  if (!result) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl mb-4">⏳</p>
        <p className="font-semibold text-slate-900">Grading in progress...</p>
        <p className="text-slate-500 text-sm mt-2">Refresh in a few seconds.</p>
      </div>
    )
  }

  const criteria = [
    { key: 'task_achievement', band: result.task_achievement, feedback: result.task_feedback, errors: result.task_errors },
    { key: 'coherence_cohesion', band: result.coherence_cohesion, feedback: result.coherence_feedback, errors: result.coherence_errors },
    { key: 'lexical_resource', band: result.lexical_resource, feedback: result.lexical_feedback, errors: result.lexical_errors },
    { key: 'grammatical_range', band: result.grammatical_range, feedback: result.grammar_feedback, errors: result.grammar_errors },
  ] as const

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-500 mb-1">
          {prompt?.task_type ? TASK_TYPE_LABELS[prompt.task_type as keyof typeof TASK_TYPE_LABELS] : ''} ·{' '}
          {new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{prompt?.title}</h1>
      </div>

      {/* Overall band */}
      <div className="bg-blue-700 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-blue-200 text-sm font-medium mb-1">Overall Band Score (AI Estimate)</p>
          <p className="text-7xl font-bold">{result.overall_band}</p>
          <p className="text-blue-200 text-sm mt-2">{submission.word_count} words written</p>
        </div>
        <div className="text-sm text-blue-100 max-w-sm text-center md:text-left leading-relaxed">
          {result.summary}
        </div>
      </div>

      {/* Criteria scores */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Criterion Scores</h2>
        <div className="space-y-4">
          {criteria.map(c => (
            <div key={c.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-600">{CRITERIA_LABELS[c.key as keyof typeof CRITERIA_LABELS]}</span>
              </div>
              <BandBar band={c.band} />
            </div>
          ))}
        </div>
      </div>

      {/* Detailed feedback */}
      <div className="space-y-5">
        <h2 className="font-semibold text-slate-900 text-lg">Detailed Feedback</h2>
        {criteria.map(c => (
          <div key={c.key} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">
                {CRITERIA_LABELS[c.key as keyof typeof CRITERIA_LABELS]}
              </h3>
              <span className="bg-slate-100 text-slate-700 font-bold text-sm px-3 py-1 rounded-full">
                Band {c.band}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{c.feedback}</p>
            <ErrorList errors={c.errors} />
          </div>
        ))}
      </div>

      {/* Teacher feedback (if any) */}
      {result.teacher_feedback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <h2 className="font-semibold text-emerald-900 mb-2">Teacher Feedback</h2>
          {result.teacher_score && (
            <p className="text-sm text-emerald-700 mb-2">Teacher score: <strong>Band {result.teacher_score}</strong></p>
          )}
          <p className="text-emerald-800 text-sm leading-relaxed">{result.teacher_feedback}</p>
        </div>
      )}

      {/* Your essay */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Your Essay</h2>
        <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 rounded-xl p-4">
          {submission.response_text}
        </div>
      </div>

      <div className="flex items-center gap-4 pb-8">
        <Link href="/writing" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
          Try Another Test
        </Link>
        <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
          Back to Dashboard
        </Link>
      </div>

      <p className="text-xs text-slate-400 pb-4">
        * This is an AI-estimated band score for practice purposes only and does not constitute an official IELTS result.
      </p>
    </div>
  )
}
