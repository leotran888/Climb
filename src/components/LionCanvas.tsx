'use client'
import { useEffect, useRef } from 'react'

export default function LionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let tPos: { x: number; y: number } | null = null
    let groundY = 0, halfW = 0

    function setup() {
      const hero = canvas.parentElement
      if (!hero) return
      const hr = hero.getBoundingClientRect()
      canvas.width = hr.width
      canvas.height = hr.height
      groundY = hr.height - 50
      halfW = hr.width * 0.52
      const sw = document.getElementById('scoreWord')
      if (!sw) return
      const r = sw.getBoundingClientRect()
      tPos = { x: r.left - hr.left + r.width / 2, y: r.top - hr.top + Math.round(r.height * 0.28) }
    }

    function rrect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
    }

    const sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; decay: number; sz: number; col: string; star: boolean }> = []
    const COLS = ['#FFD700', '#FF5252', '#40C4FF', '#69F0AE', '#EA80FC', '#16a344', '#FF9100']

    function burst(x: number, y: number, n: number) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * 4 + 1.5
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.5, life: 1, decay: 0.013 + Math.random() * 0.015, sz: Math.random() * 4 + 2, col: COLS[Math.floor(Math.random() * COLS.length)], star: Math.random() > 0.5 })
      }
    }

    function tickSparks() {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life -= s.decay
        if (s.life <= 0) sparks.splice(i, 1)
      }
    }

    function drawSparks() {
      sparks.forEach(s => {
        ctx.save(); ctx.globalAlpha = s.life; ctx.fillStyle = s.col; ctx.translate(s.x, s.y)
        ctx.beginPath()
        if (s.star) {
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4, r = i % 2 ? s.sz * 0.38 : s.sz
            i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
          }
          ctx.closePath()
        } else { ctx.arc(0, 0, s.sz, 0, Math.PI * 2) }
        ctx.fill(); ctx.restore()
      })
    }

    function drawTrophy(x: number, y: number, sc: number) {
      if (sc <= 0) return
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
      const gG = ctx.createLinearGradient(-20, -44, 16, 10)
      gG.addColorStop(0, '#FFE566'); gG.addColorStop(.28, '#F7AE28'); gG.addColorStop(.7, '#CF8800'); gG.addColorStop(1, '#9A6400')
      const gBs = ctx.createLinearGradient(0, 13, 0, 24)
      gBs.addColorStop(0, '#22c55e'); gBs.addColorStop(1, '#15803d')
      ctx.fillStyle = '#4ade80'; ctx.fillRect(-17, 10, 34, 3)
      ctx.fillStyle = gBs; ctx.fillRect(-17, 13, 34, 11)
      ctx.fillStyle = 'rgba(255,255,255,.2)'
      rrect(-9, 15.5, 18, 6, 1.5); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .8; ctx.stroke()
      ctx.fillStyle = gG; ctx.fillRect(-13, 7, 26, 4)
      ctx.fillStyle = 'rgba(255,228,80,.5)'; ctx.fillRect(-13, 7, 26, 1.5)
      ctx.fillStyle = gG
      ctx.beginPath(); ctx.moveTo(-5.5, 0); ctx.lineTo(5.5, 0); ctx.lineTo(7, 7); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill()
      ctx.save()
      ctx.strokeStyle = '#B87200'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(-17, -37); ctx.bezierCurveTo(-30, -42, -38, -28, -34, -20); ctx.bezierCurveTo(-30, -12, -17, -11, -17, -19); ctx.stroke()
      ctx.strokeStyle = '#FFD060'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(-17, -37); ctx.bezierCurveTo(-27, -40, -34, -28, -30, -22); ctx.stroke()
      ctx.strokeStyle = '#B87200'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(17, -37); ctx.bezierCurveTo(30, -42, 38, -28, 34, -20); ctx.bezierCurveTo(30, -12, 17, -11, 17, -19); ctx.stroke()
      ctx.strokeStyle = '#FFD060'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(17, -37); ctx.bezierCurveTo(27, -40, 34, -28, 30, -22); ctx.stroke()
      ctx.restore()
      ctx.beginPath(); ctx.moveTo(-21, -44); ctx.bezierCurveTo(-23, -34, -21, -22, -17, -14); ctx.bezierCurveTo(-13, -6, -8, -1, -6, 0); ctx.lineTo(6, 0); ctx.bezierCurveTo(8, -1, 13, -6, 17, -14); ctx.bezierCurveTo(21, -22, 23, -34, 21, -44); ctx.closePath()
      ctx.fillStyle = gG; ctx.fill()
      const gSh = ctx.createLinearGradient(-21, 0, 21, 0)
      gSh.addColorStop(0, 'rgba(255,220,80,.18)'); gSh.addColorStop(.5, 'rgba(0,0,0,0)'); gSh.addColorStop(1, 'rgba(0,0,0,.22)')
      ctx.fillStyle = gSh
      ctx.beginPath(); ctx.moveTo(-21, -44); ctx.bezierCurveTo(-23, -34, -21, -22, -17, -14); ctx.bezierCurveTo(-13, -6, -8, -1, -6, 0); ctx.lineTo(6, 0); ctx.bezierCurveTo(8, -1, 13, -6, 17, -14); ctx.bezierCurveTo(21, -22, 23, -34, 21, -44); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#FFE880'
      ctx.beginPath(); ctx.ellipse(0, -44, 21.5, 4, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(0,0,0,.12)'
      ctx.beginPath(); ctx.ellipse(0, -44, 21.5, 4, 0, 0, Math.PI); ctx.fill()
      ctx.fillStyle = 'rgba(255,248,200,.44)'
      ctx.beginPath(); ctx.ellipse(-9, -27, 3.5, 12, -.48, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    function drawTrophyFlat(x: number, y: number, sc: number) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2); drawTrophy(0, 0, sc); ctx.restore()
    }

    function drawLadderAngled(baseX: number, baseY: number, len: number, angle: number) {
      const topX = baseX - Math.cos(angle) * len, topY = baseY - Math.sin(angle) * len
      const hw = 10, px = Math.sin(angle) * hw, py = -Math.cos(angle) * hw
      const shadowLen = Math.cos(angle) * len
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.08)'
      ctx.beginPath(); ctx.ellipse(baseX - shadowLen / 2, baseY + 3, shadowLen / 2 + 8, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      ctx.save(); ctx.lineCap = 'round'
      ctx.strokeStyle = '#7A5612'; ctx.lineWidth = 4.5
      ctx.beginPath(); ctx.moveTo(baseX - px, baseY - py); ctx.lineTo(topX - px, topY - py); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(baseX + px, baseY + py); ctx.lineTo(topX + px, topY + py); ctx.stroke()
      ctx.strokeStyle = '#9A7020'; ctx.lineWidth = 3.5
      for (let i = 1; i <= 7; i++) {
        const t = i / 8, rx = baseX + (topX - baseX) * t, ry = baseY + (topY - baseY) * t
        ctx.beginPath(); ctx.moveTo(rx - px, ry - py); ctx.lineTo(rx + px, ry + py); ctx.stroke()
      }
      ctx.restore()
    }

    function drawLion(x: number, y: number, wc: number, expr: string, faceLeft: boolean, hasLadder: boolean, climbing: boolean) {
      ctx.save(); ctx.translate(x, y)
      if (faceLeft) ctx.scale(-1, 1)
      const leg = expr === 'celebrate' ? 10 : Math.sin(wc) * (climbing ? 26 : 18)
      const arm = -leg * .6
      const bob = expr === 'celebrate' ? 0 : Math.abs(Math.sin(wc)) * 1.5
      const G = '#E8950E', D = '#B87208', DK = '#8A5206', MN = '#4A2004'
      if (!climbing) {
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.11)'
        ctx.beginPath(); ctx.ellipse(0, 4, 20, 5.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      }
      ctx.translate(0, -bob)
      // back leg
      ctx.save(); ctx.translate(10, -6); ctx.rotate(-leg * Math.PI / 180)
      ctx.fillStyle = G; rrect(-5, 0, 10, 22, 4); ctx.fill()
      ctx.translate(0, 21); ctx.rotate(leg * .45 * Math.PI / 180); rrect(-4, 0, 8, 16, 3); ctx.fill()
      ctx.fillStyle = D
      ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(7, 16); ctx.arcTo(8, 22, 0, 22, 4); ctx.lineTo(-6, 22); ctx.closePath(); ctx.fill()
      ctx.restore()
      // tail
      ctx.save()
      const tw = Math.sin(wc * .7 + .8) * 8
      ctx.strokeStyle = D; ctx.lineWidth = 5.5; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(13, -26); ctx.quadraticCurveTo(26, -12 + tw, 30, tw * .35); ctx.stroke()
      ctx.fillStyle = DK
      ctx.beginPath(); ctx.moveTo(30, tw * .35 - 7); ctx.lineTo(37, tw * .35); ctx.lineTo(30, tw * .35 + 7); ctx.lineTo(23, tw * .35); ctx.closePath(); ctx.fill()
      ctx.restore()
      // body
      ctx.fillStyle = G; rrect(-14, -64, 28, 57, 7); ctx.fill()
      ctx.fillStyle = 'rgba(245,176,48,.22)'; ctx.beginPath(); ctx.ellipse(0, -38, 7, 11, 0, 0, Math.PI * 2); ctx.fill()
      // back arm (non-celebrate)
      if (expr !== 'celebrate') {
        ctx.save(); ctx.translate(12, -50); ctx.rotate(arm * Math.PI / 180)
        ctx.fillStyle = G; rrect(-4, 0, 9, 24, 4); ctx.fill()
        ctx.translate(0, 24); ctx.fillStyle = D
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill()
        if (hasLadder) {
          ctx.save(); ctx.rotate(.3)
          ctx.strokeStyle = '#7A5612'; ctx.lineWidth = 2; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-5, -28); ctx.moveTo(5, 0); ctx.lineTo(5, -28); ctx.stroke()
          ctx.strokeStyle = '#9A7020'
          for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-5, -i * 8); ctx.lineTo(5, -i * 8); ctx.stroke() }
          ctx.restore()
        }
        ctx.restore()
      }
      // front leg
      ctx.save(); ctx.translate(-10, -6); ctx.rotate(leg * Math.PI / 180)
      ctx.fillStyle = G; rrect(-5, 0, 10, 22, 4); ctx.fill()
      ctx.translate(0, 21); ctx.rotate(-leg * .45 * Math.PI / 180); rrect(-4, 0, 8, 16, 3); ctx.fill()
      ctx.fillStyle = D
      ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(7, 16); ctx.arcTo(8, 22, 0, 22, 4); ctx.lineTo(-6, 22); ctx.closePath(); ctx.fill()
      ctx.restore()
      // front arm (non-celebrate)
      if (expr !== 'celebrate') {
        ctx.save(); ctx.translate(-12, -50); ctx.rotate(arm * Math.PI / 180)
        ctx.fillStyle = G; rrect(-4, 0, 9, 24, 4); ctx.fill()
        ctx.translate(0, 24); ctx.fillStyle = D
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill()
        ctx.restore()
      }
      // mane
      ctx.fillStyle = '#4A2004'
      for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2 - Math.PI / 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 22, Math.sin(a) * 20 - 68, 10, 0, Math.PI * 2); ctx.fill() }
      ctx.fillStyle = '#6B3208'
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 13, Math.sin(a) * 12 - 68, 9.5, 0, Math.PI * 2); ctx.fill() }
      // head
      ctx.fillStyle = G
      ctx.beginPath(); ctx.arc(0, -68, 15, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(0, -59, 9, 6, 0, 0, Math.PI * 2); ctx.fill()
      // ears
      ctx.fillStyle = MN
      ctx.beginPath(); ctx.moveTo(-14, -80); ctx.lineTo(-19, -92); ctx.lineTo(-8, -84); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(14, -80); ctx.lineTo(19, -92); ctx.lineTo(8, -84); ctx.closePath(); ctx.fill()
      ctx.fillStyle = G
      ctx.beginPath(); ctx.moveTo(-13, -81); ctx.lineTo(-17, -90); ctx.lineTo(-9, -84); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(13, -81); ctx.lineTo(17, -90); ctx.lineTo(9, -84); ctx.closePath(); ctx.fill()
      // snout
      ctx.fillStyle = DK; ctx.beginPath(); ctx.ellipse(0, -58, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#3A1800'
      ctx.beginPath(); ctx.arc(-1.5, -58, 1.2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(1.5, -58, 1.2, 0, Math.PI * 2); ctx.fill()
      // eyes
      const now = Date.now()
      if (expr === 'search') {
        const shift = Math.sin(now * .0011) * 2.5
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.ellipse(-7, -70, 5.2, 3.8, -.12, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(7, -70, 5.2, 3.8, .12, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = G
        ctx.beginPath(); ctx.ellipse(-7, -72, 5.5, 2.5, -.12, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(7, -72, 5.5, 2.5, .12, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#1a1a1a'
        ctx.beginPath(); ctx.arc(-7 + shift, -70, 2.4, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(7 + shift, -70, 2.4, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = MN; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(-11, -75); ctx.lineTo(-3, -73); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(11, -75); ctx.lineTo(3, -73); ctx.stroke()
        ctx.strokeStyle = DK; ctx.lineWidth = 1.8
        ctx.beginPath(); ctx.moveTo(-3.5, -51); ctx.lineTo(3.5, -51); ctx.stroke()
      } else if (expr === 'excited') {
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.ellipse(-7, -70, 5.5, 5.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(7, -70, 5.5, 5.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#1a1a1a'
        ctx.beginPath(); ctx.arc(-7, -70, 3.5, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(7, -70, 3.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(-8.5, -71.5, 1.2, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(5.5, -71.5, 1.2, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = MN; ctx.lineWidth = 3; ctx.lineCap = 'square'
        ctx.beginPath(); ctx.moveTo(-11, -78); ctx.lineTo(-3, -80); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(11, -78); ctx.lineTo(3, -80); ctx.stroke()
        ctx.fillStyle = '#5A1A00'
        ctx.beginPath(); ctx.moveTo(-5, -49); ctx.lineTo(5, -49); ctx.lineTo(4, -56); ctx.lineTo(-4, -56); ctx.closePath(); ctx.fill()
      } else {
        ctx.strokeStyle = '#111'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(-7, -71, 5.8, Math.PI * 1.07, Math.PI * 1.93); ctx.stroke()
        ctx.beginPath(); ctx.arc(7, -71, 5.8, Math.PI * 1.07, Math.PI * 1.93); ctx.stroke()
        ctx.strokeStyle = MN; ctx.lineWidth = 2.6; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(-10, -79); ctx.quadraticCurveTo(-6, -82, -2, -80); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(10, -79); ctx.quadraticCurveTo(6, -82, 2, -80); ctx.stroke()
        ctx.fillStyle = '#3A0E00'; ctx.beginPath(); ctx.arc(0, -51, 9, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#7A3010'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(0, -51, 10, Math.PI + .6, Math.PI * 2 - .6); ctx.stroke()
        ctx.beginPath(); ctx.arc(0, -51, 10, .6, Math.PI - .6); ctx.stroke()
        ctx.save(); ctx.beginPath(); ctx.arc(0, -51, 9, 0, Math.PI * 2); ctx.clip()
        ctx.fillStyle = '#fff'; ctx.fillRect(-9, -56, 18, 6)
        ctx.fillStyle = '#CC2828'; ctx.beginPath(); ctx.arc(0, -44, 6, 0, Math.PI, true); ctx.fill()
        ctx.restore()
      }
      // celebrate arms
      if (expr === 'celebrate') {
        ctx.save(); ctx.translate(12, -50); ctx.rotate(-130 * Math.PI / 180)
        ctx.fillStyle = G; rrect(-4, 0, 9, 24, 4); ctx.fill()
        ctx.translate(0, 24); ctx.fillStyle = D
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill()
        ctx.restore()
        ctx.save(); ctx.translate(-12, -50); ctx.rotate(130 * Math.PI / 180)
        ctx.fillStyle = G; rrect(-4, 0, 9, 24, 4); ctx.fill()
        ctx.translate(0, 24); ctx.fillStyle = D
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill()
        ctx.save(); ctx.rotate(-130 * Math.PI / 180); ctx.translate(0, -8); ctx.scale(.45, .45); drawTrophy(0, 0, 1); ctx.restore()
        ctx.restore()
      }
      ctx.restore()
    }

    const PH = [
      { n: 'trophy', d: 700 }, { n: 'search', d: 2600 }, { n: 'spot', d: 1200 },
      { n: 'run_out', d: 1400 }, { n: 'return', d: 2000 }, { n: 'place', d: 1400 },
      { n: 'climb', d: 3000 }, { n: 'celebrate', d: 5000 },
    ]
    const TOTAL_DUR = PH.reduce((s, p) => s + p.d, 0)

    function getPhase(el: number) {
      let acc = 0
      for (let i = 0; i < PH.length; i++) {
        if (el < acc + PH[i].d) return { name: PH[i].n, t: el - acc, f: Math.min((el - acc) / PH[i].d, 1) }
        acc += PH[i].d
      }
      return { name: 'celebrate', t: el, f: 1 }
    }

    const L = { x: -90, y: 0, wc: 0, fl: false, hasLadder: false }
    let startT: number | null = null, lastBurst = 0, impacted = false

    function getLadderGeom(gY: number) {
      const h = gY - (tPos?.y ?? 0) - 14, leanAngle = 1.18
      const len = h / Math.sin(leanAngle)
      return { baseX: (tPos?.x ?? 0) + Math.cos(leanAngle) * len, gY, len, finalAngle: leanAngle }
    }

    function easeElastic(t: number) {
      if (t <= 0) return 0; if (t >= 1) return 1
      return t < .7 ? (t / .7) * 1.08 : 1.08 - Math.sin((t - .7) / .3 * Math.PI * 1.5) * .08
    }

    let animId: number

    function frame(ts: number) {
      if (!startT) startT = ts
      if (!tPos) { animId = requestAnimationFrame(frame); return }
      let el = ts - startT
      if (el >= TOTAL_DUR) {
        startT = ts; el = 0; lastBurst = 0; impacted = false
        L.x = -90; L.y = 0; L.wc = 0; L.fl = false; L.hasLadder = false
      }
      const ph = getPhase(el), gY = groundY, lad = getLadderGeom(gY)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      tickSparks()
      switch (ph.name) {
        case 'trophy': { const sf = (ph.f < .65 ? (ph.f / .65) * 1.22 : 1.22 - (ph.f - .65) / .35 * .22) * .62; drawTrophyFlat(tPos.x, tPos.y, sf); break }
        case 'search': { drawTrophyFlat(tPos.x, tPos.y, .62); L.x = -90 + ph.f * (halfW * .5 + 90); L.fl = false; L.hasLadder = false; L.wc += .085; drawLion(L.x, gY, L.wc, 'search', false, false, false); break }
        case 'spot': { drawTrophyFlat(tPos.x, tPos.y, .62); const jh = ph.f < .35 ? Math.sin(ph.f / .35 * Math.PI) * 28 : 0; if (ph.t > 15 && ph.t < 70) burst(L.x, gY - 75, 14); L.wc += .01; drawLion(L.x, gY - jh, L.wc, 'excited', false, false, false); break }
        case 'run_out': { drawTrophyFlat(tPos.x, tPos.y, .62); L.fl = false; L.wc += .21; L.x += 7; if (L.x < canvas.width + 30) drawLion(L.x, gY, L.wc, 'excited', false, false, false); break }
        case 'return': { drawTrophyFlat(tPos.x, tPos.y, .62); if (ph.t < 35) { L.x = canvas.width + 80; L.hasLadder = true } L.wc += .14; L.x -= 5; const stopX = lad.baseX + 22; if (L.x < stopX) L.x = stopX; drawLion(L.x, gY, L.wc, 'excited', true, L.hasLadder, false); break }
        case 'place': { drawTrophyFlat(tPos.x, tPos.y, .62); L.hasLadder = false; L.fl = true; L.wc = 0; drawLadderAngled(lad.baseX, lad.gY, lad.len, easeElastic(ph.f) * lad.finalAngle); if (!impacted && ph.f > .88) { impacted = true; burst(lad.baseX - Math.cos(lad.finalAngle) * lad.len, lad.gY - Math.sin(lad.finalAngle) * lad.len, 10) } drawLion(L.x, gY, L.wc, 'excited', true, false, false); break }
        case 'climb': { drawLadderAngled(lad.baseX, lad.gY, lad.len, lad.finalAngle); if (ph.f < .88) drawTrophyFlat(tPos.x, tPos.y, .62); L.wc += .12; L.hasLadder = false; L.x = lad.baseX - Math.cos(lad.finalAngle) * lad.len * ph.f - 3; L.y = gY - Math.sin(lad.finalAngle) * lad.len * ph.f; drawLion(L.x, L.y, L.wc, 'excited', false, false, true); break }
        case 'celebrate': { drawLadderAngled(lad.baseX, lad.gY, lad.len, lad.finalAngle); const sw = Math.sin(ph.t / 500) * 3.5; L.wc += .045; if (ph.t - lastBurst > 700) { burst(L.x + sw, L.y - 72, 10); lastBurst = ph.t } drawLion(L.x + sw, L.y, L.wc, 'celebrate', false, false, true); break }
      }
      drawSparks()
      animId = requestAnimationFrame(frame)
    }

    setup()
    document.fonts.ready.then(setup)
    window.addEventListener('resize', setup)
    animId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', setup)
    }
  }, [])

  return <canvas ref={ref} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 6 }} />
}
