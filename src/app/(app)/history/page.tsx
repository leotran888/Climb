import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingSubmission, TASK_TYPE_LABELS } from '@/lib/types'

const C = {
  green: '#16a344',
  greenBorder: 'rgba(22,163,68,.13)',
  text: '#192e1e',
  muted: '#3d5a47',
  hint: '#7a9e87',
}

function relativeTime(iso: string): string {
  const nowVn = Date.now() + 7 * 3600000
  const subVn = new Date(iso).getTime() + 7 * 3600000
  const diff = Math.floor(nowVn / 86400000) - Math.floor(subVn / 86400000)
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'Hôm qua'
  if (diff < 30) return `${diff} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

function getTaskLabel(sub: WritingSubmission): string {
  const type = sub.task_type ?? sub.writing_prompts?.task_type
  const map: Record<string, string> = {
    academic_task1: 'Academic Task 1',
    general_task1: 'General Task 1',
    task2: 'Task 2',
  }
  return type ? (map[type] ?? type) : ''
}

function bandColor(band: number): { bg: string; color: string } {
  if (band >= 6.0) return { bg: 'rgba(22,163,68,.12)', color: '#0f7a33' }
  return { bg: 'rgba(245,170,0,.15)', color: '#8a6100' }
}

function iconStroke(band: number | undefined): string {
  if (!band || band < 6.0) return '#5a7864'
  return '#16a344'
}

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
      ? TASK_TYPE_LABELS[type as keyof typeof TASK_TYPE_LABELS]
      : 'Bài viết'
  }

  const count = typedSubmissions.length

  // Subtitle: "12 bài · Task 1 và Task 2"
  const taskGroups = [...new Set(typedSubmissions.map(s => {
    const type = s.task_type ?? s.writing_prompts?.task_type
    if (!type) return null
    return type === 'task2' ? 'Task 2' : 'Task 1'
  }).filter(Boolean))] as string[]
  const taskStr = taskGroups.sort().join(' và ')
  const subtitle = count > 0 ? `${count} bài · ${taskStr}` : 'Chưa có bài nộp nào'

  return (
    <div style={{ paddingTop: 20, paddingBottom: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: C.green, marginBottom: 4 }}>
          ✦ Lịch sử nộp bài
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 4 }}>
          Tất cả bài viết
        </h1>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>
          {subtitle}
        </p>
      </div>

      {count === 0 ? (
        <div style={{ background: '#fff', border: `1.5px solid ${C.greenBorder}`, borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📂</p>
          <p style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>Chưa có bài nào được chấm</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.hint, marginBottom: 20 }}>Các bài viết đã nộp sẽ xuất hiện ở đây.</p>
          <Link href="/writing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.green, color: '#fff', borderRadius: 50, padding: '10px 24px', fontWeight: 900, fontSize: 13, textDecoration: 'none' }}>
            Chấm bài ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {typedSubmissions.map((sub) => {
            const band = sub.writing_results?.overall_band
            const bc = band ? bandColor(band) : null
            const stroke = iconStroke(band)
            const isGood = !!(band && band >= 6.0)
            const taskLabel = getTaskLabel(sub)
            const meta = [taskLabel, sub.word_count ? `${sub.word_count} từ` : null, relativeTime(sub.submitted_at)].filter(Boolean).join(' · ')
            return (
              <Link
                key={sub.id}
                href={`/writing/result/${sub.id}`}
                className="history-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  background: '#fff',
                  border: `1.5px solid ${C.greenBorder}`,
                  borderRadius: 16,
                  textDecoration: 'none',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f3f8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="3" width="14" height="18" rx="2" stroke={stroke} strokeWidth="2"/>
                    <line x1="8" y1="8" x2="16" y2="8" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
                    {isGood && <line x1="8" y1="12" x2="14" y2="12" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>}
                  </svg>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {getTitle(sub)}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.hint }}>
                    {meta}
                  </p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {bc ? (
                    <span style={{ background: bc.bg, color: bc.color, fontWeight: 800, fontSize: 13, padding: '5px 14px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                      {Number(band).toFixed(1)}
                    </span>
                  ) : (
                    <span style={{ color: C.hint, fontSize: 12, fontWeight: 600 }}>—</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <style>{`.history-row:hover { background: rgba(22,163,68,.03) !important; }`}</style>
    </div>
  )
}
