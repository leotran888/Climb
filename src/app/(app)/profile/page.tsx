import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import ProfileEditForm from './ProfileEditForm'
import GoalsForm from './GoalsForm'
import PasswordForm from './PasswordForm'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-600 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-black text-slate-900">{value}</span>
    </div>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: profile }, { data: submissions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('writing_submissions')
      .select('writing_results(overall_band)')
      .eq('user_id', user.id),
  ])

  if (!profile) notFound()

  const writingBands = (submissions ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => (Array.isArray(s.writing_results) ? s.writing_results[0]?.overall_band : s.writing_results?.overall_band))
    .filter((b): b is number => typeof b === 'number')

  const latestWritingBand = writingBands[0] ?? null
  const bestWritingBand   = writingBands.length ? Math.max(...writingBands) : null
  const writingCount      = (submissions ?? []).length

  const joinedDate = new Date(user.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const initial = profile.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-3xl space-y-6 pb-12">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ</h1>
        <p className="text-slate-400 text-sm mt-1">Quản lý thông tin và mục tiêu IELTS của bạn.</p>
      </div>

      {/* ── Profile info ── */}
      <Card title="Hồ sơ">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-emerald-700 font-black text-2xl">{initial}</span>
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 text-lg">{profile.full_name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400">Tham gia ngày {joinedDate}</p>
          </div>
        </div>
        <ProfileEditForm userId={user.id} initialName={profile.full_name} />
      </Card>

      {/* ── IELTS Goals ── */}
      <Card title="Mục tiêu IELTS">
        <GoalsForm
          userId={user.id}
          initial={{
            target_band:     profile.target_band,
            target_writing:  profile.target_writing,
            target_speaking: profile.target_speaking,
            exam_date:       profile.exam_date,
          }}
        />
      </Card>

      {/* ── Achievements ── */}
      <Card title="Thành tích">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <StatItem label="Writing hiện tại"   value={latestWritingBand ?? '—'} />
          <StatItem label="Speaking hiện tại"  value="—" />
          <StatItem label="Writing cao nhất"   value={bestWritingBand ?? '—'} />
          <StatItem label="Speaking cao nhất"  value="—" />
          <StatItem label="Bài Writing đã chấm" value={writingCount} />
          <StatItem label="Bài Speaking đã chấm" value="0" />
        </div>
      </Card>

      {/* ── Settings ── */}
      <Card title="Cài đặt">
        <div className="space-y-6">

          {/* Change password */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Đổi mật khẩu</p>
            <PasswordForm />
          </div>

          {/* Notifications placeholder */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Thông báo</p>
                <p className="text-xs text-slate-400 mt-0.5">Nhận email khi có kết quả chấm bài</p>
              </div>
              <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-not-allowed opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-2xl" />
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 pt-5">
            <p className="text-sm font-semibold text-slate-700 mb-2">Đăng xuất</p>
            <p className="text-xs text-slate-400 mb-3">Bạn sẽ được chuyển về trang chủ.</p>
            <LogoutButton />
          </div>

        </div>
      </Card>

    </div>
  )
}
