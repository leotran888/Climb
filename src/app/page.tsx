import Link from 'next/link'
import ClimbMascotInteractive from '@/components/ClimbMascotInteractive'

function ClimbMascot() {
  return (
    <div className="relative inline-block select-none">
      <svg width="200" height="218" viewBox="0 0 200 218" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft glow ring */}
        <circle cx="100" cy="118" r="92" fill="rgba(255,255,255,0.08)"/>
        {/* Body */}
        <circle cx="100" cy="118" r="78" fill="#1ab852"/>
        {/* Shine highlight */}
        <ellipse cx="80" cy="90" rx="34" ry="21" fill="rgba(255,255,255,0.18)" transform="rotate(-22 80 90)"/>
        {/* Eyes */}
        <circle cx="76" cy="112" r="14" fill="white"/>
        <circle cx="124" cy="112" r="14" fill="white"/>
        <circle cx="79" cy="115" r="8.5" fill="#0a2e14"/>
        <circle cx="127" cy="115" r="8.5" fill="#0a2e14"/>
        <circle cx="74" cy="110" r="3.5" fill="white"/>
        <circle cx="122" cy="110" r="3.5" fill="white"/>
        {/* Smile */}
        <path d="M 75 140 Q 100 157 125 140" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/>
        {/* Cap brim */}
        <rect x="62" y="46" width="76" height="10" rx="3" fill="#0a2e14"/>
        {/* Cap top */}
        <polygon points="100,26 62,46 138,46" fill="#0a2e14"/>
        {/* Tassel */}
        <line x1="136" y1="46" x2="136" y2="62" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="136" cy="66" r="5" fill="#fbbf24"/>
      </svg>
      {/* Floating: achieved band */}
      <div
        className="absolute top-6 -right-12 bg-white rounded-2xl px-3 py-2 text-xs font-black text-emerald-700 whitespace-nowrap flex items-center gap-1.5"
        style={{ boxShadow: '0 4px 16px rgba(22,163,68,0.18)', border: '1.5px solid #d1fae5' }}
      >
        🎯 Band 7.5 đạt rồi!
      </div>
      {/* Floating: improvement */}
      <div
        className="absolute bottom-16 -left-10 bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap"
        style={{ boxShadow: '0 4px 12px rgba(22,163,68,0.35)' }}
      >
        +1.5 bands ↑
      </div>
    </div>
  )
}

function BlobChar({ shade }: { shade: string }) {
  return (
    <svg viewBox="0 0 180 126" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[150px] mx-auto block">
      <ellipse cx="90" cy="70" rx="70" ry="54" fill={shade}/>
      <circle cx="65" cy="60" r="13" fill="white"/>
      <circle cx="115" cy="60" r="13" fill="white"/>
      <circle cx="68" cy="63" r="8" fill="#0a0a0a"/>
      <circle cx="118" cy="63" r="8" fill="#0a0a0a"/>
      <circle cx="63" cy="58" r="3" fill="white"/>
      <circle cx="113" cy="58" r="3" fill="white"/>
      <path d="M 65 88 Q 90 104 115 88" fill="none" stroke="#0a0a0a" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#f7f8f5' }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight">Climb</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors btn-press shadow-sm shadow-emerald-200"
            >
              Bắt đầu miễn phí →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="grid-bg relative overflow-hidden"
        style={{ background: '#137a34' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: '#1ab852' }} />
        <div className="absolute -bottom-16 right-24 w-60 h-60 rounded-full opacity-10" style={{ background: '#1ab852' }} />

        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/75 text-xs font-bold uppercase tracking-widest">Climb IELTS</span>
            </div>
            <h1 className="text-[60px] font-black text-white leading-[1.05] mb-5">
              Know your level.<br/>
              <span style={{ color: '#fbbf24' }}>Climb higher.</span>
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-md">
              Luyện Writing & Speaking cùng AI thông minh. Nhận phản hồi chi tiết bằng tiếng Việt, cải thiện band score từng ngày.
            </p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="bg-white text-emerald-700 px-6 py-3.5 rounded-2xl font-black text-base hover:bg-emerald-50 transition-colors btn-press"
                style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
              >
                Bắt đầu miễn phí →
              </Link>
              <Link href="/login" className="text-white/80 px-6 py-3.5 rounded-2xl font-semibold border border-white/20 hover:bg-white/10 transition-colors text-base">
                Đăng nhập
              </Link>
            </div>
            {/* Social proof */}
            <p className="text-white/35 text-xs mt-6 font-medium">✦ Không cần thẻ tín dụng · Miễn phí để bắt đầu</p>
          </div>

          {/* Mascot */}
          <div className="flex justify-center items-center py-8 pr-8">
            <ClimbMascotInteractive />
          </div>
        </div>
      </section>

      {/* Warm accent strip */}
      <div style={{ background: 'linear-gradient(90deg, #16a344 0%, #fbbf24 50%, #f97316 100%)', height: '5px' }} />

      {/* ── Skills section ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">✦ Tính năng</p>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Luyện thi từng kỹ năng</h2>
            <p className="text-slate-400 text-lg">Chọn kỹ năng bạn muốn cải thiện hôm nay</p>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* Writing */}
            <Link href="/register" className="group block">
              <div
                className="rounded-[28px] overflow-hidden flex flex-col h-[420px] transition-all duration-200 group-hover:-translate-y-1.5"
                style={{ background: '#16a344', boxShadow: '0 8px 28px rgba(22,163,68,0.28)' }}
              >
                <div className="p-7 flex-1">
                  <div className="w-13 h-13 bg-white/90 rounded-2xl flex items-center justify-center mb-5 w-12 h-12">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                    </svg>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-black text-white">Writing</h3>
                    <span className="text-white/40 text-lg">✦</span>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    AI chấm điểm theo 4 tiêu chí IELTS, nhận xét chi tiết bằng tiếng Việt và bài viết nâng cấp.
                  </p>
                </div>
                <div className="px-8 flex justify-center -mb-1">
                  <BlobChar shade="rgba(0,0,0,0.16)"/>
                </div>
                <div className="px-6 pb-5 pt-1">
                  <span className="inline-block bg-black/15 text-white font-bold text-sm px-4 py-1.5 rounded-full">
                    Task 1 & Task 2
                  </span>
                </div>
              </div>
            </Link>

            {/* Speaking */}
            <div className="opacity-75">
              <div
                className="rounded-[28px] overflow-hidden flex flex-col h-[420px] cursor-not-allowed"
                style={{ background: '#e85c7a', boxShadow: '0 8px 28px rgba(232,92,122,0.22)' }}
              >
                <div className="p-7 flex-1">
                  <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e85c7a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                    </svg>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-black text-white">Speaking</h3>
                    <span className="text-white/40 text-lg">✦</span>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    Luyện Part 1, 2 & 3 với AI phản hồi về fluency, từ vựng và phát âm.
                  </p>
                </div>
                <div className="px-8 flex justify-center -mb-1">
                  <BlobChar shade="rgba(0,0,0,0.16)"/>
                </div>
                <div className="px-6 pb-5 pt-1">
                  <span className="inline-block bg-black/15 text-white font-bold text-sm px-4 py-1.5 rounded-full">
                    Sắp ra mắt ✨
                  </span>
                </div>
              </div>
            </div>

            {/* Vocabulary */}
            <Link href="/register" className="group block">
              <div
                className="rounded-[28px] overflow-hidden flex flex-col h-[420px] transition-all duration-200 group-hover:-translate-y-1.5"
                style={{ background: '#7c3aed', boxShadow: '0 8px 28px rgba(124,58,237,0.24)' }}
              >
                <div className="p-7 flex-1">
                  <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-black text-white">Từ vựng</h3>
                    <span className="text-white/40 text-lg">✦</span>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    Sổ từ vựng theo chủ đề, luyện qua flashcard lật 3D — nhớ lâu hơn, học vui hơn.
                  </p>
                </div>
                <div className="px-8 flex justify-center -mb-1">
                  <BlobChar shade="rgba(0,0,0,0.16)"/>
                </div>
                <div className="px-6 pb-5 pt-1">
                  <span className="inline-block bg-black/15 text-white font-bold text-sm px-4 py-1.5 rounded-full">
                    Sổ từ + Flashcard
                  </span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ background: '#0f7230' }} className="py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { n: '< 2 min', label: 'Nhận kết quả AI', sub: 'chấm điểm tức thì' },
            { n: '+1.5', label: 'Band tăng trung bình', sub: 'sau 3 tháng luyện tập' },
            { n: '100%', label: 'Tiếng Việt', sub: 'phản hồi dễ hiểu' },
          ].map(s => (
            <div key={s.n}>
              <p className="text-5xl font-black mb-1" style={{ color: '#fbbf24' }}>{s.n}</p>
              <p className="text-white font-bold text-sm">{s.label}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">✦ Quy trình</p>
            <h2 className="text-4xl font-black text-slate-900">Cách hoạt động</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                n: '01', title: 'Chọn bài thi', bg: '#f0fdf4', accent: '#16a344',
                desc: 'Chọn Task 1 (biểu đồ/sơ đồ) hoặc Task 2 (luận điểm). Viết ngay trong giao diện quen thuộc.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
              },
              {
                n: '02', title: 'AI chấm & nhận xét', bg: '#fffbeb', accent: '#d97706',
                desc: 'Claude AI phân tích theo 4 tiêu chí IELTS, cho điểm chi tiết và nhận xét bằng tiếng Việt dễ hiểu.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
              },
              {
                n: '03', title: 'Học & tiến bộ', bg: '#faf5ff', accent: '#7c3aed',
                desc: 'Đọc bài viết nâng cấp từ AI, lưu từ vựng hay và ôn luyện qua flashcard thông minh.',
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
              },
            ].map(s => (
              <div
                key={s.n}
                className="rounded-3xl p-7 relative overflow-hidden"
                style={{ background: s.bg, border: `1.5px solid ${s.accent}25`, boxShadow: `0 4px 20px ${s.accent}12` }}
              >
                <span className="absolute top-5 right-6 text-6xl font-black opacity-[0.07] leading-none text-slate-900">{s.n}</span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                  style={{ background: `${s.accent}15` }}
                >
                  {s.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-20 text-center grid-bg"
        style={{ background: '#137a34' }}
      >
        <div className="max-w-xl mx-auto px-6">
          <p className="text-white/50 font-bold text-xs uppercase tracking-widest mb-4">✦ Miễn phí để bắt đầu</p>
          <h2 className="text-5xl font-black text-white mb-4 leading-tight">
            Ready to<br/>climb higher?
          </h2>
          <p className="text-white/55 text-lg mb-8">Bắt đầu ngay hôm nay. Không cần thẻ tín dụng.</p>
          <Link
            href="/register"
            className="inline-block bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-colors btn-press"
            style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}
          >
            Tạo tài khoản miễn phí →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0a2e14' }} className="py-5 text-center">
        <p className="text-white/25 text-sm">© 2025 Climb · Built for IELTS learners</p>
      </footer>
    </div>
  )
}
