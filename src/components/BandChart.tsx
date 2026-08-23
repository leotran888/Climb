'use client'

import { useState } from 'react'

export interface ChartPoint {
  date: string
  band: number
  label: string
  completionTime?: number | null  // seconds
  taskType?: string | null
}

interface BandChartProps {
  data: ChartPoint[]
  targetBand: number | null
}

const W = 800, H = 270
const PAD = { top: 24, right: 40, bottom: 44, left: 56 }
const PW = W - PAD.left - PAD.right
const PH = H - PAD.top - PAD.bottom
const Y_MIN_BAND = 4.0, Y_MAX_BAND = 9.0

function yBand(band: number) {
  return PAD.top + PH - ((band - Y_MIN_BAND) / (Y_MAX_BAND - Y_MIN_BAND)) * PH
}

function yTime(mins: number, yMin: number, yMax: number) {
  if (yMax === yMin) return PAD.top + PH / 2
  return PAD.top + PH - ((mins - yMin) / (yMax - yMin)) * PH
}

function xCoord(i: number, total: number) {
  if (total <= 1) return PAD.left + PW / 2
  return PAD.left + (i / (total - 1)) * PW
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const mx = (p.x + c.x) / 2
    d += ` C ${mx} ${p.y} ${mx} ${c.y} ${c.x} ${c.y}`
  }
  return d
}

function filterByRange(data: ChartPoint[], range: string) {
  if (range === 'all') return data
  const days = range === '7d' ? 7 : 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return data.filter(d => new Date(d.date) >= cutoff)
}

function filterByTask(data: ChartPoint[], task: string) {
  if (task === 'all') return data
  if (task === 'task1') return data.filter(d => d.taskType === 'academic_task1' || d.taskType === 'general_task1')
  return data.filter(d => d.taskType === 'task2')
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

function taskLabel(taskType: string | null | undefined) {
  if (taskType === 'task2') return 'Task 2'
  if (taskType === 'academic_task1') return 'Academic Task 1'
  if (taskType === 'general_task1') return 'General Task 1'
  return '—'
}

function showXLabel(i: number, total: number) {
  if (total <= 7) return true
  if (i === 0 || i === total - 1) return true
  return i % Math.ceil(total / 5) === 0
}

export default function BandChart({ data, targetBand }: BandChartProps) {
  const [range,      setRange]      = useState<'7d' | '30d' | 'all'>('all')
  const [metric,     setMetric]     = useState<'band' | 'time'>('band')
  const [taskFilter, setTaskFilter] = useState<'all' | 'task1' | 'task2'>('all')
  const [hoverId,    setHoverId]    = useState<number | null>(null)

  // Filtered data pools
  const byRange = filterByRange(data, range)
  const filtered = filterByTask(byRange, taskFilter)
  const timeFiltered = filtered.filter(d => d.completionTime != null && d.completionTime > 0)

  // ── Band chart geometry ────────────────────────────────────────────────────
  const bandPts  = filtered.map((_, i) => ({ x: xCoord(i, filtered.length), y: yBand(filtered[i].band) }))
  const bandLine = smoothPath(bandPts)
  const bandArea = bandPts.length > 1
    ? bandLine + ` L ${bandPts[bandPts.length - 1].x} ${PAD.top + PH} L ${bandPts[0].x} ${PAD.top + PH} Z`
    : ''

  // ── Time chart geometry ────────────────────────────────────────────────────
  const timeMins  = timeFiltered.map(d => (d.completionTime ?? 0) / 60)
  const rawMin    = timeMins.length > 0 ? Math.min(...timeMins) : 0
  const rawMax    = timeMins.length > 0 ? Math.max(...timeMins) : 60
  const Y_T_MIN   = Math.max(0, Math.floor(rawMin / 10) * 10 - 10)
  const Y_T_MAX   = Math.max(Y_T_MIN + 10, Math.ceil(rawMax / 10) * 10 + 10)

  const timeYLabels: number[] = []
  for (let m = Y_T_MIN; m <= Y_T_MAX; m += 10) timeYLabels.push(m)

  const timePts  = timeFiltered.map((d, i) => ({
    x: xCoord(i, timeFiltered.length),
    y: yTime((d.completionTime ?? 0) / 60, Y_T_MIN, Y_T_MAX),
  }))
  const timeLine = smoothPath(timePts)
  const timeArea = timePts.length > 1
    ? timeLine + ` L ${timePts[timePts.length - 1].x} ${PAD.top + PH} L ${timePts[0].x} ${PAD.top + PH} Z`
    : ''

  // ── Time summary stats ─────────────────────────────────────────────────────
  const hasTime  = timeFiltered.length > 0
  const avgSecs  = hasTime ? timeFiltered.reduce((a, d) => a + (d.completionTime ?? 0), 0) / timeFiltered.length : 0
  const fastSecs = hasTime ? Math.min(...timeFiltered.map(d => d.completionTime ?? Infinity)) : 0
  const lateSecs = hasTime ? (timeFiltered[timeFiltered.length - 1].completionTime ?? 0) : 0

  // Active data length for empty-state check
  const activeData = metric === 'band' ? filtered : timeFiltered

  return (
    <div>
      {/* Metric toggle */}
      <div className="flex items-center gap-1.5 mb-3">
        {(['band', 'time'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMetric(m); setHoverId(null) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === m
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {m === 'band' ? 'Điểm IELTS' : 'Thời gian làm bài'}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {(['7d', '30d', 'all'] as const).map(r => (
          <button
            key={r}
            onClick={() => { setRange(r); setHoverId(null) }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              range === r
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
          </button>
        ))}

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        {(['all', 'task1', 'task2'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTaskFilter(t); setHoverId(null) }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              taskFilter === t
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t === 'all' ? 'Tất cả' : t === 'task1' ? 'Task 1' : 'Task 2'}
          </button>
        ))}
      </div>

      {/* Time summary stats */}
      {metric === 'time' && hasTime && (
        <div className="flex items-center gap-5 mb-4 px-1">
          {[
            { label: 'Average', secs: avgSecs },
            { label: 'Fastest', secs: fastSecs },
            { label: 'Latest',  secs: lateSecs },
          ].map(s => (
            <div key={s.label} className="text-xs text-slate-500">
              <span className="text-slate-400">{s.label}: </span>
              <span className="font-bold text-slate-700">{formatTime(Math.round(s.secs))}</span>
            </div>
          ))}
          <span className="text-xs text-slate-400 ml-auto">{timeFiltered.length} bài có dữ liệu</span>
        </div>
      )}

      {/* Empty state */}
      {activeData.length < 2 ? (
        <div className="flex items-center justify-center bg-slate-50 rounded-xl h-52 text-slate-400 text-sm">
          {metric === 'time' && timeFiltered.length === 0
            ? 'Chưa có bài nào nhập thời gian làm bài'
            : activeData.length === 0
            ? 'Không có dữ liệu trong khoảng thời gian này'
            : 'Cần ít nhất 2 bài để vẽ biểu đồ'}
        </div>
      ) : metric === 'band' ? (

        /* ── BAND CHART ─────────────────────────────────────────────────── */
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ maxHeight: 270 }}>
            <defs>
              <linearGradient id="bandAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#16a344" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#16a344" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(v => (
              <line key={v} x1={PAD.left} x2={W - PAD.right} y1={yBand(v)} y2={yBand(v)}
                stroke={Number.isInteger(v) ? '#e2e8f0' : '#f1f5f9'}
                strokeWidth={Number.isInteger(v) ? 1 : 0.5} />
            ))}
            {[4, 5, 6, 7, 8, 9].map(v => (
              <text key={v} x={PAD.left - 10} y={yBand(v) + 4} textAnchor="end"
                fontSize={11} fill="#94a3b8" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">{v}</text>
            ))}

            {/* Target band */}
            {targetBand && targetBand >= Y_MIN_BAND && targetBand <= Y_MAX_BAND && (
              <>
                <line x1={PAD.left} x2={W - PAD.right} y1={yBand(targetBand)} y2={yBand(targetBand)}
                  stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
                <text x={W - PAD.right + 4} y={yBand(targetBand) + 4} fontSize={10} fill="#f59e0b" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                  {targetBand}
                </text>
              </>
            )}

            <path d={bandArea} fill="url(#bandAreaFill)" />
            <path d={bandLine} fill="none" stroke="#16a344" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {bandPts.map((pt, i) => (
              <g key={i} onMouseEnter={() => setHoverId(i)} onMouseLeave={() => setHoverId(null)}>
                <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" style={{ cursor: 'pointer' }} />
                <circle cx={pt.x} cy={pt.y} r={hoverId === i ? 5.5 : 3.5}
                  fill={hoverId === i ? '#16a344' : '#fff'} stroke="#16a344" strokeWidth={2} />
              </g>
            ))}

            {/* Tooltip */}
            {hoverId !== null && bandPts[hoverId] && (() => {
              const pt = bandPts[hoverId]
              const d  = filtered[hoverId]
              const hasT = (d.completionTime ?? 0) > 0
              const tw = hasT ? 140 : 110, th = hasT ? 58 : 44
              const tx = Math.max(PAD.left, Math.min(pt.x - tw / 2, W - PAD.right - tw))
              const ty = Math.max(PAD.top, pt.y - th - 10)
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={tw} height={th} rx={7} fill="#1e293b" opacity={0.92} />
                  <text x={tx + tw / 2} y={ty + 17} textAnchor="middle" fontSize={13} fontWeight="700" fill="#fff" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                    Band {d.band}
                  </text>
                  <text x={tx + tw / 2} y={ty + 31} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                    {d.label} · {taskLabel(d.taskType)}
                  </text>
                  {hasT && (
                    <text x={tx + tw / 2} y={ty + 47} textAnchor="middle" fontSize={10} fill="#6ee7b7" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                      {formatTime(d.completionTime!)}
                    </text>
                  )}
                </g>
              )
            })()}

            {/* X labels */}
            {filtered.map((d, i) => !showXLabel(i, filtered.length) ? null : (
              <text key={i} x={bandPts[i].x} y={H - 6} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                {d.label}
              </text>
            ))}
          </svg>
        </div>

      ) : (

        /* ── TIME CHART ─────────────────────────────────────────────────── */
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ maxHeight: 270 }}>
            <defs>
              <linearGradient id="timeAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#16a344" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#16a344" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {timeYLabels.map(v => (
              <line key={v} x1={PAD.left} x2={W - PAD.right}
                y1={yTime(v, Y_T_MIN, Y_T_MAX)} y2={yTime(v, Y_T_MIN, Y_T_MAX)}
                stroke="#e2e8f0" strokeWidth={1} />
            ))}
            {timeYLabels.map(v => (
              <text key={v} x={PAD.left - 10} y={yTime(v, Y_T_MIN, Y_T_MAX) + 4} textAnchor="end"
                fontSize={11} fill="#94a3b8" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">{v}m</text>
            ))}

            <path d={timeArea} fill="url(#timeAreaFill)" />
            <path d={timeLine} fill="none" stroke="#16a344" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {timePts.map((pt, i) => (
              <g key={i} onMouseEnter={() => setHoverId(i)} onMouseLeave={() => setHoverId(null)}>
                <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" style={{ cursor: 'pointer' }} />
                <circle cx={pt.x} cy={pt.y} r={hoverId === i ? 5.5 : 3.5}
                  fill={hoverId === i ? '#16a344' : '#fff'} stroke="#16a344" strokeWidth={2} />
              </g>
            ))}

            {/* Tooltip */}
            {hoverId !== null && timePts[hoverId] && (() => {
              const pt = timePts[hoverId]
              const d  = timeFiltered[hoverId]
              const tw = 145, th = 68
              const tx = Math.max(PAD.left, Math.min(pt.x - tw / 2, W - PAD.right - tw))
              const ty = Math.max(PAD.top, pt.y - th - 10)
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={tw} height={th} rx={7} fill="#1e293b" opacity={0.92} />
                  <text x={tx + tw / 2} y={ty + 17} textAnchor="middle" fontSize={13} fontWeight="700" fill="#fff" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                    {formatTime(d.completionTime!)}
                  </text>
                  <text x={tx + tw / 2} y={ty + 31} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                    {d.label} · {taskLabel(d.taskType)}
                  </text>
                  <text x={tx + tw / 2} y={ty + 47} textAnchor="middle" fontSize={10} fill="#6ee7b7" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                    Band {d.band}
                  </text>
                </g>
              )
            })()}

            {/* X labels */}
            {timeFiltered.map((d, i) => !showXLabel(i, timeFiltered.length) ? null : (
              <text key={i} x={timePts[i].x} y={H - 6} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="'Be Vietnam Pro',system-ui,sans-serif">
                {d.label}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}
