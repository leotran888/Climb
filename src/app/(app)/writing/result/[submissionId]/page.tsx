import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TASK_TYPE_LABELS, WritingResult, VocabularyImprovement, SentenceImprovement, CriterionDetail } from '@/lib/types'
import CorrectionsSection from '@/components/CorrectionsSection'
import UpgradedEssaySection from '@/components/UpgradedEssaySection'
import ResultPendingLoader from '@/components/ResultPendingLoader'

const CRITERIA = [
  { key: 'task_response',    label: 'Task Response / Task Achievement', feedbackKey: 'task_feedback'      as const, bandKey: 'task_achievement' as const, detailKey: 'task_response'    as const },
  { key: 'coherence',       label: 'Coherence & Cohesion',             feedbackKey: 'coherence_feedback'  as const, bandKey: 'coherence_cohesion' as const, detailKey: 'coherence_cohesion' as const },
  { key: 'lexical',         label: 'Lexical Resource',                 feedbackKey: 'lexical_feedback'    as const, bandKey: 'lexical_resource'  as const, detailKey: 'lexical_resource'  as const },
  { key: 'grammar',         label: 'Grammatical Range & Accuracy',     feedbackKey: 'grammar_feedback'    as const, bandKey: 'grammatical_range' as const, detailKey: 'grammatical_range' as const },
]

function SectionTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="pb-3 border-b border-slate-400 mb-5">
      <h2 className="text-[15px] font-bold text-slate-900">
        <span className="text-slate-400 mr-1">{n}.</span>
        {title}
      </h2>
    </div>
  )
}

function BandPill({ band }: { band: number }) {
  const color =
    band >= 7 ? 'text-emerald-700 bg-emerald-50 ring-emerald-200' :
    band >= 5.5 ? 'text-blue-700 bg-blue-50 ring-blue-200' :
    band >= 4 ? 'text-amber-700 bg-amber-50 ring-amber-200' : 'text-red-700 bg-red-50 ring-red-200'
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ring-1 ${color}`}>
      Band {band}
    </span>
  )
}

export default async function ResultPage({ params }: { params: Promise<{ submissionId: string }> }) {
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

  const result = submission.writing_results as WritingResult | null

  if (!result) {
    return <ResultPendingLoader submissionId={submissionId} />
  }

  const rawTask = submission.task_type ?? submission.writing_prompts?.task_type
  const taskLabel = rawTask && TASK_TYPE_LABELS[rawTask as keyof typeof TASK_TYPE_LABELS]
    ? TASK_TYPE_LABELS[rawTask as keyof typeof TASK_TYPE_LABELS]
    : 'Writing'

  const corrections = result.corrections ?? []
  const vocabImprovements: VocabularyImprovement[] = result.vocabulary_improvements ?? []
  const sentenceImprovements: SentenceImprovement[] = result.sentence_improvements ?? []
  const criteriaDetail = result.criteria_detail
  const priorityImprovements: string[] = result.priority_improvements ?? []

  let sectionN = 1

  return (
    <div className="max-w-5xl space-y-4 pb-16 text-[15px] leading-7">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
        <Link href="/writing" className="hover:text-emerald-600 transition-colors">Writing Checker</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{taskLabel}</span>
      </div>

      {/* ── Section 1: Overall Band Score ── */}
      <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
        <SectionTitle n={sectionN++} title={`Estimated Overall Band Score: ${result.overall_band}`} />
        <div className="flex items-center gap-5 mb-5">
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center">
            <span className="text-4xl font-bold text-white leading-none">{result.overall_band}</span>
          </div>
          <div className="text-sm text-slate-500">
            <p className="font-semibold text-slate-800 text-base mb-0.5">{taskLabel}</p>
            <p>{submission.word_count} words submitted</p>
          </div>
        </div>
        {result.summary && (
          <p className="text-slate-700 leading-7">{result.summary}</p>
        )}
      </section>

      {/* ── Section 2: Criteria Scores ── */}
      <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
        <SectionTitle n={sectionN++} title="Criteria Scores" />
        <div className="space-y-0">
          {CRITERIA.map(c => (
            <div key={c.key} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
              <span className="flex-1 text-slate-700">{c.label}</span>
              <div className="w-28 bg-slate-100 rounded-full h-1.5 shrink-0">
                <div
                  className={`h-1.5 rounded-full ${result[c.bandKey] >= 7 ? 'bg-emerald-500' : result[c.bandKey] >= 5.5 ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${(result[c.bandKey] / 9) * 100}%` }}
                />
              </div>
              <span className="font-bold text-slate-900 w-7 text-right shrink-0">{result[c.bandKey]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Detailed Evaluation ── */}
      <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
        <SectionTitle n={sectionN++} title="Detailed Evaluation by Criteria" />
        <div className="space-y-4">
          {CRITERIA.map(c => {
            const detail: CriterionDetail | undefined = criteriaDetail?.[c.detailKey]
            return (
              <div key={c.key} className="rounded-xl p-5 bg-slate-50/60">
                {/* Criterion header */}
                <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">{c.label}</h3>
                  <BandPill band={result[c.bandKey]} />
                </div>

                {detail?.to_reach ? (
                  /* ── New format ── */
                  <>
                    {detail.strengths.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-3">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Strengths
                        </p>
                        <ul className="space-y-1.5">
                          {detail.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-emerald-900 flex items-start gap-2 leading-snug">
                              <span className="text-emerald-400 shrink-0 mt-0.5 font-bold">·</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detail.needs_improvement && detail.needs_improvement.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-3">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Needs Improvement
                        </p>
                        <ul className="space-y-1.5">
                          {detail.needs_improvement.map((n: string, i: number) => (
                            <li key={i} className="text-sm text-red-900 flex items-start gap-2 leading-snug">
                              <span className="text-red-400 shrink-0 mt-0.5 font-bold">·</span>
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                      <span className="text-amber-500 text-sm shrink-0 mt-0.5">↑</span>
                      <div>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide mr-1.5">To reach the next band:</span>
                        <span className="text-sm text-amber-900">{detail.to_reach}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── Old format — backward compat ── */
                  <>
                    <p className="text-slate-700 leading-7 mb-4">
                      {result[c.feedbackKey]}
                    </p>

                    {detail?.evidence && detail.evidence.length > 0 && (
                      <div className="mb-4 bg-slate-100/70 border-2 border-emerald-600 rounded-lg p-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evidence from your essay</p>
                        <ul className="space-y-1">
                          {detail.evidence.map((e: string, i: number) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2 leading-snug">
                              <span className="text-slate-400 shrink-0 mt-0.5">•</span>
                              <span className="italic">{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {detail && (detail.strengths.length > 0 || (detail.weaknesses && detail.weaknesses.length > 0)) && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {detail.strengths.length > 0 && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Strengths
                            </p>
                            <ul className="space-y-1.5">
                              {detail.strengths.map((s: string, i: number) => (
                                <li key={i} className="text-sm text-emerald-900 flex items-start gap-2 leading-snug">
                                  <span className="text-emerald-400 shrink-0 mt-0.5 font-bold">·</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {detail.weaknesses && detail.weaknesses.length > 0 && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Areas to Improve
                            </p>
                            <ul className="space-y-1.5">
                              {detail.weaknesses.map((w: string, i: number) => (
                                <li key={i} className="text-sm text-red-900 flex items-start gap-2 leading-snug">
                                  <span className="text-red-400 shrink-0 mt-0.5 font-bold">·</span>
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {detail?.why_not_higher && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                        <span className="text-amber-500 text-sm shrink-0 mt-0.5">↑</span>
                        <div>
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide mr-1.5">To reach the next band:</span>
                          <span className="text-sm text-amber-900">{detail.why_not_higher}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Section 4: Error Corrections ── */}
      {corrections.length > 0 && (
        <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
          <SectionTitle n={sectionN++} title={`Error Identification & Correction (${corrections.length} found)`} />
          <CorrectionsSection corrections={corrections} />
        </section>
      )}

      {/* ── Priority Improvements ── */}
      {priorityImprovements.length > 0 && (
        <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
          <SectionTitle n={sectionN++} title="Priority Action Plan" />
          <div className="space-y-3">
            {priorityImprovements.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-amber-900 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 5: Vocabulary Improvements ── */}
      {vocabImprovements.length > 0 && (
        <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
          <SectionTitle n={sectionN++} title="Vocabulary Improvements" />
          <div className="space-y-3">
            {vocabImprovements.map((v: VocabularyImprovement, i: number) => (
              <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm pl-4 border-l-2 border-slate-400">
                <span className="text-slate-500 line-through">{v.original}</span>
                <span className="text-slate-400">→</span>
                <span className="font-semibold text-emerald-700">{v.suggested ?? v.suggestion}</span>
                <span className="text-slate-400 text-xs">— {v.explanation}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 6: Sentence Improvements ── */}
      {sentenceImprovements.length > 0 && (
        <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
          <SectionTitle n={sectionN++} title="Sentence Improvements" />
          <div className="space-y-4">
            {sentenceImprovements.map((s: SentenceImprovement, i: number) => (
              <div key={i} className="border-2 border-emerald-600 rounded-xl overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Original</p>
                  <p className="text-sm italic text-slate-600">&ldquo;{s.original}&rdquo;</p>
                </div>
                <div className="bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Improved</p>
                  <p className="text-sm text-emerald-900 font-medium">&ldquo;{s.improved}&rdquo;</p>
                  {s.explanation && <p className="text-xs text-slate-400 mt-1.5">{s.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Upgraded Essay ── */}
      <UpgradedEssaySection
        submissionId={submissionId}
        existingEssay={result.upgraded_essay}
        targetBand={result.target_band ?? Math.min(result.overall_band + 1, 9)}
        sectionN={sectionN++}
      />

      {/* ── Teacher feedback (if any) ── */}
      {result.teacher_feedback && (
        <div className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md text-sm">
          <p className="font-semibold text-emerald-900 mb-1">Teacher Feedback</p>
          {result.teacher_score && (
            <p className="text-emerald-700 mb-2 text-xs">Teacher score: <strong>Band {result.teacher_score}</strong></p>
          )}
          <p className="text-emerald-800 leading-7">{result.teacher_feedback}</p>
        </div>
      )}

      {/* ── Original Submission ── */}
      <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md">
        <SectionTitle n={sectionN} title="Your Submission" />
        {submission.question && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question</p>
            <p className="text-slate-700 leading-7 whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border-2 border-emerald-600">
              {submission.question}
            </p>
          </div>
        )}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Essay · {submission.word_count} words
        </p>
        <div className="text-slate-700 leading-7 whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border-2 border-emerald-600 font-mono text-[13px]">
          {submission.response_text}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <Link
          href="/writing"
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
        >
          Check Another Essay
        </Link>
        <Link href="/history" className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
          View History
        </Link>
      </div>

      <p className="text-xs text-slate-400">
        * AI-estimated band scores are for practice only — not official IELTS results.
      </p>
    </div>
  )
}
