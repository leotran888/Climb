'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BAND_OPTIONS = ['', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']

export default function GoalsForm({
  userId,
  initial,
}: {
  userId: string
  initial: { target_band: number | null; target_writing: number | null; target_speaking: number | null; exam_date: string | null }
}) {
  const [overall, setOverall]   = useState(initial.target_band?.toString() ?? '')
  const [writing, setWriting]   = useState(initial.target_writing?.toString() ?? '')
  const [speaking, setSpeaking] = useState(initial.target_speaking?.toString() ?? '')
  const [examDate, setExamDate] = useState(initial.exam_date ?? '')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  async function handleSave() {
    setLoading(true)
    setMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      target_band:     overall  ? parseFloat(overall)  : null,
      target_writing:  writing  ? parseFloat(writing)  : null,
      target_speaking: speaking ? parseFloat(speaking) : null,
      exam_date:       examDate || null,
    }).eq('user_id', userId)
    setMsg(error ? 'Lỗi: ' + error.message : 'Đã lưu!')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Target Overall', value: overall, set: setOverall },
          { label: 'Target Writing', value: writing, set: setWriting },
          { label: 'Target Speaking', value: speaking, set: setSpeaking },
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
      </div>
      <div className="max-w-xs">
        <label className="text-xs font-semibold text-slate-500 block mb-1">Ngày thi dự kiến</label>
        <input
          type="date"
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 btn-press"
        >
          {loading ? 'Đang lưu…' : 'Lưu mục tiêu'}
        </button>
        {msg && <span className={`text-xs font-medium ${msg.startsWith('Lỗi') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
