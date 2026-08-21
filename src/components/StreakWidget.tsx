'use client'

import { useState } from 'react'

interface Props {
  streak: number
  weekDays: string[]
  activityDates: string[]
  todayVn: string
  dayLabels: string[]
  year: number
  month: number
  daysInMonth: number
  calendarOffset: number
  monthLabel: string
  currentDay: number
}

export default function StreakWidget({
  streak, weekDays, activityDates, todayVn, dayLabels,
  year, month, daysInMonth, calendarOffset, monthLabel, currentDay,
}: Props) {
  const [showCalendar, setShowCalendar] = useState(false)
  const activitySet = new Set(activityDates)

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-5 py-4"
      style={{ background: 'linear-gradient(135deg, #0d1f4e 0%, #0a173b 100%)' }}
    >
      {/* Stars */}
      {[[12,20],[45,10],[68,70],[85,15],[30,80],[90,55],[22,45],[75,35]].map(([l,t],i) => (
        <div key={i} className="absolute rounded-full bg-white/50"
          style={{ left:`${l}%`, top:`${t}%`, width:i%3===0?2:1, height:i%3===0?2:1 }}/>
      ))}
      <div className="absolute" style={{ top:'20%', left:'58%', width:32, height:1, background:'linear-gradient(90deg,transparent,white)', transform:'rotate(-35deg)', opacity:0.5 }}/>

      {/* Main row: streak count | divider | week dots | toggle button */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Left: streak count */}
        <div className="shrink-0">
          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-0.5">Chuỗi ngày học</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🔥</span>
            <span className="text-3xl font-black text-white leading-none">{streak}</span>
            <span className="text-white/40 text-xs font-semibold leading-tight">ngày<br/>liên tiếp</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 shrink-0"/>

        {/* Week dots */}
        <div className="flex gap-2 flex-1 justify-between">
          {weekDays.map((d, i) => {
            const active = activitySet.has(d)
            const isToday = d === todayVn
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  active ? 'bg-amber-500 shadow-md shadow-amber-500/50' :
                  isToday ? 'bg-white/10 ring-1 ring-white/30' : 'bg-white/5'
                }`}>
                  {active ? '🔥' : isToday ? <span className="w-1.5 h-1.5 rounded-full bg-white/60 block"/> : null}
                </div>
                <span className={`text-[9px] font-bold ${isToday ? 'text-white' : 'text-white/25'}`}>{dayLabels[i]}</span>
              </div>
            )
          })}
        </div>

        {/* Toggle calendar button */}
        <button
          onClick={() => setShowCalendar(v => !v)}
          className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors text-white/70 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {showCalendar ? 'Ẩn' : 'Hoạt động'}
          <svg
            width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${showCalendar ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Expandable calendar */}
      {showCalendar && (
        <div className="relative z-10 mt-4 pt-4 border-t border-white/10">
          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-3">
            Hoạt động học tập · {monthLabel}
          </p>
          <div className="grid grid-cols-7 gap-y-1 gap-x-0">
            {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
              <div key={d} className="text-center text-[9px] text-white/25 font-bold pb-1">{d}</div>
            ))}
            {Array.from({ length: calendarOffset }, (_, i) => <div key={`e${i}`}/>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
              const active = activitySet.has(dateStr)
              const isToday = dateStr === todayVn
              return (
                <div key={dayNum} className={`aspect-square flex items-center justify-center rounded-full text-[9px] font-bold ${
                  active ? 'bg-emerald-500 text-white' :
                  isToday ? 'ring-1 ring-white/40 text-white' :
                  dayNum > currentDay ? 'text-white/12' : 'text-white/22'
                }`}>
                  {isToday ? <span className="w-1.5 h-1.5 rounded-full bg-white block"/> : dayNum}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
