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
      <div style={{ width: 1200, height: 630, background: '#0c1a0e', display: 'flex', flexDirection: 'row' }}>

        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 48px 56px 72px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 28 }}>
              <div style={{ display: 'flex', width: 5, height: 10, background: '#16a344', borderRadius: 2 }} />
              <div style={{ display: 'flex', width: 5, height: 16, background: '#16a344', borderRadius: 2 }} />
              <div style={{ display: 'flex', width: 5, height: 22, background: '#16a344', borderRadius: 2 }} />
              <div style={{ display: 'flex', width: 5, height: 28, background: '#16a344', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', color: '#ffffff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Climb</div>
              <div style={{ display: 'flex', color: '#16a344', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em' }}>IELTS</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, background: '#16a344' }} />
              <div style={{ display: 'flex', color: '#16a344', fontSize: 15, fontWeight: 600, letterSpacing: '0.04em' }}>AI chấm bài IELTS Writing</div>
            </div>
            <div style={{ display: 'flex', color: '#ffffff', fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>Leo thang</div>
            <div style={{ display: 'flex', color: '#ffffff', fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>band score</div>
            <div style={{ display: 'flex', color: '#16a344', fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>với AI thật sự</div>
            <div style={{ display: 'flex', marginTop: 24, color: 'rgba(255,255,255,0.45)', fontSize: 18, fontWeight: 400, lineHeight: 1.5 }}>
              Chấm bài trong 60 giây · Phản hồi theo 4 tiêu chí · Miễn phí
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>www.climbielts.com</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', width: 5, height: 5, borderRadius: 3, background: '#16a344' }} />
                <div style={{ display: 'flex', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>10.000+ bài đã chấm</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', width: 5, height: 5, borderRadius: 3, background: '#16a344' }} />
                <div style={{ display: 'flex', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Band 4.0 – 9.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — score card */}
        <div style={{ width: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px 48px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '28px 24px' }}>

            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', marginBottom: 6 }}>
              OVERALL BAND SCORE
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
              <div style={{ display: 'flex', color: '#16a344', fontSize: 76, fontWeight: 900, lineHeight: 1 }}>7.0</div>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.2)', fontSize: 24, fontWeight: 700 }}>/9</div>
            </div>

            {CRITERIA.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, width: 30 }}>{c.name}</div>
                <div style={{ display: 'flex', flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                  <div style={{ display: 'flex', width: `${c.pct}%`, height: '100%', background: '#16a344', borderRadius: 99 }} />
                </div>
                <div style={{ display: 'flex', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, width: 28 }}>{c.score}</div>
              </div>
            ))}

            <div style={{ display: 'flex', marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, color: 'rgba(22,163,68,0.8)', fontSize: 11, fontWeight: 600 }}>
              3 lỗi ngữ pháp được phát hiện
            </div>
          </div>
        </div>

      </div>
    ),
    { width: 1200, height: 630 },
  )
}
