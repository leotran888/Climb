import Link from 'next/link'
import s from './page.module.css'

export default function LandingPage() {
  return (
    <div className={s.lp}>

      {/* ═══ NAV ═══ */}
      <nav className={s.nav}>
        <Link href="/" className={s.navLogo}>
          <div className={s.navIcon}>
            <svg width="20" height="23" viewBox="0 0 36 42" fill="none">
              <path d="M2 40L2 32.5Q2 29 5.5 29L8.5 29Q12 29 12 25.5L12 21.5Q12 18 15.5 18L18.5 18Q22 18 22 14.5L22 11.5Q22 8 25.5 8L34 8" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={s.navName}>Climb <em>IELTS</em></span>
        </Link>
        <nav className={s.navLinks}>
          <a href="#features">Tính năng</a>
          <a href="#pricing">Học phí</a>
          <a href="#about">Sứ mệnh</a>
        </nav>
        <Link href="/register" className={s.navCta}>Thử miễn phí →</Link>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className={s.hero}>
        <div className={s.heroL}>
          <span className={s.heroTag}>CLIMBIELTS.COM</span>
          <h1 className={s.heroH1}>
            Nền tảng<br/>
            <span className={s.warm}>Leo thang</span><br/>
            IELTS Writing
          </h1>
          <p className={s.heroSub}>AI viết lại bài của bạn đạt Band mục tiêu — không chỉ chỉ lỗi. Kho từ vựng 18 topic, hiểu đúng lỗi đặc thù học viên Việt.</p>
          <Link href="/register" className={s.heroBtn}>
            thử miễn phí ngay hôm nay
            <span className={s.arrow}>→</span>
          </Link>
        </div>

        <div className={s.heroR}>
          {/* sparkles */}
          <div className={s.sp} style={{top:'6%',left:'6%',animationDelay:'0s'}}>✦</div>
          <div className={s.sp} style={{top:'60%',right:'6%',animationDelay:'.8s',fontSize:'15px'}}>✦</div>
          <div className={s.sp} style={{bottom:'10%',left:'16%',animationDelay:'1.6s',fontSize:'12px'}}>✦</div>
          <div className={s.sp} style={{top:'22%',right:'2%',animationDelay:'.4s',fontSize:'11px'}}>✦</div>

          <div className={s.mascotWrap}>
            {/* chat bubble */}
            <div className={s.bubble}>
              Band hôm nay<br/>
              <strong>↑ 7.0 / 9.0</strong>
            </div>

            {/* Mountain mascot SVG */}
            <svg width="290" height="270" viewBox="0 0 290 270" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.heroMascotSvg}>
              <ellipse cx="145" cy="258" rx="115" ry="12" fill="rgba(0,0,0,0.1)"/>
              <path d="M18 242 Q18 90 145 48 Q272 90 272 242 Z" fill="#16a344"/>
              <path d="M18 242 Q18 90 145 48 L145 242Z" fill="rgba(0,0,0,0.07)"/>
              <ellipse cx="145" cy="66" rx="30" ry="18" fill="rgba(255,255,255,0.22)"/>
              <path d="M196 148 L216 148 L216 170 L236 170 L236 193" stroke="rgba(255,255,255,0.38)" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="216" cy="148" r="3" fill="rgba(255,255,255,0.5)"/>
              <circle cx="236" cy="170" r="3" fill="rgba(255,255,255,0.5)"/>
              <ellipse cx="104" cy="185" rx="13" ry="7" fill="rgba(255,255,255,0.12)"/>
              <ellipse cx="186" cy="185" rx="13" ry="7" fill="rgba(255,255,255,0.12)"/>
              <circle cx="118" cy="167" r="14" fill="#0b1e10"/>
              <circle cx="172" cy="167" r="14" fill="#0b1e10"/>
              <circle cx="122" cy="163" r="5" fill="white"/>
              <circle cx="176" cy="163" r="5" fill="white"/>
              <path d="M110 195 Q145 218 180 195" stroke="#0b1e10" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
              <line x1="145" y1="48" x2="145" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M145 26 L162 33 L145 40Z" fill="#f5aa00"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className={s.features} id="features">
        <div className={s.sectionTag}>✦ Tính năng độc quyền</div>
        <h2 className={s.h2}>Không AI nào<br/>làm được những thứ này</h2>
        <p className={s.sectionSub}>Climb được xây riêng cho học viên IELTS Việt — không phải grammar tool dịch sang tiếng Việt.</p>

        <div className={s.cards}>

          {/* Card 1: Upgraded Essay — periwinkle blue */}
          <div className={s.fc} style={{background:'linear-gradient(180deg,#7890d8 0%,#4a64b4 100%)'}}>
            <div className={s.fcTop}>
              <div className={s.fcIconSm}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8"/>
                  <line x1="8" y1="8" x2="16" y2="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="11.5" x2="14" y2="11.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="15" x2="15" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={s.fcCat}>Writing AI</div>
              <div className={s.fcTitle}>AI viết lại bài đạt đúng band mục tiêu</div>
              <div className={s.fcDesc}>Không chỉ chỉ lỗi — Climb tự viết lại toàn bộ essay ở Band 7.0 / 7.5 / 8.0 để bạn học từ bài chuẩn, không phải đoán mình nên sửa thế nào.</div>
            </div>
            <div className={s.fcIllus}>
              <svg viewBox="0 0 400 155" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <text x="52" y="44" fontSize="20" fill="rgba(245,192,60,.72)">✦</text>
                <text x="316" y="50" fontSize="14" fill="rgba(245,192,60,.56)">✦</text>
                <text x="350" y="28" fontSize="10" fill="rgba(245,192,60,.42)">✦</text>
                <text x="148" y="24" fontSize="8" fill="rgba(245,192,60,.34)">✦</text>
                <ellipse cx="200" cy="176" rx="178" ry="88" fill="rgba(0,0,0,0.16)"/>
                <ellipse cx="165" cy="122" rx="16" ry="19" fill="rgba(5,8,22,0.88)"/>
                <circle cx="172" cy="116" r="5.5" fill="white"/>
                <ellipse cx="235" cy="122" rx="16" ry="19" fill="rgba(5,8,22,0.88)"/>
                <circle cx="242" cy="116" r="5.5" fill="white"/>
              </svg>
              <div className={s.fcLabel}>UPGRADED ESSAY · ĐỘC QUYỀN</div>
            </div>
          </div>

          {/* Card 2: Vietnamese AI — forest green */}
          <div className={s.fc} style={{background:'linear-gradient(180deg,#58a462 0%,#2e7040 100%)'}}>
            <div className={s.fcTop}>
              <div className={s.fcIconSm}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="9" r="5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8"/>
                  <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={s.fcCat}>Vietnamese-Native AI</div>
              <div className={s.fcTitle}>Hiểu đúng lỗi của người học tiếng Việt</div>
              <div className={s.fcDesc}>AI hiểu nguyên nhân gốc rễ từ tiếng mẹ đẻ — không phải liệt kê lỗi ngữ pháp chung chung. Feedback đúng bệnh, sửa được ngay, không mắc lại lần sau.</div>
            </div>
            <div className={s.fcIllus}>
              <svg viewBox="0 0 400 155" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <text x="60" y="40" fontSize="18" fill="rgba(245,192,60,.70)">✦</text>
                <text x="320" y="55" fontSize="13" fill="rgba(245,192,60,.55)">✦</text>
                <text x="340" y="25" fontSize="9" fill="rgba(245,192,60,.40)">✦</text>
                <ellipse cx="358" cy="70" rx="18" ry="28" fill="rgba(255,255,255,0.12)" transform="rotate(-30,358,70)"/>
                <ellipse cx="340" cy="82" rx="14" ry="22" fill="rgba(255,255,255,0.08)" transform="rotate(-50,340,82)"/>
                <ellipse cx="200" cy="172" rx="155" ry="92" fill="rgba(0,0,0,0.16)"/>
                <ellipse cx="172" cy="120" rx="15" ry="18" fill="rgba(5,18,8,0.88)"/>
                <circle cx="179" cy="115" r="5" fill="white"/>
                <ellipse cx="228" cy="120" rx="15" ry="18" fill="rgba(5,18,8,0.88)"/>
                <circle cx="235" cy="115" r="5" fill="white"/>
              </svg>
              <div className={s.fcLabel}>VIETNAMESE-NATIVE AI</div>
            </div>
          </div>

          {/* Card 3: 4 Criteria — terracotta */}
          <div className={s.fc} style={{background:'linear-gradient(180deg,#cc7248 0%,#9a4c28 100%)'}}>
            <div className={s.fcTop}>
              <div className={s.fcIconSm}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={s.fcCat}>Examiner-accurate</div>
              <div className={s.fcTitle}>Chấm đủ 4 tiêu chí như examiner IELTS thật</div>
              <div className={s.fcDesc}>TR · CC · LR · GRA — biết mình đang yếu tiêu chí nào, không phải nhận về một điểm tổng không biết cải thiện từ đâu.</div>
            </div>
            <div className={s.fcIllus}>
              <svg viewBox="0 0 400 155" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <text x="48" y="40" fontSize="18" fill="rgba(245,192,60,.70)">✦</text>
                <text x="322" y="52" fontSize="12" fill="rgba(245,192,60,.55)">✦</text>
                <text x="352" y="30" fontSize="9" fill="rgba(245,192,60,.40)">✦</text>
                <rect x="62" y="22" width="56" height="22" rx="11" fill="rgba(255,255,255,0.22)"/>
                <text x="90" y="37" textAnchor="middle" fontSize="10" fill="white" fontFamily="Nunito,sans-serif" fontWeight="800">TR 7.0</text>
                <rect x="130" y="14" width="56" height="22" rx="11" fill="rgba(255,255,255,0.18)"/>
                <text x="158" y="29" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.9)" fontFamily="Nunito,sans-serif" fontWeight="800">CC 6.5</text>
                <rect x="218" y="18" width="56" height="22" rx="11" fill="rgba(255,255,255,0.18)"/>
                <text x="246" y="33" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.9)" fontFamily="Nunito,sans-serif" fontWeight="800">LR 7.0</text>
                <rect x="288" y="24" width="60" height="22" rx="11" fill="rgba(255,255,255,0.22)"/>
                <text x="318" y="39" textAnchor="middle" fontSize="10" fill="white" fontFamily="Nunito,sans-serif" fontWeight="800">GRA 7.5</text>
                <ellipse cx="200" cy="174" rx="165" ry="90" fill="rgba(0,0,0,0.16)"/>
                <ellipse cx="170" cy="121" rx="15" ry="18" fill="rgba(20,8,4,0.88)"/>
                <circle cx="177" cy="116" r="5" fill="white"/>
                <ellipse cx="230" cy="121" rx="15" ry="18" fill="rgba(20,8,4,0.88)"/>
                <circle cx="237" cy="116" r="5" fill="white"/>
              </svg>
              <div className={s.fcLabel}>BAND 4.0–9.0</div>
            </div>
          </div>

          {/* Card 4: Vocab 18 Topics — dusty mauve */}
          <div className={s.fc} style={{background:'linear-gradient(180deg,#c06070 0%,#8e4050 100%)'}}>
            <div className={s.fcTop}>
              <div className={s.fcIconSm}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className={s.fcCat}>18 IELTS Topics</div>
              <div className={s.fcTitle}>Vocab · Writing Phrases · Common Mistakes — 1.350+ mục IELTS</div>
              <div className={s.fcDesc}>Vocabulary · Collocations · Phrasal Verbs · Writing Phrases · Common Mistakes — 5 bộ tài liệu, 18 chủ đề IELTS, được biên soạn riêng cho học viên Việt.</div>
            </div>
            <div className={s.fcIllus}>
              <svg viewBox="0 0 400 155" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <text x="55" y="40" fontSize="18" fill="rgba(245,192,60,.68)">✦</text>
                <text x="318" y="52" fontSize="13" fill="rgba(245,192,60,.52)">✦</text>
                <text x="344" y="26" fontSize="9" fill="rgba(245,192,60,.38)">✦</text>
                <ellipse cx="140" cy="155" rx="90" ry="70" fill="rgba(0,0,0,0.14)"/>
                <ellipse cx="260" cy="160" rx="88" ry="66" fill="rgba(0,0,0,0.14)"/>
                <ellipse cx="200" cy="170" rx="115" ry="88" fill="rgba(0,0,0,0.16)"/>
                <ellipse cx="173" cy="118" rx="15" ry="18" fill="rgba(20,5,10,0.88)"/>
                <circle cx="180" cy="113" r="5" fill="white"/>
                <ellipse cx="227" cy="118" rx="15" ry="18" fill="rgba(20,5,10,0.88)"/>
                <circle cx="234" cy="113" r="5" fill="white"/>
              </svg>
              <div className={s.fcLabel}>WRITING PHRASES · 18 TOPICS</div>
            </div>
          </div>

          {/* Card 5: Progress Tracking — muted purple */}
          <div className={s.fc} style={{background:'linear-gradient(180deg,#8868c8 0%,#5a40a0 100%)'}}>
            <div className={s.fcTop}>
              <div className={s.fcIconSm}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={s.fcCat}>Progress Tracking</div>
              <div className={s.fcTitle}>Nhìn thấy band score leo từng bài một</div>
              <div className={s.fcDesc}>Biểu đồ band score theo thời gian, xem mình đang cải thiện tiêu chí nào nhanh nhất — không phải tự đánh giá cảm tính.</div>
            </div>
            <div className={s.fcIllus}>
              <svg viewBox="0 0 400 155" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <text x="50" y="42" fontSize="18" fill="rgba(245,192,60,.68)">✦</text>
                <text x="320" y="52" fontSize="12" fill="rgba(245,192,60,.52)">✦</text>
                <text x="348" y="28" fontSize="9" fill="rgba(245,192,60,.38)">✦</text>
                <path d="M50 155 L50 120 L110 120 L110 90 L170 90 L170 62 L230 62 L230 38 L290 38 L290 18 L350 18 L350 155 Z" fill="rgba(255,255,255,0.07)"/>
                <ellipse cx="216" cy="172" rx="162" ry="88" fill="rgba(0,0,0,0.18)"/>
                <ellipse cx="183" cy="120" rx="15" ry="18" fill="rgba(12,5,20,0.88)"/>
                <circle cx="190" cy="115" r="5" fill="white"/>
                <ellipse cx="245" cy="116" rx="15" ry="18" fill="rgba(12,5,20,0.88)"/>
                <circle cx="252" cy="111" r="5" fill="white"/>
              </svg>
              <div className={s.fcLabel}>PROGRESS TRACKING</div>
            </div>
          </div>

          {/* Card 6: Writing Knowledge — teal */}
          <div className={s.fc} style={{background:'linear-gradient(180deg,#3a9e8e 0%,#1e6e60 100%)'}}>
            <div className={s.fcTop}>
              <div className={s.fcIconSm}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={s.fcCat}>Writing Mastery</div>
              <div className={s.fcTitle}>Nền tảng kiến thức Writing từ A đến Z</div>
              <div className={s.fcDesc}>Từ cách lập luận Task 2 đến phân tích biểu đồ Task 1 — kho kiến thức Writing được biên soạn riêng cho học viên IELTS Việt.</div>
            </div>
            <div className={s.fcIllus}>
              <svg viewBox="0 0 400 155" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <text x="55" y="42" fontSize="20" fill="rgba(245,192,60,.72)">✦</text>
                <text x="316" y="50" fontSize="14" fill="rgba(245,192,60,.56)">✦</text>
                <text x="348" y="26" fontSize="10" fill="rgba(245,192,60,.42)">✦</text>
                <circle cx="90" cy="30" r="5" fill="rgba(255,255,255,0.3)"/>
                <circle cx="290" cy="22" r="4" fill="rgba(255,255,255,0.25)"/>
                <circle cx="362" cy="72" r="5" fill="rgba(255,255,255,0.22)"/>
                <circle cx="24" cy="80" r="4" fill="rgba(255,255,255,0.22)"/>
                <circle cx="340" cy="100" r="6" fill="rgba(255,255,255,0.18)"/>
                <circle cx="60" cy="100" r="5" fill="rgba(255,255,255,0.18)"/>
                <ellipse cx="200" cy="172" rx="160" ry="86" fill="rgba(0,0,0,0.16)"/>
                <ellipse cx="168" cy="120" rx="17" ry="20" fill="rgba(4,18,18,0.88)"/>
                <circle cx="176" cy="114" r="6" fill="white"/>
                <ellipse cx="232" cy="120" rx="17" ry="20" fill="rgba(4,18,18,0.88)"/>
                <circle cx="240" cy="114" r="6" fill="white"/>
              </svg>
              <div className={s.fcLabel}>WRITING MASTERY · SẮP RA MẮT</div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <div id="about" className={s.aboutWrap}>
        <div>
          <div className={s.aboutTag}>✦ Sứ mệnh của Climb</div>
          <h2 className={s.h2}>IELTS Writing không nên<br/>chỉ dành cho người có tiền học thầy</h2>
          <p style={{marginTop:'14px'}}>Climb ra đời với một mục tiêu: giúp bất kỳ học viên Việt nào cũng có thể luyện Writing nghiêm túc — không phụ thuộc vào gia sư, không phụ thuộc vào trung tâm.</p>
          <p>Không chỉ chấm bài — Climb là cả một hệ thống: bài mẫu cải thiện đúng band mục tiêu, kho 1.350+ từ vựng · writing phrases · common mistakes, và kiến thức Writing từ A đến Z. Mọi thứ bạn cần để tự học nghiêm túc, trong tầm tay.</p>
          <div className={s.aboutStats}>
            <div><div className={s.statN}>10k+</div><div className={s.statL}>Bài đã chấm</div></div>
            <div><div className={s.statN}>4.8★</div><div className={s.statL}>Đánh giá</div></div>
            <div><div className={s.statN}>18</div><div className={s.statL}>IELTS Topics</div></div>
          </div>
          <Link href="/register" className={s.aboutCta}>Bắt đầu ngay — miễn phí →</Link>
        </div>
        <div className={s.aboutMascot}>
          <div className={s.sp} style={{position:'absolute',top:'-5px',left:'8%',animationDelay:'.4s',color:'var(--accent)'}}>✦</div>
          <div className={s.sp} style={{position:'absolute',bottom:'0',right:'6%',animationDelay:'1.3s',fontSize:'14px',color:'var(--accent)'}}>✦</div>

          <div className={s.moonWrap}>
            {/* Score-meter moon mascot */}
            <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="130" cy="130" r="118" fill="rgba(80,165,225,.35)"/>
              <circle cx="130" cy="130" r="105" fill="#f5cc68"/>
              <circle cx="88" cy="108" r="13" fill="rgba(180,145,60,.17)"/>
              <circle cx="163" cy="88" r="9" fill="rgba(180,145,60,.13)"/>
              <circle cx="158" cy="158" r="16" fill="rgba(180,145,60,.15)"/>
              <path d="M52 168 A 90 90 0 1 1 208 168" stroke="rgba(180,145,60,.22)" strokeWidth="10" fill="none" strokeLinecap="round"/>
              <path d="M52 168 A 90 90 0 0 1 197 95" stroke="#16a344" strokeWidth="10" fill="none" strokeLinecap="round"/>
              <text x="130" y="106" textAnchor="middle" fontSize="22" fontWeight="900" fill="#16a344" fontFamily="Nunito,sans-serif">7.5</text>
              <circle cx="107" cy="132" r="13" fill="#4a3210"/>
              <circle cx="153" cy="132" r="13" fill="#4a3210"/>
              <circle cx="111" cy="128" r="4.5" fill="white"/>
              <circle cx="157" cy="128" r="4.5" fill="white"/>
              <ellipse cx="90" cy="150" rx="11" ry="5.5" fill="rgba(210,140,90,.22)"/>
              <ellipse cx="170" cy="150" rx="11" ry="5.5" fill="rgba(210,140,90,.22)"/>
              <path d="M100 162 Q130 182 160 162" stroke="#4a3210" strokeWidth="5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ═══ PRICING ═══ */}
      <section className={s.pricing} id="pricing">
        <div className={s.sectionTag}>✦ Học phí</div>
        <h2 className={s.h2}>Đầu tư vào band score<br/>không phải vào thầy cô</h2>
        <p className={s.sectionSub}>Học phí thầy 1-1: 300–500k/giờ. Climb Starter: 99.000đ/tháng · Pro không giới hạn: 229.000đ/tháng.</p>

        <div className={s.pg}>
          {/* Free */}
          <div className={s.pc}>
            <div className={s.pcName}>Free</div>
            <div className={s.pcPrice}>0<span className={s.unit}>đ</span></div>
            <div className={s.pcPer}>mãi mãi · 3 bài / tháng</div>
            <ul className={s.pcFeats}>
              <li>Chấm Writing Task 1 &amp; 2</li>
              <li>Band score 4 tiêu chí</li>
              <li>Giải thích lỗi cơ bản</li>
              <li className={s.off}>Bài mẫu cải thiện</li>
              <li className={s.off}>Kho từ vựng 18 chủ đề</li>
              <li className={s.off}>Biểu đồ tiến độ</li>
            </ul>
            <Link href="/register" className={s.pcBtn} style={{display:'block',textAlign:'center',textDecoration:'none'}}>Bắt đầu miễn phí</Link>
          </div>

          {/* Starter */}
          <div className={s.pc}>
            <div className={s.pcName}>Starter</div>
            <div className={s.pcPrice}>99.000<span className={s.unit}>đ</span></div>
            <div className={s.pcPer}>/tháng · 10 bài / tháng</div>
            <ul className={s.pcFeats}>
              <li>Chấm Writing Task 1 &amp; 2</li>
              <li>Bài mẫu cải thiện</li>
              <li>Kho từ vựng 18 chủ đề</li>
              <li>Lưu từ &amp; flashcard</li>
              <li>Biểu đồ tiến độ</li>
              <li className={s.off}>Kiến thức viết Writing</li>
            </ul>
            <Link href="/register" className={s.pcBtn} style={{display:'block',textAlign:'center',textDecoration:'none'}}>Đăng ký Starter</Link>
          </div>

          {/* Pro */}
          <div className={`${s.pc} ${s.best}`}>
            <div className={s.pcBadge}>🔥 PHỔ BIẾN NHẤT</div>
            <div className={s.pcName}>Pro</div>
            <div className={s.pcPrice}>229.000<span className={s.unit}>đ</span></div>
            <div className={s.pcPer}>/tháng · không giới hạn bài</div>
            <ul className={s.pcFeats}>
              <li>Tất cả tính năng Starter</li>
              <li>Kiến thức viết đầy đủ</li>
              <li>Export PDF kết quả</li>
              <li>Ưu tiên xử lý</li>
            </ul>
            <Link href="/register" className={s.pcBtn} style={{display:'block',textAlign:'center',textDecoration:'none'}}>Nâng lên Pro</Link>
          </div>

          {/* Pro Yearly */}
          <div className={s.pc}>
            <div className={s.pcBadgeAmber}>✦ TIẾT KIỆM NHẤT</div>
            <div className={s.pcName}>Pro Yearly</div>
            <div className={s.pcPrice}>1.790.000<span className={s.unit}>đ</span></div>
            <div className={s.pcPer}>/năm · ~149.000đ/tháng</div>
            <div style={{fontSize:12,fontWeight:700,color:'#d97706',marginBottom:20,marginTop:-16}}>Giảm 35% · ~4 tháng miễn phí</div>
            <ul className={s.pcFeats}>
              <li>Tất cả tính năng Pro</li>
              <li>Ưu tiên hỗ trợ</li>
              <li>Tiết kiệm ~958.000đ/năm</li>
            </ul>
            <Link href="/register" className={s.pcBtn} style={{display:'block',textAlign:'center',textDecoration:'none'}}>Đăng ký Yearly</Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <div className={s.footerLogo}>Climb <em>IELTS</em></div>
            <p>Nền tảng luyện IELTS Writing với AI — được xây riêng cho học viên Việt Nam. Hiểu đúng lỗi người Việt, viết lại bài đạt Band mục tiêu.</p>
          </div>
          <div className={s.footerLinks}>
            <div className={s.footerCol}>
              <h4>Tính năng</h4>
              <Link href="/writing">Chấm bài Writing</Link>
              <Link href="/writing">Upgraded Essay</Link>
              <Link href="/vocabulary">Kho từ vựng</Link>
              <Link href="/progress">Progress Tracking</Link>
            </div>
            <div className={s.footerCol}>
              <h4>Hỗ trợ</h4>
              <Link href="/terms">Điều khoản</Link>
              <Link href="/privacy">Chính sách BM</Link>
              <a href="mailto:support@climbielts.com">Liên hệ</a>
              <Link href="/register">FAQ</Link>
            </div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2025 Climb IELTS. All rights reserved.</span>
          <span>www.climbielts.com</span>
        </div>
      </footer>

    </div>
  )
}
