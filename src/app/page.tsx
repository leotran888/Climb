'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import s from './page.module.css'
import LionCanvas from '@/components/LionCanvas'

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const scoreNumRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const onScroll = () => nav.classList.toggle(s.navScrolled, window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mockup = mockupRef.current
    if (!mockup) return
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx * 4
      const dy = (e.clientY - cy) / cy * 2
      mockup.style.transform = `rotateY(${-14 + dx}deg) rotateX(${5 - dy}deg) rotateZ(.5deg)`
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    function animateScore() {
      const el = scoreNumRef.current
      if (!el) return
      const dur = 1600, t0 = performance.now()
      ;(function step(now: number) {
        const p = Math.min((now - t0) / dur, 1)
        const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
        const v = 7 * e
        el.innerHTML = (v >= 6.95 ? '7.0' : v.toFixed(1)) + '<span>/9</span>'
        if (p < 1) requestAnimationFrame(step)
      })(t0)
      document.querySelectorAll(`.${s.criterionFill}`).forEach(b => {
        const bar = b as HTMLElement
        setTimeout(() => { bar.style.width = (bar.dataset.val ?? '0') + '%' }, 300)
      })
    }
    const timer = setTimeout(animateScore, 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return
        en.target.classList.add(s.revealIn)
        en.target.querySelectorAll('[data-count-target]').forEach(c => {
          const el = c as HTMLElement
          const target = +(el.dataset.countTarget ?? 0)
          const t0 = performance.now()
          ;(function step(now: number) {
            const p = Math.min((now - t0) / 1800, 1)
            const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
            el.textContent = Math.floor(target * e).toLocaleString()
            if (p < 1) requestAnimationFrame(step)
          })(t0)
        })
        io.unobserve(en.target)
      })
    }, { threshold: 0.12 })
    document.querySelectorAll(`.${s.reveal}`).forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const cards = document.querySelectorAll(`.${s.featCard}`)
    const cleanups: (() => void)[] = []
    cards.forEach(card => {
      const el = card as HTMLElement
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`
        el.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
        el.style.setProperty('--my', `${(y + 0.5) * 100}%`)
      }
      const onLeave = () => { el.style.transform = '' }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })
    return () => cleanups.forEach(fn => fn())
  }, [])

  return (
    <div className={s.lp}>
      {/* NAV */}
      <nav ref={navRef} className={s.nav}>
        <div className={`${s.wrap} ${s.navInner}`}>
          <Link href="/" className={s.logo}>
            <svg width="24" height="28" viewBox="0 0 36 42" fill="none">
              <path d="M2 40 L2 32.5 Q2 29 5.5 29 L8.5 29 Q12 29 12 25.5 L12 21.5 Q12 18 15.5 18 L18.5 18 Q22 18 22 14.5 L22 11.5 Q22 8 25.5 8 L34 8"
                stroke="#16a344" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className={s.logoText}>
              <span className={s.logoWord}>Climb</span>
              <span className={s.logoTag}>IELTS</span>
            </div>
          </Link>
          <ul className={s.navLinks}>
            <li><a href="#features">Tính năng</a></li>
            <li><a href="#how">Cách hoạt động</a></li>
            <li><a href="#testimonials">Đánh giá</a></li>
          </ul>
          <div className={s.navBtns}>
            <button className={s.btnGhost} onClick={() => { location.href = '/login' }}>Đăng nhập</button>
            <button className={s.btnNav} onClick={() => { location.href = '/register' }}>Thử miễn phí</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={s.hero}>
        <LionCanvas />
        <div style={{ display: 'contents' }}>
          <div style={{ paddingLeft: 28 }}>
            <div className={s.heroEyebrow}>
              <span className={s.pulse}></span>AI chấm bài IELTS Writing
            </div>
            <h1 className={s.h1}>
              Leo thang band <span id="scoreWord">score</span><br />
              với <span className={s.acc}>AI thật sự</span>
            </h1>
            <p className={s.heroSub}>Nhận điểm band 4 tiêu chí, sửa lỗi từng câu và gợi ý từ vựng nâng cấp — chính xác như giám khảo IELTS.</p>
            <div className={s.heroCta}>
              <button className={s.btnPrimary} onClick={() => { location.href = '/register' }}>Bắt đầu miễn phí</button>
              <button className={s.btnLink} onClick={() => { location.href = '/writing' }}>
                Xem demo
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className={s.heroTrust}>
              <div className={s.stars}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span>Hàng trăm học viên đã cải thiện band score Writing</span>
            </div>
          </div>

          {/* 3D App Mockup */}
          <div className={s.heroVisual} style={{ paddingRight: 28 }}>
            <div className={`${s.chip} ${s.chipA}`}>Band 7.0 đạt rồi 🎯</div>
            <div className={`${s.chip} ${s.chipB}`}>+1.5 sau 8 tuần</div>
            <div className={s.mockupScene}>
              <div className={s.mockup} ref={mockupRef}>
                <div className={s.browserTop}>
                  <div className={s.browserDots}>
                    <span /><span /><span />
                  </div>
                  <div className={s.browserBar}>climbielts.com/writing/result</div>
                </div>
                <div className={s.appBody}>
                  <div className={s.appSidebar}>
                    <div className={s.appLogo}>✦ Climb</div>
                    <div className={`${s.appNavItem} ${s.appNavItemActive}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      </svg>
                      Writing
                    </div>
                    <div className={s.appNavItem}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-8" />
                      </svg>
                      Progress
                    </div>
                    <div className={s.appNavItem}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 6h16M4 12h16M4 18h10" />
                      </svg>
                      History
                    </div>
                  </div>
                  <div className={s.appMain}>
                    <div className={s.appScoreHeader}>
                      <div>
                        <div className={s.overallLabel}>Overall Band Score</div>
                        <div className={s.overallNum} ref={scoreNumRef}>–<span>/9</span></div>
                      </div>
                      <div className={s.scoreBadge}>
                        <div className={s.scoreBadgeLabel}>Mục tiêu</div>
                        <div className={s.scoreBadgeVal}>7.5</div>
                      </div>
                    </div>
                    <div className={s.criteria}>
                      {[
                        { name: 'TR', val: '77.7', score: '7.0' },
                        { name: 'CC', val: '72.2', score: '6.5' },
                        { name: 'LR', val: '77.7', score: '7.0' },
                        { name: 'GRA', val: '83.3', score: '7.5' },
                      ].map(c => (
                        <div key={c.name} className={s.criterion}>
                          <span className={s.criterionName}>{c.name}</span>
                          <div className={s.criterionBar}>
                            <div className={s.criterionFill} data-val={c.val} />
                          </div>
                          <span className={s.criterionScore}>{c.score}</span>
                        </div>
                      ))}
                    </div>
                    <div className={s.corrections}>
                      <div className={s.correctionsLabel}>Lỗi phát hiện</div>
                      <div className={s.corrItem}>do positive impacts → have positive impacts</div>
                      <div className={s.corrItem}>reductions on → reductions in</div>
                      <div className={s.corrItem}>make a rise → experience a rise</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={s.mockupShadow} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className={s.stats}>
        <div className={s.wrap}>
          <div className={s.statsGrid}>
            <div className={`${s.stat} ${s.reveal}`}>
              <div className={s.statN}>
                <span data-count-target="10000">0</span><span className={s.statU}>+</span>
              </div>
              <div className={s.statL}>Bài luận đã chấm</div>
            </div>
            <div className={`${s.stat} ${s.reveal} ${s.d1}`}>
              <div className={s.statN}>4<span className={s.statU}> tiêu chí</span></div>
              <div className={s.statL}>Đánh giá chuẩn IELTS</div>
            </div>
            <div className={`${s.stat} ${s.reveal} ${s.d2}`}>
              <div className={s.statN}>24<span className={s.statU}>/7</span></div>
              <div className={s.statL}>Chấm bài bất cứ lúc nào</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className={s.features} id="features">
        <div className={s.wrap}>
          <div className={`${s.sectionHead} ${s.reveal}`}>
            <p className={s.eyebrow}>Tính năng</p>
            <h2 className={s.h2}>Mọi thứ bạn cần để<br />tăng band score Writing</h2>
            <p className={s.sub}>Không chỉ là điểm số — Climb giúp bạn hiểu rõ từng lỗi sai và cách khắc phục.</p>
          </div>
          <div className={s.featGrid}>
            <div className={`${s.featCard} ${s.reveal}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-8" />
                </svg>
              </div>
              <div className={s.featTitle}>Chấm điểm 4 tiêu chí chuẩn IELTS</div>
              <p className={s.featDesc}>Task Response, Coherence &amp; Cohesion, Lexical Resource, Grammatical Range &amp; Accuracy — band score 0.5 chính xác với giải thích chi tiết bằng tiếng Việt.</p>
              <span className={s.featPill}>Band 4.0 – 9.0</span>
            </div>
            <div className={`${s.featCard} ${s.reveal} ${s.d1}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
              </div>
              <div className={s.featTitle}>Sửa lỗi từng câu một</div>
              <p className={s.featDesc}>AI phát hiện lỗi ngữ pháp, từ vựng, collocation và cấu trúc câu — kèm giải thích tại sao sai và cách sửa cụ thể.</p>
              <span className={s.featPill}>Grammar · Collocation · Article</span>
            </div>
            <div className={`${s.featCard} ${s.reveal} ${s.d2}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className={s.featTitle}>Nâng cấp từ vựng &amp; câu văn</div>
              <p className={s.featDesc}>Gợi ý từ đồng nghĩa chính xác hơn, cải thiện câu văn để nghe tự nhiên và học thuật hơn — không phải thay bừa từ khó.</p>
              <span className={s.featPill}>Vocabulary · Paraphrase</span>
            </div>
            <div className={`${s.featCard} ${s.reveal} ${s.d3}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 14v6M14.5 17h6" />
                </svg>
              </div>
              <div className={s.featTitle}>Task 1 &amp; Task 2 đều được hỗ trợ</div>
              <p className={s.featDesc}>Upload ảnh biểu đồ cho Task 1 Academic, hoặc nhập đề bài cho Task 2 — AI hiểu ngữ cảnh để đánh giá đúng tiêu chí Task Achievement.</p>
              <span className={s.featPill}>Task 1 · Task 2 · Academic · General</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={s.hiw} id="how">
        <div className={s.wrap}>
          <div className={`${s.sectionHead} ${s.reveal}`}>
            <p className={s.eyebrow}>Cách hoạt động</p>
            <h2 className={s.hiwH2}>Ba bước để nhận<br />phản hồi chi tiết</h2>
            <p className={s.hiwSub}>Đơn giản như nộp bài — phức tạp ở phía AI.</p>
          </div>
          <div className={s.hiwGrid}>
            <div className={`${s.hiwStep} ${s.reveal}`}>
              <div className={s.stepNum}>1</div>
              <div className={s.stepTitle}>Nộp bài luận</div>
              <p className={s.stepDesc}>Dán bài viết vào, chọn Task 1 hoặc Task 2, thêm đề bài hoặc upload ảnh biểu đồ nếu có.</p>
            </div>
            <div className={`${s.hiwStep} ${s.reveal} ${s.d1}`}>
              <div className={s.stepNum}>2</div>
              <div className={s.stepTitle}>AI phân tích song song</div>
              <p className={s.stepDesc}>Hai mô hình AI chạy song song — một chấm điểm 4 tiêu chí, một tìm lỗi ngữ pháp — để cho ra kết quả nhanh nhất có thể.</p>
            </div>
            <div className={`${s.hiwStep} ${s.reveal} ${s.d2}`}>
              <div className={s.stepNum}>3</div>
              <div className={s.stepTitle}>Nhận kết quả đầy đủ</div>
              <p className={s.stepDesc}>Band score chi tiết, danh sách lỗi sai, gợi ý từ vựng và bài tập cải thiện — tất cả trong một trang kết quả.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={s.testimonials} id="testimonials">
        <div className={s.wrap}>
          <div className={`${s.sectionHead} ${s.reveal}`}>
            <p className={s.eyebrow}>Đánh giá</p>
            <h2 className={s.h2}>Học viên nói gì<br />về Climb?</h2>
            <p className={s.sub}>Những câu chuyện thật từ những người đã cải thiện band score.</p>
          </div>
          <div className={s.testGrid}>
            <div className={`${s.testCard} ${s.reveal}`}>
              <div className={s.testScore}>
                <span className={s.scoreFrom}>5.5</span>
                <span className={s.scoreArr}>→</span>
                <span className={s.scoreTo}>7.0</span>
              </div>
              <p className={s.testQuote}>&ldquo;Climb giúp tôi hiểu rõ từng lỗi sai hơn cả giám khảo. Không còn bị điểm thấp vì collocation sai nữa.&rdquo;</p>
              <div className={s.testPerson}>
                <div className={s.testAv}>TN</div>
                <div>
                  <div className={s.testName}>Trần Nhật</div>
                  <div className={s.testMeta}>Sau 3 tháng luyện tập</div>
                </div>
              </div>
            </div>
            <div className={`${s.testCard} ${s.reveal} ${s.d1}`}>
              <div className={s.testScore}>
                <span className={s.scoreFrom}>6.0</span>
                <span className={s.scoreArr}>→</span>
                <span className={s.scoreTo}>7.5</span>
              </div>
              <p className={s.testQuote}>&ldquo;Task 1 Academic luôn là điểm yếu của tôi. Nhờ Climb phát hiện đúng lỗi mô tả dữ liệu, tôi tăng 1.5 band chỉ trong 8 tuần.&rdquo;</p>
              <div className={s.testPerson}>
                <div className={s.testAv}>MA</div>
                <div>
                  <div className={s.testName}>Minh Anh</div>
                  <div className={s.testMeta}>Mục tiêu du học Úc</div>
                </div>
              </div>
            </div>
            <div className={`${s.testCard} ${s.reveal} ${s.d2}`}>
              <div className={s.testScore}>
                <span className={s.scoreFrom}>6.5</span>
                <span className={s.scoreArr}>→</span>
                <span className={s.scoreTo}>7.5</span>
              </div>
              <p className={s.testQuote}>&ldquo;Chấm bài nhanh và rẻ hơn gia sư nhiều. Quan trọng nhất là giải thích rõ tại sao bị điểm thấp, không phải chỉ nói &apos;cần cải thiện&apos;.&rdquo;</p>
              <div className={s.testPerson}>
                <div className={s.testAv}>PH</div>
                <div>
                  <div className={s.testName}>Phương Hà</div>
                  <div className={s.testMeta}>Luyện thi 6 tháng</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaWrap}>
        <div className={s.wrap}>
          <h2 className={s.ctaH2}>
            Bạn đã sẵn sàng<br /><span className={s.ctaBk}>Climb</span> chưa?
          </h2>
          <p className={s.ctaP}>Nộp bài luận đầu tiên miễn phí — kết quả chi tiết, không chờ đợi.</p>
          <button className={s.btnCta} onClick={() => { location.href = '/register' }}>Tạo tài khoản miễn phí</button>
          <p className={s.ctaNote}>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footInner}`}>
          <span className={s.footCopy}>© 2025 Climb IELTS. All rights reserved.</span>
          <ul className={s.footLinks}>
            <li><a href="#">Điều khoản</a></li>
            <li><a href="#">Quyền riêng tư</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
