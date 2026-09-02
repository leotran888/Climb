'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BAND_OPTIONS = ['', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function GoalsForm({
  userId,
  initial,
  avgWritingBand,
}: {
  userId: string
  initial: { target_band: number | null; target_writing: number | null; target_speaking: number | null; exam_date: string | null }
  avgWritingBand?: number | null
}) {
  const [editing, setEditing] = useState(false)
  const [overall, setOverall]   = useState(initial.target_band?.toString() ?? '')
  const [writing, setWriting]   = useState(initial.target_writing?.toString() ?? '')
  const [examDate, setExamDate] = useState(initial.exam_date ?? '')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  async function handleSave() {
    setLoading(true)
    setMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      target_band:    overall  ? parseFloat(overall)  : null,
      target_writing: writing  ? parseFloat(writing)  : null,
      exam_date:      examDate || null,
    }).eq('user_id', userId)
    if (error) {
      setMsg('Lỗi: ' + error.message)
    } else {
      setMsg('Đã lưu!')
      setEditing(false)
    }
    setLoading(false)
  }

  if (!editing) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 0 }}>
          {/* Writing mục tiêu — accent green, ưu tiên đầu */}
          <div style={{ background: '#f3f8f4', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Writing mục tiêu</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: writing ? '#16a344' : '#192e1e' }}>{writing || '—'}</p>
          </div>
          {/* Ngày thi */}
          <div style={{ background: '#f3f8f4', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Ngày thi dự kiến</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#192e1e' }}>{formatDate(examDate)}</p>
          </div>
          {/* Khoảng cách tới mục tiêu */}
          {(() => {
            const target = writing ? parseFloat(writing) : null
            const gap = target != null && avgWritingBand != null
              ? Math.round((target - avgWritingBand) * 10) / 10
              : null
            const achieved = gap !== null && gap <= 0
            const gapColor = achieved ? '#16a344' : gap !== null && gap <= 0.5 ? '#f5aa00' : '#192e1e'
            return (
              <div style={{ background: '#f3f8f4', borderRadius: 14, padding: '14px 16px' }}>
                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Khoảng cách</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: gapColor }}>
                  {achieved ? 'Đã đạt ✓' : gap !== null ? `+${gap}` : avgWritingBand != null ? `—` : '—'}
                </p>
                {gap !== null && !achieved && (
                  <p style={{ fontSize: 10, color: '#5a7864', fontWeight: 600, marginTop: 2 }}>band còn thiếu</p>
                )}
              </div>
            )
          })()}
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setEditing(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#16a344', color: '#fff', border: 'none', borderRadius: 50, padding: '10px 22px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
          >
            Cập nhật mục tiêu
          </button>
          {msg && <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 600, color: '#16a344' }}>{msg}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Writing mục tiêu', value: writing, set: setWriting },
        ].map((f) => (
          <div key={f.label}>
            <label style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 8, display: 'block' }}>{f.label}</label>
            <select
              value={f.value}
              onChange={e => f.set(e.target.value)}
              style={{ width: '100%', border: '1.5px solid rgba(22,163,68,0.2)', borderRadius: 14, padding: '10px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: '#fff', color: '#192e1e', outline: 'none' }}
            >
              {BAND_OPTIONS.map(b => (
                <option key={b} value={b}>{b ? `Band ${b}` : '— Chưa đặt —'}</option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 8, display: 'block' }}>Ngày thi dự kiến</label>
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            style={{ width: '100%', border: '1.5px solid rgba(22,163,68,0.2)', borderRadius: 14, padding: '10px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#192e1e', outline: 'none' }}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#16a344', color: '#fff', border: 'none', borderRadius: 50, padding: '10px 22px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Đang lưu…' : 'Lưu mục tiêu'}
        </button>
        <button
          onClick={() => { setEditing(false); setMsg('') }}
          style={{ fontSize: 13, fontWeight: 600, color: '#5a7864', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Huỷ
        </button>
        {msg && <span style={{ fontSize: 12, fontWeight: 600, color: msg.startsWith('Lỗi') ? '#ef4444' : '#16a344' }}>{msg}</span>}
      </div>
    </div>
  )
}
