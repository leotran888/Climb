import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0c1a0e',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 56px 56px 72px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '28px' }}>
              <div style={{ width: '5px', height: '10px', background: '#16a344', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '16px', background: '#16a344', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '22px', background: '#16a344', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '28px', background: '#16a344', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800, lineHeight: '1', letterSpacing: '-0.02em' }}>Climb</div>
              <div style={{ color: '#16a344', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em' }}>IELTS</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a344' }} />
              <div style={{ color: '#16a344', fontSize: '15px', fontWeight: 600, letterSpacing: '0.04em' }}>
                AI chấm bài IELTS Writing
              </div>
            </div>
            <div style={{ color: '#ffffff', fontSize: '68px', fontWeight: 900, lineHeight: '1.05', letterSpacing: '-0.03em' }}>Leo thang</div>
            <div style={{ color: '#ffffff', fontSize: '68px', fontWeight: 900, lineHeight: '1.05', letterSpacing: '-0.03em' }}>band score</div>
            <div style={{ color: '#16a344', fontSize: '68px', fontWeight: 900, lineHeight: '1.05', letterSpacing: '-0.03em' }}>với AI thật sự</div>
            <div style={{ marginTop: '24px', color: 'rgba(255,255,255,0.45)', fontSize: '18px', fontWeight: 400, lineHeight: '1.5' }}>
              Chấm bài trong 60 giây · Phản hồi theo 4 tiêu chí · Miễn phí
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>www.climbielts.com</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a344' }} />
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>10.000+ bài đã chấm</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a344' }} />
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Band 4.0 – 9.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — score card */}
        <div
          style={{
            width: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 40px 48px 0px',
          }}
        >
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', marginBottom: '6px' }}>
              OVERALL BAND SCORE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <div style={{ color: '#16a344', fontSize: '76px', fontWeight: 900, lineHeight: '1' }}>7.0</div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '24px', fontWeight: 700 }}>/9</div>
            </div>

            {[
              { name: 'TR',  pct: 78, score: '7.0' },
              { name: 'CC',  pct: 72, score: '6.5' },
              { name: 'LR',  pct: 78, score: '7.0' },
              { name: 'GRA', pct: 83, score: '7.5' },
            ].map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, width: '30px' }}>{c.name}</div>
                <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: '#16a344', borderRadius: '99px' }} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: 600, width: '28px', textAlign: 'right' }}>{c.score}</div>
              </div>
            ))}

            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', color: 'rgba(22,163,68,0.8)', fontSize: '11px', fontWeight: 600 }}>
              3 lỗi ngữ pháp được phát hiện
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
