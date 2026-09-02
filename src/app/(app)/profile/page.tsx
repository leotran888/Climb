import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import ProfileEditForm from './ProfileEditForm'
import GoalsForm from './GoalsForm'

const PRICE_MAP: Record<string, string> = {
  free:       'Miễn phí',
  starter:    '99.000đ/tháng',
  pro:        '199.000đ/tháng',
  pro_yearly: '1.490.000đ/năm',
}

const CARD = {
  background: '#fff',
  border: '1.5px solid rgba(22,163,68,0.13)',
  borderRadius: 20,
  padding: 24,
} as const

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 16, fontWeight: 900, color: '#192e1e', marginBottom: 16 }}>
      {children}
    </p>
  )
}

function StatBox({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ background: '#f3f8f4', borderRadius: 14, padding: '14px 16px' }}>
      <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 900, color: accent ? '#16a344' : '#192e1e' }}>{value}</p>
    </div>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: profile }, { data: submissions }, { data: subData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('writing_submissions')
      .select('writing_results(overall_band)')
      .eq('user_id', user.id),
    supabase
      .from('subscriptions')
      .select('plans(name, slug), expires_at')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!profile) notFound()

  const writingBands = (submissions ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => (Array.isArray(s.writing_results) ? s.writing_results[0]?.overall_band : s.writing_results?.overall_band))
    .filter((b): b is number => typeof b === 'number')

  const bestWritingBand = writingBands.length ? Math.max(...writingBands) : null
  const avgWritingBand  = writingBands.length
    ? Math.round((writingBands.reduce((a, b) => a + b, 0) / writingBands.length) * 10) / 10
    : null
  const writingCount = (submissions ?? []).length

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan        = (subData as any)?.plans
  const planSlug    = plan?.slug ?? 'free'
  const planName    = plan?.name ?? 'Free'
  const expiresAt   = (subData as { expires_at?: string | null } | null)?.expires_at
  const priceLabel  = PRICE_MAP[planSlug] ?? ''

  const joinedDate = new Date(user.created_at).toLocaleDateString('vi-VN', {
    month: 'long', year: 'numeric',
  })

  const initial = profile.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ paddingBottom: 48 }} className="space-y-5">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#16a344', marginBottom: 6 }}>
          ✦ Hồ sơ
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#192e1e', letterSpacing: '-.02em', lineHeight: 1.1 }}>
          Tài khoản của bạn
        </h1>
      </div>

      {/* Top row: Profile + Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>

        {/* Profile info card */}
        <div style={CARD}>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#16a344', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>{initial}</span>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#192e1e' }}>{profile.full_name}</p>
              <p style={{ fontSize: 13, color: '#5a7864', fontWeight: 600 }}>{user.email}</p>
              <p style={{ fontSize: 11, color: '#5a7864', fontWeight: 600, marginTop: 4 }}>Thành viên từ {joinedDate}</p>
            </div>
          </div>

          {/* Name edit form */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(22,163,68,0.13)' }}>
            <ProfileEditForm userId={user.id} initialName={profile.full_name} />
          </div>
        </div>

        {/* Plan card */}
        <div style={CARD}>
          <SectionTitle>Gói hiện tại</SectionTitle>

          <div style={{ background: 'linear-gradient(135deg,#1b3621,#1e5c2e)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>
              Gói hiện tại
            </p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#f5aa00' }}>{planName}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
              {priceLabel}
              {expiresAt && (
                <> · Gia hạn {new Date(expiresAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</>
              )}
            </p>
          </div>

          <Link
            href="/subscription"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#16a344', textDecoration: 'none' }}
          >
            Xem chi tiết gói →
          </Link>
        </div>
      </div>

      {/* Goals */}
      <div style={CARD}>
        <SectionTitle>Mục tiêu IELTS</SectionTitle>
        <GoalsForm
          userId={user.id}
          initial={{
            target_band:     profile.target_band,
            target_writing:  profile.target_writing,
            target_speaking: profile.target_speaking,
            exam_date:       profile.exam_date,
          }}
        />
      </div>

      {/* Achievements */}
      <div style={CARD}>
        <SectionTitle>Thành tích</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <StatBox label="Writing cao nhất" value={bestWritingBand ?? '—'} accent />
          <StatBox label="Trung bình"        value={avgWritingBand ?? '—'} />
          <StatBox label="Bài đã nộp"        value={writingCount} />
        </div>
      </div>

      {/* Logout */}
      <div style={{ paddingTop: 4 }}>
        <div className="[&_button]:text-sm [&_button]:text-[#5a7864] [&_button]:hover:text-red-500 [&_button]:font-semibold [&_button]:transition-colors">
          <LogoutButton />
        </div>
      </div>

    </div>
  )
}
