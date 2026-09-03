'use client'

import { useState } from 'react'

export interface ChartPoint {
  date: string
  band: number
  label: string
  completionTime?: number | null
  taskType?: string | null
}

interface BandChartProps {
  data: ChartPoint[]
  targetBand: number | null
  mode?: 'band' | 'time'
}

const W = 800, H = 270
const PAD = { top: 32, right: 48, bottom: 44, left: 56 }
const PW = W - PAD.left - PAD.right
const PH = H - PAD.top - PAD.bottom
const FONT = "'Nunito',system-ui,sans-serif"

function xCoord(i: number, total: number) {
  if (total <= 1) return PAD.left + PW / 2
  return PAD.left + (i / (total - 1)) * PW
}

function straightPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`
  return d
}

function filterByMonths(data: ChartPoint[], months: number) {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return data.filter(d => new Date(d.date) >= cutoff)
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

export default function BandChart({ data, targetBand, mode = 'band' }: BandChartProps) {
  const [range, setRange]   = useState<'3m' | '6m'>('3m')
  const [hoverId, setHoverId] = useState<number | null>(null)

  // ── BAND CHART ──────────────────────────────────────────────────────────
  if (mode === 'band') {
    const raw      = filterByMonths(data, range === '6m' ? 6 : 3)
    const filtered = raw.length >= 2 ? raw : data   // fallback to all

    // Dynamic Y scale
    const bandVals  = filtered.map(d => d.band)
    const hasTarget = targetBand != null && targetBand >= 4 && targetBand <= 9
    const dataMin   = Math.min(...bandVals, hasTarget ? targetBand! : 9)
    const dataMax   = Math.max(...bandVals, hasTarget ? targetBand! : 4)
    const yMin      = Math.max(4.0, Math.floor((dataMin - 0.5) * 2) / 2)
    const yMax      = Math.min(9.0, Math.ceil((dataMax  + 0.5) * 2) / 2)
    const yFn       = (b: number) => PAD.top + PH - ((b - yMin) / (yMax - yMin)) * PH

    const gridVals: number[] = []
    for (let v = yMin; v <= yMax + 0.01; v = Math.round((v + 0.5) * 10) / 10) gridVals.push(v)

    const pts  = filtered.map((_, i) => ({ x: xCoord(i, filtered.length), y: yFn(filtered[i].band) }))
    const line = straightPath(pts)
    const area = pts.length > 1
      ? line + ` L ${pts[pts.length - 1].x} ${PAD.top + PH} L ${pts[0].x} ${PAD.top + PH} Z`
      : ''

    const btnA: React.CSSProperties = { padding: '5px 16px', borderRadius: 50, fontSize: 12, fontWeight: 800, border: '1.5px solid #16a344', background: '#16a344', color: '#fff', cursor: 'pointer' }
    const btnI: React.CSSProperties = { padding: '5px 16px', borderRadius: 50, fontSize: 12, fontWeight: 800, border: '1.5px solid rgba(22,163,68,.25)', background: '#fff', color: '#3d5a47', cursor: 'pointer' }

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 900, color: '#192e1e' }}>Band score theo thời gian</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['3m', '6m'] as const).map(r => (
              <button key={r} onClick={() => { setRange(r); setHoverId(null) }} style={range === r ? btnA : btnI}>
                {r === '3m' ? '3 tháng' : '6 tháng'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length < 2 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,163,68,.04)', borderRadius: 14, height: 208, fontSize: 13, fontWeight: 600, color: '#7a9e87' }}>
            Chưa đủ dữ liệu để hiển thị
          </div>
        ) : (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', userSelect: 'none', maxHeight: 270 }}>
              <defs>
                <linearGradient id="bandAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#16a344" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#16a344" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Y grid + labels */}
              {gridVals.map(v => (
                <g key={v}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={yFn(v)} y2={yFn(v)} stroke="rgba(22,163,68,.1)" strokeWidth={1} />
                  <text x={PAD.left - 8} y={yFn(v) + 4} textAnchor="end" fontSize={11} fill="#7a9e87" fontFamily={FONT}>{v}</text>
                </g>
              ))}

              {/* Target dashed line */}
              {hasTarget && (
                <g>
                  <line x1={PAD.left} x2={W - PAD.right} y1={yFn(targetBand!)} y2={yFn(targetBand!)}
                    stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.85} />
                  <text x={PAD.left + 8} y={yFn(targetBand!) - 5}
                    fontSize={10} fontWeight="700" fill="#f59e0b" fontFamily={FONT}>
                    Mục tiêu {targetBand}
                  </text>
                </g>
              )}

              {/* Area + line */}
              <path d={area} fill="url(#bandAreaFill)" />
              <path d={line} fill="none" stroke="#16a344" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

              {/* Points */}
              {pts.map((pt, i) => {
                const isLast = i === pts.length - 1
                const isHov  = hoverId === i
                return (
                  <g key={i} onMouseEnter={() => setHoverId(i)} onMouseLeave={() => setHoverId(null)}>
                    <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" style={{ cursor: 'pointer' }} />
                    {(isHov || isLast) && (
                      <circle cx={pt.x} cy={pt.y} r={isHov ? 6 : 5} fill="#16a344" stroke="#fff" strokeWidth={2} />
                    )}
                  </g>
                )
              })}

              {/* Tooltip */}
              {hoverId !== null && pts[hoverId] && (() => {
                const pt  = pts[hoverId]
                const d   = filtered[hoverId]
                const hasT = (d.completionTime ?? 0) > 0
                const tw = hasT ? 140 : 110, th = hasT ? 58 : 44
                const tx = Math.max(PAD.left, Math.min(pt.x - tw / 2, W - PAD.right - tw))
                const ty = Math.max(PAD.top, pt.y - th - 10)
                return (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={tx} y={ty} width={tw} height={th} rx={7} fill="#192e1e" opacity={0.92} />
                    <text x={tx + tw / 2} y={ty + 17} textAnchor="middle" fontSize={13} fontWeight="700" fill="#fff" fontFamily={FONT}>
                      Band {d.band}
                    </text>
                    <text x={tx + tw / 2} y={ty + 31} textAnchor="middle" fontSize={10} fill="#7a9e87" fontFamily={FONT}>
                      {d.label} · {taskLabel(d.taskType)}
                    </text>
                    {hasT && (
                      <text x={tx + tw / 2} y={ty + 47} textAnchor="middle" fontSize={10} fill="#6ee7b7" fontFamily={FONT}>
                        {formatTime(d.completionTime!)}
                      </text>
                    )}
                  </g>
                )
              })()}

              {/* X labels */}
              {filtered.map((d, i) => !showXLabel(i, filtered.length) ? null : (
                <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fontSize={10} fill="#7a9e87" fontFamily={FONT}>
                  {d.label}
                </text>
              ))}
            </svg>
          </div>
        )}
      </div>
    )
  }

  // ── TIME BAR CHART ──────────────────────────────────────────────────────
  const timeData = data.filter(d => d.completionTime != null && d.completionTime > 0)
  const timeMins = timeData.map(d => (d.completionTime ?? 0) / 60)
  const hasTime  = timeData.length > 0
  const avgSecs  = hasTime ? timeData.reduce((a, d) => a + (d.completionTime ?? 0), 0) / timeData.length : 0
  const avgMins  = avgSecs / 60
  const maxMins  = hasTime ? Math.max(...timeMins) : 60
  const Y_BAR_MAX = Math.max(60, Math.ceil(maxMins / 15) * 15)
  const yBarFn   = (m: number) => PAD.top + PH - (m / Y_BAR_MAX) * PH
  const barLabels: number[] = []
  for (let v = 15; v <= Y_BAR_MAX; v += 15) barLabels.push(v)
  const n       = timeData.length
  const barSlot = n > 0 ? PW / n : PW
  const barW    = Math.min(36, barSlot * 0.58)
  const xCenter = (i: number) => PAD.left + i * barSlot + barSlot / 2

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 900, color: '#192e1e' }}>Thời gian làm bài</p>
        {hasTime && <p style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>phút · {n} bài gần nhất</p>}
      </div>

      {!hasTime ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,163,68,.04)', borderRadius: 14, height: 208, fontSize: 13, fontWeight: 600, color: '#7a9e87' }}>
          Chưa có bài nào nhập thời gian làm bài
        </div>
      ) : (
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', userSelect: 'none', maxHeight: 270 }}>
            {/* Grid */}
            {barLabels.map(v => (
              <g key={v}>
                <line x1={PAD.left} x2={W - PAD.right} y1={yBarFn(v)} y2={yBarFn(v)} stroke="rgba(22,163,68,.1)" strokeWidth={1} />
                <text x={PAD.left - 8} y={yBarFn(v) + 4} textAnchor="end" fontSize={11} fill="#7a9e87" fontFamily={FONT}>{v}&apos;</text>
              </g>
            ))}

            {/* Average line */}
            <line x1={PAD.left} x2={W - PAD.right} y1={yBarFn(avgMins)} y2={yBarFn(avgMins)}
              stroke="rgba(22,163,68,.75)" strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={PAD.left - 8} y={yBarFn(avgMins) + 4} textAnchor="end" fontSize={10} fontWeight="700" fill="#16a344" fontFamily={FONT}>
              TB {Math.round(avgMins)}&apos;
            </text>

            {/* Bars */}
            {timeData.map((d, i) => {
              const mins    = (d.completionTime ?? 0) / 60
              const isAmber = mins > 40
              const bh = (mins / Y_BAR_MAX) * PH
              const bx = xCenter(i) - barW / 2
              const by = PAD.top + PH - bh
              return (
                <g key={i} onMouseEnter={() => setHoverId(i)} onMouseLeave={() => setHoverId(null)} style={{ cursor: 'pointer' }}>
                  <rect x={bx} y={by} width={barW} height={bh} rx={4}
                    fill={isAmber ? 'rgba(245,170,0,.85)' : 'rgba(22,163,68,.55)'}
                    opacity={hoverId === null || hoverId === i ? 1 : 0.55}
                  />
                  <text x={xCenter(i)} y={by - 5} textAnchor="middle" fontSize={10} fontWeight="700"
                    fill={isAmber ? '#c47a00' : '#16a344'} fontFamily={FONT}>
                    {Math.round(mins)}&apos;
                  </text>
                  {showXLabel(i, n) && (
                    <text x={xCenter(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#7a9e87" fontFamily={FONT}>
                      {d.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Tooltip */}
            {hoverId !== null && timeData[hoverId] && (() => {
              const d   = timeData[hoverId]
              const mins = (d.completionTime ?? 0) / 60
              const cx  = xCenter(hoverId)
              const by  = yBarFn(mins)
              const tw = 130, th = 52
              const tx = Math.max(PAD.left, Math.min(cx - tw / 2, W - PAD.right - tw))
              const ty = Math.max(PAD.top, by - th - 8)
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={tw} height={th} rx={7} fill="#192e1e" opacity={0.92} />
                  <text x={tx + tw / 2} y={ty + 17} textAnchor="middle" fontSize={13} fontWeight="700" fill="#fff" fontFamily={FONT}>
                    {formatTime(d.completionTime!)}
                  </text>
                  <text x={tx + tw / 2} y={ty + 31} textAnchor="middle" fontSize={10} fill="#7a9e87" fontFamily={FONT}>
                    {d.label} · Band {d.band}
                  </text>
                  <text x={tx + tw / 2} y={ty + 45} textAnchor="middle" fontSize={10} fill="#7a9e87" fontFamily={FONT}>
                    {taskLabel(d.taskType)}
                  </text>
                </g>
              )
            })()}
          </svg>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87', fontStyle: 'italic', marginTop: 6 }}>
            Cột vàng: thời gian &gt;40 phút. IELTS Writing yêu cầu hoàn thành trong 60 phút (cả 2 tasks).
          </p>
        </div>
      )}
    </div>
  )
}
