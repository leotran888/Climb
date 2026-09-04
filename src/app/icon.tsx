import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#16a344',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="21" viewBox="0 0 36 42" fill="none">
          <path
            d="M2 40L2 32.5Q2 29 5.5 29L8.5 29Q12 29 12 25.5L12 21.5Q12 18 15.5 18L18.5 18Q22 18 22 14.5L22 11.5Q22 8 25.5 8L34 8"
            stroke="#fff"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
