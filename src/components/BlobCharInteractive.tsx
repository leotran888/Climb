'use client'

import { useState, useEffect } from 'react'

export default function BlobCharInteractive({ shade }: { shade: string }) {
  const [yeah, setYeah] = useState(false)

  return (
    <svg
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[155px] mx-auto block cursor-pointer select-none"
      onMouseEnter={() => setYeah(true)}
      onMouseLeave={() => setYeah(false)}
      style={{
        transition: 'transform 0.15s ease',
        transform: yeah ? 'translateY(-10px) scale(1.08)' : 'translateY(0) scale(1)',
        filter: yeah ? 'drop-shadow(0 12px 20px rgba(0,0,0,0.25))' : 'none',
      }}
    >
      {/* Shadow glow */}
      <ellipse cx="100" cy="68" rx="68" ry="52" fill={shade} />

      {/* Left arm — raised in yeah state */}
      {yeah && (
        <path
          d="M 45 70 Q 20 40 28 18"
          stroke="white" strokeWidth="9" strokeLinecap="round"
          style={{ animation: 'none' }}
        />
      )}
      {/* Right arm — raised in yeah state */}
      {yeah && (
        <path
          d="M 155 70 Q 180 40 172 18"
          stroke="white" strokeWidth="9" strokeLinecap="round"
        />
      )}

      {/* Left fist */}
      {yeah && <circle cx="28" cy="16" r="7" fill="white" />}
      {/* Right fist */}
      {yeah && <circle cx="172" cy="16" r="7" fill="white" />}

      {/* Eyes */}
      {yeah ? (
        <>
          {/* Happy crescents */}
          <path d="M 53 60 Q 66 46 79 60" fill="none" stroke="#0a0a0a" strokeWidth="5" strokeLinecap="round" />
          <path d="M 121 60 Q 134 46 147 60" fill="none" stroke="#0a0a0a" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="66" cy="58" r="13" fill="white" />
          <circle cx="134" cy="58" r="13" fill="white" />
          <circle cx="69" cy="61" r="8" fill="#0a0a0a" />
          <circle cx="137" cy="61" r="8" fill="#0a0a0a" />
          <circle cx="64" cy="56" r="3" fill="white" />
          <circle cx="132" cy="56" r="3" fill="white" />
        </>
      )}

      {/* Mouth */}
      {yeah ? (
        /* Big open happy mouth */
        <>
          <path d="M 60 88 Q 100 120 140 88" fill="white" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <path d="M 72 90 Q 100 108 128 90" fill="none" stroke="#0a0a0a" strokeWidth="4" strokeLinecap="round" />
      )}

      {/* Sparkles in yeah state */}
      {yeah && (
        <>
          <text x="12" y="52" fontSize="16" style={{ userSelect: 'none' }}>✨</text>
          <text x="158" y="52" fontSize="16" style={{ userSelect: 'none' }}>✨</text>
        </>
      )}
    </svg>
  )
}
