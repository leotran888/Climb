'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BAND_OPTIONS = ['', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatBox({ label, value, warm }: { label: string; value: string; warm?: boolean }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-black ${warm ? 'text-[#f5aa00]' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}

export default function GoalsForm({
  userId,
  initial,
}: {
  userId: string
  initial: { target_band: number | null; target_writing: number | null; target_speaking: number | null; exam_date: string | null }
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="Band mục tiêu"     value={overall ? overall : '—'} warm />
          <StatBox label="Ngày thi dự kiến"  value={formatDate(examDate)} />
          <StatBox label="Writing mục tiêu"  value={writing ? writing : '—'} />
        </div>
        <button
          onClick={() => setEditing(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors btn-press"
        >
          Cập nhật mục tiêu
        </button>
        {msg && <span className="text-xs font-medium text-emerald-600">{msg}</span>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Target Overall', value: overall, set: setOverall },
          { label: 'Target Writing', value: writing, set: setWriting },
        ].map(f => (
          <div key={f.label}>
            <label className="text-xs font-semibold text-slate-500 block mb-1">{f.label}</label>
            <select
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {BAND_OPTIONS.map(b => (
                <option key={b} value={b}>{b ? `Band ${b}` : '— Chưa đặt —'}</option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Ngày thi dự kiến</label>
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 btn-press"
        >
          {loading ? 'Đang lưu…' : 'Lưu mục tiêu'}
        </button>
        <button
          onClick={() => { setEditing(false); setMsg('') }}
          className="text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors"
        >
          Huỷ
        </button>
        {msg && <span className={`text-xs font-medium ${msg.startsWith('Lỗi') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
