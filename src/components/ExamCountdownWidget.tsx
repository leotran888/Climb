'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  examDate: string | null
  userId: string
}

function Stars() {
  const pts = [
    [12,18],[45,8],[68,22],[85,12],[20,72],[55,60],[78,75],[35,45],[90,50],[10,50],
    [62,35],[30,85],[72,88],[48,15],[15,92],
  ]
  return (
    <>
      {pts.map(([l,t],i) => (
        <div key={i} className="absolute rounded-full bg-white/50"
          style={{ left:`${l}%`, top:`${t}%`, width: i%3===0?2:1, height: i%3===0?2:1 }} />
      ))}
      {/* shooting stars */}
      <div className="absolute" style={{ top:'18%', left:'55%', width:40, height:1, background:'linear-gradient(90deg, transparent, white)', transform:'rotate(-35deg)', opacity:0.5 }}/>
      <div className="absolute" style={{ top:'40%', left:'20%', width:24, height:1, background:'linear-gradient(90deg, transparent, white)', transform:'rotate(-35deg)', opacity:0.4 }}/>
    </>
  )
}

export default function ExamCountdownWidget({ examDate: initial, userId }: Props) {
  const [examDate, setExamDate] = useState(initial)
  const [open, setOpen] = useState(false)
  const [inputDate, setInputDate] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)

  const daysLeft = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000)
    : null

  async function save() {
    if (!inputDate) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ exam_date: inputDate }).eq('user_id', userId)
    setExamDate(inputDate)
    setOpen(false)
    setSaving(false)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden p-4 h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #0d1f4e 0%, #0a173b 100%)', minHeight: 0 }}>
      <Stars />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest">Đếm ngược kỳ thi</p>
          {/* Button */}
          <div className="relative">
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors text-white/70 text-[10px] font-semibold px-2 py-1 rounded-lg"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Đặt ngày
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-[rgba(22,163,68,.25)] p-3 z-20 w-52">
                <p className="text-xs font-bold text-slate-600 mb-2">Chọn ngày thi</p>
                <input
                  type="date"
                  value={inputDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setInputDate(e.target.value)}
                  className="w-full border border-[rgba(22,163,68,.25)] rounded-lg px-3 py-1.5 text-sm text-slate-800 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <div className="flex gap-2">
                  <button onClick={() => setOpen(false)} className="flex-1 text-xs text-slate-500 py-1.5 rounded-lg border border-[rgba(22,163,68,.25)] hover:bg-slate-50">Huỷ</button>
                  <button onClick={save} disabled={saving || !inputDate} className="flex-1 text-xs bg-emerald-600 text-white py-1.5 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">
                    {saving ? '…' : 'Lưu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {daysLeft !== null ? (
            daysLeft > 0 ? (
              <>
                <p className="text-4xl font-black text-white leading-none">{daysLeft}</p>
                <p className="text-xs text-white/50 font-semibold mt-1">ngày nữa</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {new Date(examDate!).toLocaleDateString('vi-VN', { day:'2-digit', month:'long', year:'numeric' })}
                </p>
              </>
            ) : (
              <p className="text-sm font-black text-amber-400">Hôm nay là ngày thi! 🎯</p>
            )
          ) : (
            <>
              <p className="text-sm font-bold text-white/60">Chưa đặt<br/>ngày thi</p>
              <p className="text-[10px] text-white/25 mt-1 leading-snug">Thêm ngày thi để đếm ngược từng ngày.</p>
            </>
          )}
        </div>

        {/* Progress bar if date set */}
        {daysLeft !== null && daysLeft > 0 && (
          <div className="mt-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                style={{ width: `${Math.max(5, Math.min(100, 100 - (daysLeft / 180) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
