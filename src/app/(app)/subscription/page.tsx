import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserEntitlements } from '@/lib/entitlement'
import Link from 'next/link'
import React from 'react'

const G     = '#16a344'
const GSFT  = 'rgba(22,163,68,.09)'
const GBRD  = 'rgba(22,163,68,.13)'
const AMBER = '#d97706'
const AMBRD = 'rgba(217,119,6,.3)'
const AMSFT = 'rgba(217,119,6,.08)'
const TEXT  = '#192e1e'
const MUTED = '#3d5a47'
const HINT  = '#7a9e87'
const DIV   = 'rgba(22,163,68,.1)'
const FONT  = "'Nunito',system-ui,sans-serif"

const CARD: React.CSSProperties = {
  background: '#fff',
  border: `1.5px solid ${GBRD}`,
  borderRadius: 16,
  padding: 20,
}

// Features shown in the current-plan card (full detail)
const CURRENT_FEATURES: Record<string, string[]> = {
  free: [
    'Chấm Writing Task 1 & 2 · Bài mẫu cải thiện',
    'Vocabulary 3 chủ đề',
    'Lịch sử 30 ngày',
  ],
  starter: [
    'Writing AI 10 lượt / tháng · Bài mẫu cải thiện',
    'Vocabulary 18 chủ đề · Lưu từ & flashcard',
    'Biểu đồ tiến độ · Lịch sử đầy đủ',
    'Kiến thức viết Writing (cơ bản)',
  ],
  pro: [
    'Writing AI không giới hạn · Bài mẫu cải thiện',
    'Vocabulary 18 chủ đề · Lưu từ & flashcard',
    'Kiến thức viết Writing đầy đủ',
    'Export PDF kết quả · Ưu tiên xử lý',
  ],
  pro_yearly: [
    'Writing AI không giới hạn · Bài mẫu cải thiện',
    'Vocabulary 18 chủ đề · Lưu từ & flashcard',
    'Kiến thức viết Writing đầy đủ',
    'Export PDF kết quả · Ưu tiên xử lý',
    'Ưu tiên hỗ trợ',
  ],
}

// Plan comparison cards
const PLANS: {
  slug: string
  tier: string
  price: string
  priceSub: string
  priceNote?: string
  quota: string
  features: string[]
  locked?: string[]
  badge?: { label: string; amber?: boolean }
}[] = [
  {
    slug: 'free',
    tier: 'Miễn phí',
    price: '0đ',
    priceSub: 'Mãi mãi miễn phí',
    quota: '3 bài / tháng',
    features: ['Chấm Writing Task 1 & 2', 'Bài mẫu cải thiện', 'Vocabulary 3 chủ đề'],
    locked: ['Biểu đồ tiến độ', 'Kiến thức viết Writing', 'Export PDF'],
  },
  {
    slug: 'starter',
    tier: 'Starter',
    price: '99.000đ',
    priceSub: '/tháng',
    quota: '10 bài / tháng',
    features: [
      'Chấm Writing Task 1 & 2',
      'Bài mẫu cải thiện',
      'Vocabulary 18 chủ đề đầy đủ',
      'Lưu từ & flashcard',
      'Biểu đồ tiến độ',
      'Kiến thức viết (cơ bản)',
    ],
    locked: ['Export PDF'],
  },
  {
    slug: 'pro',
    tier: 'Pro',
    price: '229.000đ',
    priceSub: '/tháng',
    quota: 'Không giới hạn bài',
    features: [
      'Tất cả tính năng Starter',
      'Kiến thức viết đầy đủ',
      'Export PDF kết quả',
      'Ưu tiên xử lý',
    ],
    badge: { label: '🔥 Phổ biến nhất' },
  },
  {
    slug: 'pro_yearly',
    tier: 'Pro Yearly',
    price: '1.790.000đ',
    priceSub: '/năm · ~149.000đ/tháng',
    priceNote: 'Giảm 35% · ~4 tháng miễn phí',
    quota: 'Không giới hạn bài',
    features: [
      'Tất cả tính năng Pro',
      'Ưu tiên hỗ trợ',
      'Tiết kiệm ~958.000đ/năm',
    ],
    badge: { label: '✦ Tiết kiệm nhất', amber: true },
  },
]

const PLAN_ORDER = ['free', 'starter', 'pro', 'pro_yearly']

function CheckDot() {
  return (
    <div style={{ width: 16, height: 16, borderRadius: '50%', background: GSFT, border: `1.5px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <polyline points="1,4 3,6 7,2" stroke={G} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [subData, entitlements] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .single()
      .then(r => r.data),
    getUserEntitlements(user.id),
  ])

  type PlanRow = { name: string; description: string | null; slug: string; limits: Record<string, number> }
  const plan       = (subData as { plans?: PlanRow } | null)?.plans
  const currentSlug = plan?.slug ?? 'free'
  const planName   = plan?.name ?? 'Free'
  const expiresAt  = (subData as { expires_at?: string | null } | null)?.expires_at

  const expiryShort = expiresAt
    ? new Date(expiresAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
    : null
  const expiryYear = expiresAt ? new Date(expiresAt).getFullYear() : null
  const expiryFull = expiresAt
    ? new Date(expiresAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const isUnlimited = entitlements.writing.monthlyLimit >= 999
  const used        = entitlements.writing.currentUsage
  const limit       = entitlements.writing.monthlyLimit
  const usagePct    = (!isUnlimited && limit > 0) ? Math.min(100, (used / limit) * 100) : Math.min(30, (used / 60) * 100)

  const currentPlan = PLANS.find(p => p.slug === currentSlug)
  const currentIdx  = PLAN_ORDER.indexOf(currentSlug)

  return (
    <div style={{ paddingBottom: 48, fontFamily: FONT, color: TEXT }}>

      {/* ── Header ─────────────────────────────── */}
      <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: G, marginBottom: 6 }}>
        ✦ Quản lý tài khoản
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: TEXT, letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 4 }}>
        Gói của tôi
      </h1>
      <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, marginBottom: 24 }}>
        {planName}{expiryFull ? ` · Tự động gia hạn ${expiryFull}` : ''}
      </p>

      {/* ── Current plan card ──────────────────── */}
      <div style={{ background: '#fff', border: `1.5px solid ${G}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: TEXT }}>{planName}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: G, background: GSFT, border: `1.5px solid ${G}`, borderRadius: 50, padding: '3px 12px' }}>
            ✓ Đang hoạt động
          </span>
        </div>
        <p style={{ fontSize: 12, fontWeight: 600, color: HINT, marginBottom: 16 }}>
          {currentPlan ? `${currentPlan.price}${currentPlan.priceSub}` : ''}
          {expiryFull ? ` · Hết hạn ${expiryFull}` : ''}
        </p>

        {/* Usage bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Bài đã dùng tháng này</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>
            {isUnlimited ? `${used} bài` : `${used} / ${limit} bài`}
          </span>
        </div>
        <div style={{ height: 8, background: GSFT, borderRadius: 50, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: `${usagePct}%`, background: G, borderRadius: 50 }} />
        </div>
        <p style={{ fontSize: 11, fontWeight: 600, color: HINT, marginBottom: 16 }}>
          {isUnlimited
            ? 'Không giới hạn số lượng bài chấm'
            : `Còn ${Math.max(0, limit - used)} bài trong tháng này`}
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: `1px solid ${DIV}`, paddingTop: 14 }}>
          {(CURRENT_FEATURES[currentSlug] ?? CURRENT_FEATURES.free).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: MUTED }}>
              <CheckDot />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── 3 stat mini-cards ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: HINT, marginBottom: 8 }}>Tháng này</p>
          <p style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: G, marginBottom: 4 }}>{used}</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: HINT }}>bài đã chấm</p>
        </div>
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: HINT, marginBottom: 8 }}>Hết hạn</p>
          <p style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: TEXT, marginBottom: 4 }}>{expiryShort ?? '—'}</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: HINT }}>{expiryYear ? `năm ${expiryYear}` : 'Không thời hạn'}</p>
        </div>
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: HINT, marginBottom: 8 }}>Giới hạn</p>
          <p style={{ fontSize: isUnlimited ? 18 : 30, fontWeight: 900, lineHeight: 1, color: G, marginBottom: 4 }}>
            {isUnlimited ? '∞' : limit}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: HINT }}>{isUnlimited ? 'không giới hạn' : 'bài / tháng'}</p>
        </div>
      </div>

      {/* ── Plan comparison 2×2 ────────────────── */}
      <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, marginBottom: 12, marginTop: 8 }}>Các gói dịch vụ</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 4 }}>
        {PLANS.map(p => {
          const isCurrent = p.slug === currentSlug
          const isYearly  = p.slug === 'pro_yearly'
          const isHigher  = PLAN_ORDER.indexOf(p.slug) > currentIdx
          const border    = isCurrent ? G : isYearly ? AMBRD : GBRD

          return (
            <div key={p.slug} style={{ background: '#fff', border: `1.5px solid ${border}`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' }}>

              {/* Badge row */}
              {isCurrent ? (
                <div style={{ fontSize: 10, fontWeight: 800, borderRadius: 50, padding: '3px 10px', width: 'fit-content', marginBottom: 10, background: GSFT, color: G }}>✓ Gói hiện tại</div>
              ) : p.badge ? (
                <div style={{ fontSize: 10, fontWeight: 800, borderRadius: 50, padding: '3px 10px', width: 'fit-content', marginBottom: 10, background: p.badge.amber ? AMSFT : GSFT, color: p.badge.amber ? AMBER : G }}>
                  {p.badge.label}
                </div>
              ) : (
                <div style={{ marginBottom: 10, height: 22 }} />
              )}

              {/* Tier */}
              <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: isCurrent ? G : isYearly ? AMBER : HINT, marginBottom: 6 }}>
                {p.tier}
              </p>

              {/* Price */}
              <p style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: isYearly ? AMBER : TEXT, marginBottom: 2 }}>
                {p.price}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: isYearly ? AMBER : HINT, marginBottom: p.priceNote ? 2 : 0 }}>
                {p.priceSub}
              </p>
              {p.priceNote && (
                <p style={{ fontSize: 11, fontWeight: 700, color: isYearly ? AMBER : G, marginBottom: 0 }}>{p.priceNote}</p>
              )}

              {/* Quota */}
              <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginTop: 8, marginBottom: 14 }}>{p.quota}</p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: `1px solid ${DIV}`, paddingTop: 12, flex: 1, marginBottom: 16 }}>
                {p.features.map(f => (
                  <div key={f} style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: isYearly ? AMBER : G, fontSize: 11, fontWeight: 900, marginTop: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
                {(p.locked ?? []).map(f => (
                  <div key={f} style={{ fontSize: 12, fontWeight: 600, color: HINT, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: HINT, fontSize: 12, marginTop: 1, flexShrink: 0 }}>–</span>
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isCurrent ? (
                <button style={{ width: '100%', padding: 10, borderRadius: 50, border: `1.5px solid ${G}`, background: 'transparent', color: G, fontFamily: FONT, fontSize: 12, fontWeight: 800, cursor: 'default' }}>
                  Gói hiện tại
                </button>
              ) : (
                <Link
                  href={`mailto:tranmanhdungc1dtd@gmail.com?subject=${isHigher ? 'Nâng cấp' : 'Hạ cấp'} Climb IELTS - ${p.tier}`}
                  style={{ display: 'block', textAlign: 'center', padding: 10, borderRadius: 50, textDecoration: 'none', fontFamily: FONT, fontSize: 12, fontWeight: 800, background: isHigher ? (isYearly ? AMBER : G) : GSFT, color: isHigher ? '#fff' : G }}
                >
                  {isHigher
                    ? (isYearly ? 'Chuyển sang Yearly →' : 'Nâng cấp →')
                    : 'Hạ cấp'}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer note ────────────────────────── */}
      <p style={{ fontSize: 12, textAlign: 'center', color: HINT, marginTop: 16, marginBottom: 20 }}>
        Để nâng cấp gói, liên hệ qua email hoặc Zalo — chúng tôi xử lý trong vòng 1 giờ.
      </p>

      {/* ── Cancel link ────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        <a
          href="mailto:tranmanhdungc1dtd@gmail.com?subject=Huỷ gia hạn tự động Climb IELTS"
          style={{ fontSize: 12, fontWeight: 700, color: HINT, textDecoration: 'none', borderBottom: `1px solid ${DIV}`, paddingBottom: 1 }}
        >
          Huỷ gia hạn tự động
        </a>
      </div>
    </div>
  )
}
