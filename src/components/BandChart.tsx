'use client'

import { useState } from 'react'

export interface ChartPoint {
  date: string   // ISO string
  band: number
  label: string  // short display label for X-axis
}

interface BandChartProps {
  data: ChartPoint[]
  targetBand: number | null
}

const W = 800, H = 270
const PAD = { top: 24, right: 40, bottom: 44, left: 48 }
const PW = W - PAD.left - PAD.right
const PH = H - PAD.top - PAD.bottom
const Y_MIN = 4.0, Y_MAX = 9.0

function yCoord(band: number) {
  return PAD.top + PH - ((band - Y_MIN) / (Y_MAX - Y_MIN)) * PH
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

function filterData(data: ChartPoint[], range: string) {
  if (range === 'all') return data
  const days = range === '7d' ? 7 : 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return data.filter(d => new Date(d.date) >= cutoff)
}

export default function BandChart({ data, targetBand }: BandChartProps) {
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('all')
  const [hoverId, setHoverId] = useState<number | null>(null)

  const filtered = filterData(data, range)
  const pts = filtered.map((d, i) => ({ x: xCoord(i, filtered.length), y: yCoord(d.band) }))
  const linePath = smoothPath(pts)
  const areaPath = pts.length > 1
    ? linePath + ` L ${pts[pts.length - 1].x} ${PAD.top + PH} L ${pts[0].x} ${PAD.top + PH} Z`
    : ''

  const yGridLines = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]
  const yLabels = [4, 5, 6, 7, 8, 9]

  // X-axis label selection
  function showXLabel(i: number, total: number) {
    if (total <= 7) return true
    if (i === 0 || i === total - 1) return true
    return i % Math.ceil(total / 5) === 0
  }

  const hoveredPoint = hoverId !== null ? filtered[hoverId] : null

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4">
        {(['7d', '30d', 'all'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              range === r
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
          </button>
        ))}
        {hoveredPoint && (
          <span className="ml-auto text-sm text-slate-500">
            <span className="font-semibold text-emerald-700">Band {hoveredPoint.band}</span>
            {' — '}{hoveredPoint.label}
          </span>
        )}
      </div>

      {filtered.length < 2 ? (
        <div className="flex items-center justify-center bg-slate-50 rounded-xl h-52 text-slate-400 text-sm">
          {filtered.length === 0
            ? 'Không có dữ liệu trong khoảng thời gian này'
            : 'Cần ít nhất 2 bài để vẽ biểu đồ'}
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: 270 }}
          >
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a344" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#16a344" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yGridLines.map(v => (
              <line
                key={v}
                x1={PAD.left} x2={W - PAD.right}
                y1={yCoord(v)} y2={yCoord(v)}
                stroke={Number.isInteger(v) ? '#e2e8f0' : '#f1f5f9'}
                strokeWidth={Number.isInteger(v) ? 1 : 0.5}
              />
            ))}

            {/* Y labels */}
            {yLabels.map(v => (
              <text
                key={v}
                x={PAD.left - 10} y={yCoord(v) + 4}
                textAnchor="end" fontSize={11} fill="#94a3b8"
                fontFamily="system-ui,sans-serif"
              >
                {v}
              </text>
            ))}

            {/* Target band */}
            {targetBand && targetBand >= Y_MIN && targetBand <= Y_MAX && (
              <>
                <line
                  x1={PAD.left} x2={W - PAD.right}
                  y1={yCoord(targetBand)} y2={yCoord(targetBand)}
                  stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7}
                />
                <text
                  x={W - PAD.right + 4} y={yCoord(targetBand) + 4}
                  fontSize={10} fill="#f59e0b" fontFamily="system-ui,sans-serif"
                >
                  {targetBand}
                </text>
              </>
            )}

            {/* Area */}
            <path d={areaPath} fill="url(#areaFill)" />

            {/* Line */}
            <path
              d={linePath} fill="none"
              stroke="#16a344" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round"
            />

            {/* Points + hit areas */}
            {pts.map((pt, i) => (
              <g key={i}
                onMouseEnter={() => setHoverId(i)}
                onMouseLeave={() => setHoverId(null)}
              >
                <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" style={{ cursor: 'pointer' }} />
                <circle
                  cx={pt.x} cy={pt.y}
                  r={hoverId === i ? 5.5 : 3.5}
                  fill={hoverId === i ? '#16a344' : '#fff'}
                  stroke="#16a344" strokeWidth={2}
                />
              </g>
            ))}

            {/* Hover callout */}
            {hoverId !== null && pts[hoverId] && (() => {
              const pt = pts[hoverId]
              const d = filtered[hoverId]
              const tw = 98, th = 44
              const tx = Math.max(PAD.left, Math.min(pt.x - tw / 2, W - PAD.right - tw))
              const ty = Math.max(PAD.top, pt.y - th - 10)
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={tw} height={th} rx={7} fill="#1e293b" opacity={0.92} />
                  <text x={tx + tw / 2} y={ty + 17} textAnchor="middle"
                    fontSize={13} fontWeight="700" fill="#fff" fontFamily="system-ui,sans-serif">
                    Band {d.band}
                  </text>
                  <text x={tx + tw / 2} y={ty + 33} textAnchor="middle"
                    fontSize={10} fill="#94a3b8" fontFamily="system-ui,sans-serif">
                    {d.label}
                  </text>
                </g>
              )
            })()}

            {/* X labels */}
            {filtered.map((d, i) => {
              if (!showXLabel(i, filtered.length)) return null
              return (
                <text
                  key={i}
                  x={pts[i].x} y={H - 6}
                  textAnchor="middle" fontSize={10} fill="#94a3b8"
                  fontFamily="system-ui,sans-serif"
                >
                  {d.label}
                </text>
              )
            })}
          </svg>
        </div>
      )}
    </div>
  )
}
