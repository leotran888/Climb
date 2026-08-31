import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CRITERIA = [
  { name: 'TR',  pct: 78, score: '7.0' },
  { name: 'CC',  pct: 72, score: '6.5' },
  { name: 'LR',  pct: 78, score: '7.0' },
  { name: 'GRA', pct: 83, score: '7.5' },
]

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: '#ffffff', display: 'flex', flexDirection: 'row' }}>

        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 48px 56px 72px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="28" height="32" viewBox="0 0 36 42" fill="none">
              <path d="M2 40 L2 32.5 Q2 29 5.5 29 L8.5 29 Q12 29 12 25.5 L12 21.5 Q12 18 15.5 18 L18.5 18 Q22 18 22 14.5 L22 11.5 Q22 8 25.5 8 L34 8"
                stroke="#16a344" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', color: '#0c1a0e', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Climb</div>
              <div style={{ display: 'flex', color: '#16a344', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em' }}>IELTS</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, background: '#16a344' }} />
              <div style={{ display: 'flex', color: '#16a344', fontSize: 15, fontWeight: 600, letterSpacing: '0.04em' }}>AI chấm bài IELTS Writing</div>
            </div>
            <div style={{ display: 'flex', color: '#0c1a0e', fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>Leo thang</div>
            <div style={{ display: 'flex', color: '#0c1a0e', fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>band score</div>
            <div style={{ display: 'flex', color: '#16a344', fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>với AI thật sự</div>
            <div style={{ display: 'flex', marginTop: 24, color: '#4d7460', fontSize: 18, fontWeight: 400, lineHeight: 1.5 }}>
              AI viết lại bài đạt Band mục tiêu · Hiểu lỗi người Việt · Miễn phí
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', color: '#9cb8a5', fontSize: 13 }}>www.climbielts.com</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', width: 5, height: 5, borderRadius: 3, background: '#16a344' }} />
                <div style={{ display: 'flex', color: '#9cb8a5', fontSize: 12 }}>10.000+ bài đã chấm</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', width: 5, height: 5, borderRadius: 3, background: '#16a344' }} />
                <div style={{ display: 'flex', color: '#9cb8a5', fontSize: 12 }}>Band 4.0 – 9.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — browser mockup */}
        <div style={{ width: 430, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '44px 36px 44px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', background: '#1a2820', borderRadius: 14, overflow: 'hidden', border: '1px solid #d0edd8' }}>

            {/* Browser top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#141e17', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 5, background: '#ff5f57' }} />
                <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 5, background: '#febc2e' }} />
                <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 5, background: '#28c840' }} />
              </div>
              <div style={{ display: 'flex', flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 10px', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                climbielts.com/writing/result
              </div>
            </div>

            {/* App body */}
            <div style={{ display: 'flex', flexDirection: 'row', height: 442 }}>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', width: 82, background: '#0f1a11', padding: '14px 8px', gap: 4, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', color: '#16a344', fontSize: 11, fontWeight: 800, marginBottom: 10, padding: '4px 6px' }}>✦ Climb</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', background: '#16a344', borderRadius: 8, color: '#fff', fontSize: 10, fontWeight: 600 }}>
                  <div style={{ display: 'flex', width: 12, height: 12, border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 2 }} />
                  Writing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
                  <div style={{ display: 'flex', width: 12, height: 12, border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 2 }} />
                  Progress
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
                  <div style={{ display: 'flex', width: 12, height: 12, border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 2 }} />
                  History
                </div>
              </div>

              {/* Main content */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#f0f2f1', padding: '18px 20px' }}>

                {/* Score header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', color: '#6b7280', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 3 }}>OVERALL BAND SCORE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                      <div style={{ display: 'flex', color: '#16a344', fontSize: 46, fontWeight: 900, lineHeight: 1 }}>7.0</div>
                      <div style={{ display: 'flex', color: '#9ca3af', fontSize: 16, fontWeight: 700 }}>/9</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', color: '#9ca3af', fontSize: 8, fontWeight: 600 }}>Mục tiêu</div>
                    <div style={{ display: 'flex', color: '#16a344', fontSize: 20, fontWeight: 900 }}>7.5</div>
                  </div>
                </div>

                {/* Criteria bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {CRITERIA.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', color: '#6b7280', fontSize: 9, fontWeight: 700, width: 26 }}>{c.name}</div>
                      <div style={{ display: 'flex', flex: 1, height: 5, background: '#e5e7eb', borderRadius: 99 }}>
                        <div style={{ display: 'flex', width: `${c.pct}%`, height: '100%', background: '#16a344', borderRadius: 99 }} />
                      </div>
                      <div style={{ display: 'flex', color: '#374151', fontSize: 9, fontWeight: 700, width: 24 }}>{c.score}</div>
                    </div>
                  ))}
                </div>

                {/* Corrections */}
                <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', color: '#6b7280', fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>LỖI PHÁT HIỆN</div>
                  <div style={{ display: 'flex', color: '#374151', fontSize: 9, lineHeight: 1.7, borderLeft: '2px solid #16a344', paddingLeft: 7, marginBottom: 4 }}>
                    do positive impacts → have positive impacts
                  </div>
                  <div style={{ display: 'flex', color: '#374151', fontSize: 9, lineHeight: 1.7, borderLeft: '2px solid #16a344', paddingLeft: 7, marginBottom: 4 }}>
                    reductions on → reductions in
                  </div>
                  <div style={{ display: 'flex', color: '#374151', fontSize: 9, lineHeight: 1.7, borderLeft: '2px solid #16a344', paddingLeft: 7 }}>
                    make a rise → experience a rise
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    ),
    { width: 1200, height: 630 },
  )
}
