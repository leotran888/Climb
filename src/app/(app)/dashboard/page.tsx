import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingSubmission, TASK_TYPE_LABELS } from '@/lib/types'

function relativeTime(isoStr: string) {
  const days = Math.floor((Date.now() - new Date(isoStr).getTime()) / 86400000)
  if (days === 0) return 'hôm nay'
  if (days === 1) return '1 ngày trước'
  return `${days} ngày trước`
}

function bandStyle(band: number) {
  if (band >= 6.5) return { background: 'rgba(22,163,68,.12)', color: '#0f7a33' }
  if (band >= 5.5) return { background: 'rgba(245,170,0,.15)', color: '#8a6100' }
  return { background: 'rgba(220,60,60,.1)', color: '#b03030' }
}

function getSubmissionTitle(sub: WritingSubmission) {
  if (sub.writing_prompts?.title) return sub.writing_prompts.title
  if (sub.question) return sub.question.slice(0, 72) + (sub.question.length > 72 ? '…' : '')
  const type = sub.task_type ?? sub.writing_prompts?.task_type
  return type && TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
    ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS] + ' Submission'
    : 'Writing Submission'
}

function getSubmissionMeta(sub: WritingSubmission) {
  const type = sub.task_type ?? sub.writing_prompts?.task_type
  const typeLabel = type && TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
    ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
    : 'Writing'
  return `${typeLabel} · ${sub.word_count ?? 0} từ · ${relativeTime(sub.submitted_at)}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()

  const [{ data: profile }, { data: submissions }, { data: activityRaw }, { data: vocabFolders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase
      .from('writing_submissions')
      .select('*, writing_prompts(task_type, title), writing_results(overall_band)')
      .eq('user_id', user!.id)
      .order('submitted_at', { ascending: false })
      .limit(3),
    supabase
      .from('writing_submissions')
      .select('submitted_at')
      .eq('user_id', user!.id)
      .gte('submitted_at', ninetyDaysAgo)
      .order('submitted_at', { ascending: false }),
    supabase
      .from('vocab_folders')
      .select('vocab_words(status)')
      .eq('user_id', user!.id),
  ])

  // Vocab counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allWords = (vocabFolders ?? []).flatMap((f: any) => f.vocab_words ?? [])
  const totalWords = allWords.length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const knownCount = allWords.filter((w: any) => w.status === 'known').length

  // Streak
  function toVnDate(iso: string) {
    return new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().split('T')[0]
  }
  const activityDates = [...new Set((activityRaw ?? []).map(r => toVnDate(r.submitted_at)))]

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

  // Band scores
  const typedSubmissions = (submissions ?? []) as WritingSubmission[]
  const bandScores = typedSubmissions
    .map(s => s.writing_results?.overall_band)
    .filter((b): b is number => b !== undefined && b !== null)
  const latestBand = bandScores[0] ?? null
  const avgBand = bandScores.length
    ? Math.round((bandScores.reduce((a, b) => a + b, 0) / bandScores.length) * 2) / 2
    : null

  // Greeting (Vietnam time UTC+7)
  const nowVN = new Date(Date.now() + 7 * 3600 * 1000)
  const hour = nowVN.getUTCHours()
  const greetVi = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const greetEmoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙'
  const dayNamesVi = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const dayNameVi = dayNamesVi[nowVN.getUTCDay()]
  const dateStrVi = nowVN.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', timeZone: 'UTC' })
  const firstName = profile?.full_name?.split(' ').pop() ?? 'bạn'

  // Shared style tokens
  const CARD = { background: '#fff', border: '1.5px solid rgba(22,163,68,0.13)', borderRadius: 20, padding: 24 }
  const STAT_CARD = { background: '#fff', border: '1.5px solid rgba(22,163,68,0.13)', borderRadius: 16, padding: '18px 20px' }

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* ── Greeting ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#192e1e' }}>
            {greetVi}, {firstName} {greetEmoji}
          </h2>
          <p style={{ fontSize: 14, color: '#5a7864', fontWeight: 600, marginTop: 2 }}>
            {dayNameVi}, {dateStrVi} · Hãy luyện tập đều đặn mỗi ngày
          </p>
        </div>
        {profile?.target_band && (() => {
          const daysLeft = profile.exam_date
            ? Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / 86400000)
            : null
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
              <div style={{ background: 'rgba(245,170,0,.1)', border: '1.5px solid rgba(245,170,0,.3)', borderRadius: 14, padding: '8px 16px', textAlign: 'right' }}>
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b87d00', marginBottom: 2 }}>Mục tiêu</p>
                <p style={{ fontSize: 17, fontWeight: 900, color: '#8a5e00', lineHeight: 1 }}>Band {profile.target_band}</p>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: '#5a7864' }}>
                  còn <span style={{ fontWeight: 900, color: '#192e1e' }}>{daysLeft}</span> ngày tới ngày thi
                </p>
              )}
              {daysLeft !== null && daysLeft <= 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: '#b87d00' }}>Đã tới ngày thi rồi!</p>
              )}
            </div>
          )
        })()}
      </div>

      {/* ── 4-stat grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {/* Band gần nhất */}
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Band gần nhất</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: latestBand ? '#f5aa00' : '#192e1e' }}>{latestBand ?? '—'}</p>
          <p style={{ fontSize: 11, color: '#5a7864', fontWeight: 600, marginTop: 4 }}>
            {typedSubmissions[0] ? getSubmissionMeta(typedSubmissions[0]).split(' · ').slice(0, 2).join(' · ') : 'Chưa có bài nào'}
          </p>
        </div>

        {/* Band trung bình */}
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Band trung bình</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#16a344' }}>{avgBand ?? '—'}</p>
          <p style={{ fontSize: 11, color: '#5a7864', fontWeight: 600, marginTop: 4 }}>Từ {bandScores.length} bài nộp</p>
        </div>

        {/* Streak */}
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Streak</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: streak > 0 ? '#e85d04' : '#192e1e' }}>
            {streak > 0 ? `🔥 ${streak}` : '—'}
          </p>
          <p style={{ fontSize: 11, color: '#5a7864', fontWeight: 600, marginTop: 4 }}>Ngày liên tiếp</p>
        </div>

        {/* Từ vựng */}
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Từ vựng</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#16a344' }}>{totalWords || '—'}</p>
          <p style={{ fontSize: 11, color: '#5a7864', fontWeight: 600, marginTop: 4 }}>
            {totalWords ? `${knownCount} đã thuộc` : 'Chưa có từ nào'}
          </p>
        </div>
      </div>

      {/* ── Practice grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Writing AI */}
        <Link href="/writing" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #1b6b38 0%, #16a344 100%)', borderRadius: 20, padding: 24, cursor: 'pointer' }}>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 10 }}>Writing AI</p>
            <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2, color: '#fff' }}>Nộp bài viết<br />để chấm điểm</p>
            <p style={{ fontSize: 12, fontWeight: 600, marginTop: 6, lineHeight: 1.5, color: 'rgba(255,255,255,.6)' }}>
              AI chấm 4 tiêu chí, viết lại bài đạt band mục tiêu của bạn.
            </p>
            <button style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, padding: '9px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.2)', color: '#fff' }}>
              Bắt đầu viết →
            </button>
          </div>
        </Link>

        {/* Từ vựng */}
        <Link href="/vocabulary" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#f3f8f4', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 20, padding: 24, cursor: 'pointer', height: '100%' }}>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 10 }}>Từ vựng</p>
            <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2, color: '#192e1e' }}>Sổ từ vựng<br />IELTS của bạn</p>
            <p style={{ fontSize: 12, fontWeight: 600, marginTop: 6, lineHeight: 1.5, color: '#5a7864' }}>
              Ghi chép từ mới, ôn luyện qua flashcard thông minh theo topic.
            </p>
            <button style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, padding: '9px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#16a344', color: '#fff' }}>
              Khám phá ngay →
            </button>
          </div>
        </Link>
      </div>

      {/* ── Recent submissions ── */}
      {typedSubmissions.length > 0 && (
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#192e1e', margin: 0 }}>Bài nộp gần đây</p>
            <Link href="/history" style={{ fontSize: 12, fontWeight: 800, color: '#16a344', textDecoration: 'none' }}>
              Xem tất cả →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {typedSubmissions.map(sub => {
              const band = sub.writing_results?.overall_band
              return (
                <Link key={sub.id} href={`/writing/result/${sub.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 14, cursor: 'pointer', transition: 'box-shadow .15s' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#192e1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                        {getSubmissionTitle(sub)}
                      </p>
                      <p style={{ fontSize: 11, color: '#5a7864', fontWeight: 600 }}>
                        {getSubmissionMeta(sub)}
                      </p>
                    </div>
                    {band != null ? (
                      <span style={{ ...bandStyle(band), padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                        {band}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#5a7864', flexShrink: 0 }}>Đang phân tích…</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {typedSubmissions.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#192e1e', marginBottom: 6 }}>Chưa có bài nào</p>
          <p style={{ fontSize: 13, color: '#5a7864', fontWeight: 600, marginBottom: 20 }}>Nộp bài viết IELTS đầu tiên để nhận phản hồi từ AI.</p>
          <Link
            href="/writing"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a344', color: '#fff', borderRadius: 50, padding: '10px 24px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}
          >
            Bắt đầu luyện Writing →
          </Link>
        </div>
      )}

    </div>
  )
}
