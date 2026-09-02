export default function ClimbLogo({ size = 'md', darkMode = false }: { size?: 'sm' | 'md'; darkMode?: boolean }) {
  const box = size === 'sm' ? 30 : 38
  const radius = size === 'sm' ? 8 : 11
  const iconW = size === 'sm' ? 16 : 20
  const iconH = size === 'sm' ? 18 : 23
  const textSize = size === 'sm' ? 'text-base' : 'text-[19px]'
  const textColor = darkMode ? 'text-white' : 'text-[#192e1e]'
  const accentColor = darkMode ? '#6ee09a' : '#16a344'

  return (
    <span className="flex items-center gap-2.5">
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: box, height: box, borderRadius: radius, background: '#16a344' }}
      >
        <svg width={iconW} height={iconH} viewBox="0 0 36 42" fill="none">
          <path
            d="M2 40L2 32.5Q2 29 5.5 29L8.5 29Q12 29 12 25.5L12 21.5Q12 18 15.5 18L18.5 18Q22 18 22 14.5L22 11.5Q22 8 25.5 8L34 8"
            stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={`font-black ${textSize} ${textColor} tracking-tight leading-none`}>
        Climb <em className="not-italic" style={{ color: accentColor }}>IELTS</em>
      </span>
    </span>
  )
}
