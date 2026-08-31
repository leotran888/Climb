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
            <li><a href="#pricing">Bảng giá</a></li>
          </ul>
          <div className={s.navBtns}>
            <Link href="/login" className={s.btnGhost}>Đăng nhập</Link>
            <Link href="/register" className={s.btnNav}>Thử miễn phí</Link>
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
            <p className={s.heroSub}>AI viết lại bài của bạn đạt Band mục tiêu — không chỉ chỉ lỗi. Phản hồi trong 60 giây, hiểu đúng lỗi đặc thù của học viên Việt.</p>
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
            <h2 className={s.h2}>Không AI nào làm được<br />những thứ này</h2>
            <p className={s.sub}>Climb được xây riêng cho học viên IELTS Việt — không phải grammar tool dịch sang tiếng Việt.</p>
          </div>
          <div className={s.featGrid}>
            <div className={`${s.featCard} ${s.reveal}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <h3 className={s.featTitle}>Bài viết chuẩn band mục tiêu của bạn</h3>
              <p className={s.featDesc}>AI không chỉ chỉ lỗi — còn viết lại toàn bộ bài của bạn ở Band 7.0, 7.5 hoặc 8.0. Đây là cách học nhanh nhất để nội hoá cấu trúc câu học thuật.</p>
              <span className={s.featPill}>Upgraded Essay</span>
            </div>
            <div className={`${s.featCard} ${s.reveal} ${s.d1}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <h3 className={s.featTitle}>Hiểu đúng lỗi của học viên Việt</h3>
              <p className={s.featDesc}>Tiếng Việt không có mạo từ, không chia thì, không biến đổi số nhiều. Climb biết chính xác những lỗi cấu trúc mà học sinh Việt hay mắc — không phải feedback kiểu generic.</p>
              <span className={s.featPill}>Vietnamese-native AI</span>
            </div>
            <div className={`${s.featCard} ${s.reveal} ${s.d2}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-8" />
                </svg>
              </div>
              <h3 className={s.featTitle}>Band score đủ 4 tiêu chí như examiner thật</h3>
              <p className={s.featDesc}>TR · CC · LR · GRA — đúng rubric IELTS Writing band descriptors, không phải "grammar + vocabulary" chung chung. Band score có thể so với kết quả thi thật.</p>
              <span className={s.featPill}>Examiner-accurate · Band 4.0–9.0</span>
            </div>
            <div className={`${s.featCard} ${s.reveal} ${s.d3}`}>
              <div className={s.featIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className={s.featTitle}>Biểu đồ leo thang band score</h3>
              <p className={s.featDesc}>Mỗi bài nộp là một điểm trên biểu đồ tiến độ. Thấy ngay đường band score thay đổi theo thời gian, biết mình yếu nhất tiêu chí nào để tập trung đúng chỗ.</p>
              <span className={s.featPill}>Progress Tracking</span>
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
              <h3 className={s.stepTitle}>Nộp bài luận</h3>
              <p className={s.stepDesc}>Dán bài viết vào, chọn Task 1 hoặc Task 2, thêm đề bài hoặc upload ảnh biểu đồ nếu có.</p>
            </div>
            <div className={`${s.hiwStep} ${s.reveal} ${s.d1}`}>
              <div className={s.stepNum}>2</div>
              <h3 className={s.stepTitle}>AI phân tích song song</h3>
              <p className={s.stepDesc}>Hai mô hình AI chạy song song — một chấm điểm 4 tiêu chí, một tìm lỗi ngữ pháp — để cho ra kết quả nhanh nhất có thể.</p>
            </div>
            <div className={`${s.hiwStep} ${s.reveal} ${s.d2}`}>
              <div className={s.stepNum}>3</div>
              <h3 className={s.stepTitle}>Nhận kết quả đầy đủ</h3>
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

      {/* PRICING */}
      <section className={s.pricing} id="pricing">
        <div className={s.wrap}>
          <div className={`${s.sectionHead} ${s.reveal}`}>
            <p className={s.eyebrow}>Bảng giá</p>
            <h2 className={s.h2}>Đầu tư nhỏ,<br />tăng band score lớn</h2>
            <p className={s.sub}>Bắt đầu miễn phí — nâng cấp bất cứ lúc nào khi bạn sẵn sàng luyện nghiêm túc hơn.</p>
          </div>

          <div className={`${s.pricingGrid} ${s.reveal}`}>
            {/* FREE */}
            <div className={s.planCard}>
              <p className={s.planName}>Free</p>
              <div className={`${s.planPrice} ${s.planPriceFree}`}>0đ</div>
              <p className={s.planPriceSub}>Mãi mãi miễn phí</p>
              <p className={`${s.planPriceDay} ${s.planPriceDayMuted}`}>Không cần thẻ tín dụng</p>
              <p className={s.planDesc}>Làm quen với Climb trước khi cam kết.</p>
              <div className={s.planDivider} />
              <ul className={s.planFeatures}>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>2 lượt Writing AI/tháng</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>3 topic Vocabulary</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Xem lịch sử bài nộp</li>
                <li className={`${s.planFeat} ${s.planFeatLocked}`}><span className={s.lockIcon}>✗</span>18 topic Vocabulary</li>
                <li className={`${s.planFeat} ${s.planFeatLocked}`}><span className={s.lockIcon}>✗</span>Speaking AI</li>
              </ul>
              <button className={`${s.planCta} ${s.planCtaGhost}`} onClick={() => { location.href = '/register' }}>
                Bắt đầu miễn phí
              </button>
            </div>

            {/* STARTER */}
            <div className={s.planCard}>
              <p className={s.planName}>Starter</p>
              <div className={s.planPrice}>99<span style={{ fontSize: 18, fontWeight: 700 }}>k</span></div>
              <p className={s.planPriceSub}>/tháng</p>
              <p className={s.planPriceDay}>~3.300đ/ngày</p>
              <p className={s.planDesc}>Học từ vựng bài bản, luyện Writing đều đặn mỗi tuần.</p>
              <div className={s.planDivider} />
              <ul className={s.planFeatures}>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>10 lượt Writing AI/tháng</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>18 topic Vocabulary đầy đủ</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Lưu từ & theo dõi tiến độ</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Lịch sử bài nộp đầy đủ</li>
                <li className={`${s.planFeat} ${s.planFeatLocked}`}><span className={s.lockIcon}>✗</span>Speaking AI</li>
              </ul>
              <button className={`${s.planCta} ${s.planCtaSecondary}`} onClick={() => { location.href = '/register' }}>
                Chọn Starter
              </button>
            </div>

            {/* PRO */}
            <div className={`${s.planCard} ${s.planCardPro}`}>
              <div className={`${s.planBadge} ${s.planBadgePop}`}>🔥 Phổ biến nhất</div>
              <p className={`${s.planName} ${s.planNameLight}`}>Pro</p>
              <div className={`${s.planPrice} ${s.planPriceLight}`}>199<span style={{ fontSize: 18, fontWeight: 700 }}>k</span></div>
              <p className={`${s.planPriceSub} ${s.planPriceSubLight}`}>/tháng</p>
              <p className={s.planPriceDay}>~6.600đ/ngày — đổi lấy 1 band score</p>
              <p className={`${s.planDesc} ${s.planDescLight}`}>Luyện không giới hạn, tăng band nhanh nhất có thể.</p>
              <div className={`${s.planDivider} ${s.planDividerLight}`} />
              <ul className={s.planFeatures}>
                <li className={`${s.planFeat} ${s.planFeatLight}`}><span className={s.checkIcon}>✓</span>Writing AI <strong>không giới hạn</strong></li>
                <li className={`${s.planFeat} ${s.planFeatLight}`}><span className={s.checkIcon}>✓</span>Speaking AI 15 lượt/tháng</li>
                <li className={`${s.planFeat} ${s.planFeatLight}`}><span className={s.checkIcon}>✓</span>18 topic Vocabulary đầy đủ</li>
                <li className={`${s.planFeat} ${s.planFeatLight}`}><span className={s.checkIcon}>✓</span>Lưu từ & theo dõi tiến độ</li>
                <li className={`${s.planFeat} ${s.planFeatLight}`}><span className={s.checkIcon}>✓</span>Ưu tiên xử lý nhanh hơn</li>
              </ul>
              <button className={`${s.planCta} ${s.planCtaPrimary}`} onClick={() => { location.href = '/register' }}>
                Chọn Pro ngay
              </button>
            </div>

            {/* PRO YEARLY */}
            <div className={`${s.planCard} ${s.planCardYearly}`}>
              <div className={`${s.planBadge} ${s.planBadgeSaveGreen}`}>✦ Tiết kiệm nhất</div>
              <p className={s.planName}>Pro · 1 năm</p>
              <div className={s.planPrice}>1.49<span style={{ fontSize: 18, fontWeight: 700 }}>M</span></div>
              <p className={s.planPriceSub}>/năm · ~124k/tháng</p>
              <p className={s.planPriceDay}>~4.100đ/ngày</p>
              <p className={s.planDesc}>Cam kết cả lộ trình — tiết kiệm gần 1 triệu mỗi năm.</p>
              <div className={s.planDivider} />
              <ul className={s.planFeatures}>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Mọi thứ trong Pro</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Tiết kiệm 998.000đ/năm</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Tương đương 2 tháng miễn phí</li>
                <li className={s.planFeat}><span className={s.checkIcon}>✓</span>Ưu tiên hỗ trợ</li>
              </ul>
              <button className={`${s.planCta} ${s.planCtaYearly}`} onClick={() => { location.href = '/register' }}>
                Chọn Pro Yearly
              </button>
              <p className={s.planSaving}>Tiết kiệm 998.000đ so với mua tháng</p>
            </div>
          </div>

          <p className={s.pricingFootnote}>Tất cả gói đều có thể hủy bất cứ lúc nào · Thanh toán an toàn</p>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaWrap}>
        <div className={s.wrap}>
          <h2 className={s.ctaH2}>
            Bạn đã sẵn sàng<br /><span className={s.ctaBk}>Climb</span> chưa?
          </h2>
          <p className={s.ctaP}>Nộp bài luận đầu tiên miễn phí — kết quả chi tiết, không chờ đợi.</p>
          <Link href="/register" className={s.btnCta}>Tạo tài khoản miễn phí</Link>
          <p className={s.ctaNote}>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Climb IELTS chấm bài theo tiêu chí nào?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Climb IELTS chấm theo 4 tiêu chí chuẩn của Cambridge: Task Response (TR), Coherence & Cohesion (CC), Lexical Resource (LR), và Grammatical Range & Accuracy (GRA). Mỗi tiêu chí được chấm riêng và tổng hợp thành band score từ 4.0 đến 9.0.',
                },
              },
              {
                '@type': 'Question',
                name: 'Climb IELTS có hỗ trợ Task 1 và Task 2 không?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Có. Climb IELTS hỗ trợ cả Task 1 Academic (có thể upload ảnh biểu đồ), Task 1 General Training, và Task 2 cho cả Academic lẫn General. AI sẽ đánh giá đúng tiêu chí Task Achievement tương ứng với từng dạng bài.',
                },
              },
              {
                '@type': 'Question',
                name: 'Kết quả chấm bài mất bao lâu?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Thông thường từ 30 đến 90 giây. Hệ thống chạy song song hai mô hình AI để cho kết quả nhanh nhất có thể.',
                },
              },
              {
                '@type': 'Question',
                name: 'Gói miễn phí có những gì?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Gói Free cho phép bạn chấm 2 bài Writing AI mỗi tháng, truy cập 3 topic từ vựng Writing, và xem lịch sử bài nộp. Không cần thẻ tín dụng, miễn phí mãi mãi.',
                },
              },
              {
                '@type': 'Question',
                name: 'Climb IELTS có chính xác như giám khảo thật không?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Climb IELTS được thiết kế để phản ánh tiêu chí chấm thi IELTS chính thức và cho kết quả tham khảo có độ chính xác cao. Tuy nhiên điểm số AI là điểm ước lượng và không thay thế điểm thi IELTS chính thức.',
                },
              },
            ],
          }),
        }}
      />

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footInner}`}>
          <span className={s.footCopy}>© 2025 Climb IELTS. All rights reserved.</span>
          <nav className={s.footLinks} aria-label="Footer">
            <Link href="/privacy">Chính sách bảo mật</Link>
            <Link href="/terms">Điều khoản sử dụng</Link>
            <a href="mailto:support@climbielts.com">Liên hệ</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
