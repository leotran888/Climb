import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WritingSubmission, TASK_TYPE_LABELS } from '@/lib/types'

const C = {
  green: '#16a344',
  greenBorder: 'rgba(22,163,68,.13)',
  greenBg: 'rgba(22,163,68,.07)',
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
  if (band >= 7.0) return { bg: 'rgba(22,163,68,.13)', color: '#16a344' }
  if (band >= 6.0) return { bg: 'rgba(22,163,68,.1)', color: '#16a344' }
  return { bg: 'rgba(245,170,0,.15)', color: '#d4900a' }
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
          {count > 0 ? `${count} bài nộp` : 'Chưa có bài nộp nào'}
        </p>
      </div>

      {count === 0 ? (
        <div style={{ background: '#fff', border: `1.5px solid ${C.greenBorder}`, borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📂</p>
          <p style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>Chưa có bài nào được chấm</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.hint, marginBottom: 20 }}>Các bài viết đã nộp sẽ xuất hiện ở đây.</p>
          <Link href="/writing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.green, color: '#fff', borderRadius: 50, padding: '10px 24px', fontWeight: 900, fontSize: 13, textDecoration: 'none' }}>
            Chấm bài ngay
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: `1.5px solid ${C.greenBorder}`, borderRadius: 20, overflow: 'hidden' }}>
          {typedSubmissions.map((sub, i) => {
            const band = sub.writing_results?.overall_band
            const bc = band ? bandColor(band) : null
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
                  padding: '14px 20px',
                  textDecoration: 'none',
                  borderTop: i > 0 ? `1px solid ${C.greenBorder}` : undefined,
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: C.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                    {getTitle(sub)}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.hint }}>
                    {meta}
                  </p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {bc ? (
                    <span style={{ background: bc.bg, color: bc.color, fontWeight: 800, fontSize: 13, padding: '4px 14px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                      {band}
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

      <style>{`.history-row:hover { background: rgba(22,163,68,.04) !important; }`}</style>
    </div>
  )
}
