'use client'

import { useState } from 'react'

export default function ClimbMascotInteractive() {
  const [yeah, setYeah] = useState(false)

  return (
    <div
      className="relative inline-block select-none"
      onMouseEnter={() => setYeah(true)}
      onMouseLeave={() => setYeah(false)}
      style={{ cursor: 'pointer' }}
    >
      <svg
        width="200" height="218"
        viewBox="0 0 200 218"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), filter 0.3s ease',
          transform: yeah ? 'translateY(-10px) scale(1.07)' : 'translateY(0) scale(1)',
          filter: yeah ? 'drop-shadow(0 0 40px rgba(253,211,100,0.38)) drop-shadow(0 0 18px rgba(253,211,100,0.22))' : 'none',
        }}
      >
        {/* Glow ring */}
        <circle cx="100" cy="118" r="92" fill="rgba(255,255,255,0.08)" />
        {/* Body */}
        <circle cx="100" cy="118" r="78" fill="#1ab852" />
        {/* Shine */}
        <ellipse cx="80" cy="90" rx="34" ry="21" fill="rgba(255,255,255,0.18)" transform="rotate(-22 80 90)" />

        {/* Arms raised in yeah state */}
        {yeah && <>
          <path d="M 30 118 Q 10 75 22 48" stroke="#1ab852" strokeWidth="20" strokeLinecap="round" />
          <path d="M 170 118 Q 190 75 178 48" stroke="#1ab852" strokeWidth="20" strokeLinecap="round" />
          {/* Fists */}
          <circle cx="22" cy="44" r="13" fill="#1ab852" />
          <circle cx="178" cy="44" r="13" fill="#1ab852" />
          {/* Sparkles */}
          <text x="2" y="36" fontSize="18" style={{ userSelect: 'none' }}>✨</text>
          <text x="162" y="36" fontSize="18" style={{ userSelect: 'none' }}>✨</text>
        </>}

        {/* Eyes */}
        {yeah ? <>
          {/* Happy crescent eyes */}
          <path d="M 62 114 Q 76 98 90 114" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <path d="M 110 114 Q 124 98 138 114" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
        </> : <>
          <circle cx="76" cy="112" r="14" fill="white" />
          <circle cx="124" cy="112" r="14" fill="white" />
          <circle cx="79" cy="115" r="8.5" fill="#0a2e14" />
          <circle cx="127" cy="115" r="8.5" fill="#0a2e14" />
          <circle cx="74" cy="110" r="3.5" fill="white" />
          <circle cx="122" cy="110" r="3.5" fill="white" />
        </>}

        {/* Mouth */}
        {yeah
          ? <path d="M 68 140 Q 100 168 132 140" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" />
          : <path d="M 75 140 Q 100 157 125 140" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
        }

        {/* Cap */}
        <rect x="62" y="46" width="76" height="10" rx="3" fill="#0a2e14" />
        <polygon points="100,26 62,46 138,46" fill="#0a2e14" />
        <line x1="136" y1="46" x2="136" y2="62" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="136" cy="66" r="5" fill="#fbbf24" />
      </svg>

      {/* Floating badges */}
      <div
        className="absolute top-6 -right-12 bg-white rounded-2xl px-3 py-2 text-xs font-black text-emerald-700 whitespace-nowrap flex items-center gap-1.5"
        style={{ boxShadow: '0 4px 16px rgba(22,163,68,0.18)', border: '1.5px solid #d1fae5' }}
      >
        🎯 Band 7.5 đạt rồi!
      </div>
      <div
        className="absolute bottom-16 -left-10 bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap"
        style={{ boxShadow: '0 4px 12px rgba(22,163,68,0.35)' }}
      >
        +1.5 bands ↑
      </div>
    </div>
  )
}
