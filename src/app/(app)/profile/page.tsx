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

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
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
  const plan = (subData as any)?.plans
  const planSlug    = plan?.slug ?? 'free'
  const planName    = plan?.name ?? 'Free'
  const expiresAt   = (subData as { expires_at?: string | null } | null)?.expires_at
  const priceLabel  = PRICE_MAP[planSlug] ?? ''

  const joinedDate = new Date(user.created_at).toLocaleDateString('vi-VN', {
    month: 'long', year: 'numeric',
  })

  const initial = profile.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-3xl space-y-5 pb-12">

      {/* Header */}
      <div>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">+ Hồ sơ</p>
        <h1 className="text-2xl font-black text-slate-900">Tài khoản của bạn</h1>
      </div>

      {/* Top row: Profile + Plan */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-5">

        {/* Profile info card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xl">{initial}</span>
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg leading-tight">{profile.full_name}</p>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">Thành viên từ {joinedDate}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Họ và tên</p>
            <ProfileEditForm userId={user.id} initialName={profile.full_name} />
          </div>
        </div>

        {/* Plan card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <p className="font-black text-slate-900">Gói hiện tại</p>

          <div className="rounded-xl p-4 flex-1" style={{ background: '#1b3621' }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Gói hiện tại
            </p>
            <p className="text-2xl font-black" style={{ color: '#f5aa00' }}>{planName}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {priceLabel}
              {expiresAt && (
                <> · Gia hạn {new Date(expiresAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</>
              )}
            </p>
          </div>

          <Link
            href="/subscription"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Xem chi tiết gói →
          </Link>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="font-black text-slate-900 mb-4">Mục tiêu IELTS</p>
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="font-black text-slate-900 mb-4">Thành tích</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="Writing cao nhất" value={bestWritingBand ?? '—'} />
          <StatBox label="Trung bình"        value={avgWritingBand ?? '—'} />
          <StatBox label="Bài đã nộp"        value={writingCount} />
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-start px-1">
        <div className="[&_button]:text-sm [&_button]:text-slate-400 [&_button]:hover:text-red-500 [&_button]:font-semibold [&_button]:transition-colors">
          <LogoutButton />
        </div>
      </div>

    </div>
  )
}
