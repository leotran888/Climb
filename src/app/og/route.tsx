import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0c1a0e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-80px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,68,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '200px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,68,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Score card — right side */}
        <div
          style={{
            position: 'absolute',
            right: '64px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '300px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Overall Band Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
            <div style={{ color: '#16a344', fontSize: '72px', fontWeight: 900, lineHeight: 1 }}>7.0</div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '22px', fontWeight: 700 }}>/9</div>
          </div>

          {/* Criteria bars */}
          {[
            { name: 'TR', pct: 78, score: '7.0' },
            { name: 'CC', pct: 72, score: '6.5' },
            { name: 'LR', pct: 78, score: '7.0' },
            { name: 'GRA', pct: 83, score: '7.5' },
          ].map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, width: '30px', flexShrink: 0 }}>{c.name}</div>
              <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${c.pct}%`, height: '100%', background: '#16a344', borderRadius: '99px' }} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600, width: '26px', textAlign: 'right' }}>{c.score}</div>
            </div>
          ))}

          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
            <div style={{ color: 'rgba(22,163,68,0.8)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em' }}>
              3 lỗi ngữ pháp được phát hiện
            </div>
          </div>
        </div>

        {/* Content — left side */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '680px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            {/* Staircase icon simplified */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '28px' }}>
              <div style={{ width: '5px', height: '10px', background: '#16a344', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '15px', background: '#16a344', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '21px', background: '#16a344', borderRadius: '2px' }} />
              <div style={{ width: '5px', height: '28px', background: '#16a344', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'white', fontSize: '20px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>Climb</div>
              <div style={{ color: '#16a344', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', lineHeight: 1, marginTop: '2px' }}>IELTS</div>
            </div>
          </div>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a344' }} />
            <div style={{ color: '#16a344', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
              AI chấm bài IELTS Writing
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <div style={{ color: 'white', fontSize: '64px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
              Leo thang
            </div>
            <div style={{ color: 'white', fontSize: '64px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
              band score
            </div>
            <div style={{ color: '#16a344', fontSize: '64px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
              với AI thật sự
            </div>
          </div>

          {/* Sub */}
          <div style={{ marginTop: '28px', color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: 400, lineHeight: 1.5 }}>
            Chấm bài trong 60 giây · Phản hồi theo 4 tiêu chí chuẩn IELTS · Miễn phí
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: 500 }}>
            climbielts.com
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a344' }} />
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>10.000+ bài luận đã chấm</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a344' }} />
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Band 4.0 – 9.0</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
