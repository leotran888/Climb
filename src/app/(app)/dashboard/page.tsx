import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingSubmission, TASK_TYPE_LABELS } from '@/lib/types'
function BlobCharStatic({ shade }: { shade: string }) {
  return (
    <svg viewBox="0 0 180 124" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[140px] mx-auto block">
      <ellipse cx="90" cy="68" rx="68" ry="52" fill={shade}/>
      <circle cx="66" cy="58" r="13" fill="white"/>
      <circle cx="114" cy="58" r="13" fill="white"/>
      <circle cx="69" cy="61" r="8" fill="#0a0a0a"/>
      <circle cx="117" cy="61" r="8" fill="#0a0a0a"/>
      <circle cx="64" cy="56" r="3" fill="white"/>
      <circle cx="112" cy="56" r="3" fill="white"/>
      <path d="M 66 86 Q 90 102 114 86" fill="none" stroke="#0a0a0a" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  )
}
import ExamCountdownWidget from '@/components/ExamCountdownWidget'
import StreakWidget from '@/components/StreakWidget'


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()

  const [{ data: profile }, { data: submissions }, { data: activityRaw }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase
      .from('writing_submissions')
      .select('*, writing_prompts(task_type, title), writing_results(overall_band)')
      .eq('user_id', user!.id)
      .order('submitted_at', { ascending: false })
      .limit(5),
    supabase
      .from('writing_submissions')
      .select('submitted_at')
      .eq('user_id', user!.id)
      .gte('submitted_at', ninetyDaysAgo)
      .order('submitted_at', { ascending: false }),
  ])

  // Convert to Vietnam dates (UTC+7) and deduplicate
  function toVnDate(iso: string) {
    return new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().split('T')[0]
  }
  const activityDates = [...new Set((activityRaw ?? []).map(r => toVnDate(r.submitted_at)))]

  // Streak calculation
  function computeStreak(dates: string[]): number {
    if (!dates.length) return 0
    const today = toVnDate(new Date().toISOString())
    const yesterday = toVnDate(new Date(Date.now() - 86400000).toISOString())
    if (dates[0] !== today && dates[0] !== yesterday) return 0
    let streak = 0
    let cur = dates[0]
    for (const d of dates) {
      if (d === cur) {
        streak++
        cur = toVnDate(new Date(new Date(cur).getTime() - 86400000).toISOString())
      }
    }
    return streak
  }
  const streak = computeStreak(activityDates)

  // Current week (Mon–Sun) activity
  const todayVn = toVnDate(new Date().toISOString())
  const todayDate = new Date(todayVn)
  const dayOfWeek = todayDate.getDay() // 0=Sun,1=Mon,...,6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayDate)
    d.setDate(todayDate.getDate() + mondayOffset + i)
    return d.toISOString().split('T')[0]
  })
  const DAY_LABELS = ['T2','T3','T4','T5','T6','T7','CN']

  // Current month calendar
  const now = new Date(todayVn)
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0=Sun
  const calendarOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // shift to Mon-start
  const activitySet = new Set(activityDates)

  const typedSubmissions = (submissions ?? []) as WritingSubmission[]
  const bandScores = typedSubmissions
    .map(s => s.writing_results?.overall_band)
    .filter((b): b is number => b !== undefined && b !== null)

  const latestBand = bandScores[0] ?? null
  const avgBand = bandScores.length
    ? Math.round((bandScores.reduce((a, b) => a + b, 0) / bandScores.length) * 2) / 2
    : null

  const firstName = profile?.full_name?.split(' ')[0] ?? 'bạn'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  function getSubmissionTitle(sub: WritingSubmission) {
    if (sub.writing_prompts?.title) return sub.writing_prompts.title
    if (sub.question) return sub.question.slice(0, 70) + (sub.question.length > 70 ? '…' : '')
    const type = sub.task_type ?? sub.writing_prompts?.task_type
    return type && TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS] + ' Submission'
      : 'Writing Submission'
  }

  function getSubmissionType(sub: WritingSubmission) {
    const type = sub.task_type ?? sub.writing_prompts?.task_type
    return type && TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      : ''
  }

  return (
    <div className="space-y-4 pb-8">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-600 font-bold text-xs mb-0.5">{greeting}, {firstName} ✦</p>
          <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
        </div>
        {profile?.target_band && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 text-center">
            <p className="text-xs text-emerald-600 font-semibold">Target</p>
            <p className="text-2xl font-black text-emerald-600">{profile.target_band}</p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-[20px] border border-[rgba(22,163,68,.13)] p-4 card-hover" style={{ boxShadow: '0 2px 12px rgba(22,163,68,.07)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-[#5a7864] uppercase tracking-wider">Điểm mới nhất</p>
            <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
              <span className="text-xs">📊</span>
            </div>
          </div>
          <p className="text-3xl font-black text-[#16a344]">{latestBand ?? '—'}</p>
          <p className="text-xs text-[#5a7864] mt-0.5">AI estimate</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[rgba(22,163,68,.13)] p-4 card-hover" style={{ boxShadow: '0 2px 12px rgba(22,163,68,.07)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-[#5a7864] uppercase tracking-wider">Trung bình</p>
            <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
              <span className="text-xs">📈</span>
            </div>
          </div>
          <p className="text-3xl font-black text-amber-500">{avgBand ?? '—'}</p>
          <p className="text-xs text-[#5a7864] mt-0.5">{bandScores.length} bài đã nộp</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[rgba(22,163,68,.13)] p-4 card-hover" style={{ boxShadow: '0 2px 12px rgba(22,163,68,.07)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-[#5a7864] uppercase tracking-wider">Từ đã học</p>
            <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-xs">📚</span>
            </div>
          </div>
          <p className="text-3xl font-black text-purple-600">—</p>
          <p className="text-xs text-[#5a7864] mt-0.5">
            <Link href="/vocabulary" className="hover:text-purple-600 transition-colors">Mở sổ từ vựng →</Link>
          </p>
        </div>
      </div>

      {/* ── Night Sky Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">

        {/* Streak (col-span-3) — with expandable calendar */}
        <div className="md:col-span-3">
          <StreakWidget
            streak={streak}
            weekDays={weekDays}
            activityDates={activityDates}
            todayVn={todayVn}
            dayLabels={DAY_LABELS}
            year={year}
            month={month}
            daysInMonth={daysInMonth}
            calendarOffset={calendarOffset}
            monthLabel={new Date(year, month).toLocaleDateString('vi-VN', { month:'long', year:'numeric' })}
            currentDay={now.getDate()}
          />
        </div>

        {/* Exam countdown (col-span-2) */}
        <div className="md:col-span-2">
          <ExamCountdownWidget examDate={profile?.exam_date ?? null} userId={user!.id} />
        </div>
      </div>

      {/* Practice cards */}
      <div>
        <h2 className="text-sm font-black text-slate-900 mb-2">Luyện tập ngay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Writing */}
          <Link href="/writing" className="group block">
            <div
              className="rounded-[24px] overflow-hidden flex flex-col transition-all duration-200 group-hover:-translate-y-1"
              style={{ background: '#16a344', minHeight: '210px', boxShadow: '0 6px 24px rgba(22,163,68,0.25)' }}
            >
              <div className="p-5 flex-1">
                <div className="w-11 h-11 bg-white/90 rounded-2xl flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xl font-black text-white">Writing</h3>
                  <span className="text-white/40">✦</span>
                </div>
                <p className="text-white/70 text-sm leading-snug">AI chấm điểm & nhận xét theo tiêu chí IELTS bằng tiếng Việt.</p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-black/15 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  Bắt đầu ngay
                </div>
              </div>
              <div className="px-6 flex justify-start -mb-1">
                <BlobCharStatic shade="rgba(0,0,0,0.15)"/>
              </div>
            </div>
          </Link>


        </div>
      </div>

      {/* Vocabulary card */}
      <Link href="/vocabulary" className="group block">
        <div
          className="rounded-[24px] p-6 flex items-center justify-between transition-all duration-200 group-hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 20px rgba(124,58,237,0.2)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Sổ từ vựng</h3>
              <p className="text-white/60 text-sm">Ghi chép từ mới, ôn luyện qua flashcard 3D</p>
            </div>
          </div>
          <div className="text-white/50 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </Link>

      {/* Recent submissions */}
      {typedSubmissions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-900">Bài làm gần đây</h2>
            <Link href="/history" className="text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="bg-white rounded-[20px] border border-[rgba(22,163,68,.13)] divide-y divide-[rgba(22,163,68,.07)] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(22,163,68,.07)' }}>
            {typedSubmissions.map(sub => (
              <Link
                key={sub.id}
                href={`/writing/result/${sub.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors duration-150 group"
              >
                <div className="min-w-0 mr-4">
                  <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                    {getSubmissionTitle(sub)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {getSubmissionType(sub)} · {new Date(sub.submitted_at).toLocaleDateString('vi-VN')} · {sub.word_count} từ
                  </p>
                </div>
                <div className="shrink-0">
                  {sub.writing_results?.overall_band ? (
                    <span className="bg-emerald-50 text-emerald-700 font-black text-sm px-3 py-1 rounded-full border border-emerald-100">
                      Band {sub.writing_results.overall_band}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-sm">Đang phân tích…</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {typedSubmissions.length === 0 && (
        <div className="text-center py-14 bg-white rounded-[20px] border border-[rgba(22,163,68,.13)]" style={{ boxShadow: '0 2px 12px rgba(22,163,68,.07)' }}>
          <div className="text-4xl mb-3">✍️</div>
          <p className="text-slate-700 font-black text-lg">Chưa có bài nào</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Nộp bài viết IELTS đầu tiên để nhận phản hồi từ AI.</p>
          <Link
            href="/writing"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors btn-press inline-block"
          >
            Bắt đầu luyện Writing →
          </Link>
        </div>
      )}

    </div>
  )
}
