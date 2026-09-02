import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserEntitlements } from '@/lib/entitlement'
import Link from 'next/link'

const PLAN_META: Record<string, {
  desc: string
  features: string[]
  locked?: string[]
  highlight?: boolean
  badge?: string
  priceLabel: string
  priceDay?: string
}> = {
  free: {
    desc: 'Làm quen với Climb, không cần cam kết.',
    priceLabel: '0đ',
    priceDay: 'Mãi mãi miễn phí',
    features: ['2 lượt Writing AI/tháng', '3 topic Vocabulary', 'Lịch sử bài nộp'],
    locked: ['18 topic Vocabulary đầy đủ'],
  },
  starter: {
    desc: 'Học từ vựng bài bản, luyện Writing đều đặn.',
    priceLabel: '99.000đ',
    priceDay: '~3.300đ/ngày',
    features: ['10 lượt Writing AI/tháng', '18 topic Vocabulary đầy đủ', 'Lưu từ & theo dõi tiến độ', 'Lịch sử bài nộp đầy đủ'],
  },
  pro: {
    desc: 'Luyện không giới hạn, tăng band nhanh nhất.',
    priceLabel: '199.000đ',
    priceDay: '~6.600đ/ngày',
    features: ['Writing AI không giới hạn', '18 topic Vocabulary đầy đủ', 'Lưu từ & theo dõi tiến độ', 'Ưu tiên xử lý nhanh hơn'],
    highlight: true,
    badge: '🔥 Phổ biến nhất',
  },
  pro_yearly: {
    desc: 'Cam kết cả lộ trình — tiết kiệm gần 1 triệu.',
    priceLabel: '1.490.000đ/năm',
    priceDay: '~4.100đ/ngày · ~124k/tháng',
    features: ['Mọi thứ trong Pro', 'Tiết kiệm 998.000đ/năm', 'Tương đương 2 tháng miễn phí', 'Ưu tiên hỗ trợ'],
    badge: '✦ Tiết kiệm nhất',
  },
}

const PLAN_ORDER = ['free', 'starter', 'pro', 'pro_yearly']

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
  const plan = (subData as { plans?: PlanRow } | null)?.plans
  const currentSlug = plan?.slug ?? 'free'
  const billingPeriod = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  const expiresAt = (subData as { expires_at?: string | null } | null)?.expires_at

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gói của bạn</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý gói và theo dõi lượt sử dụng</p>
      </div>

      {/* Current plan + usage */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">Gói hiện tại</div>
            <div className="text-2xl font-bold text-slate-900">{plan?.name ?? 'Free'}</div>
            {plan?.description && <div className="text-sm text-slate-500 mt-1">{plan.description}</div>}
          </div>
          {expiresAt && (
            <div className="text-right">
              <div className="text-xs text-slate-400">Hết hạn</div>
              <div className="text-sm font-medium text-slate-700">
                {new Date(expiresAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
            Lượt sử dụng — {billingPeriod}
          </div>
          <div className="space-y-4">
            <UsageBar
              label="Writing AI Grading"
              used={entitlements.writing.currentUsage}
              limit={entitlements.writing.monthlyLimit}
              bonus={entitlements.writing.bonusRemaining}
            />
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Tất cả gói</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLAN_ORDER.map(slug => {
            const meta = PLAN_META[slug]
            if (!meta) return null
            const isCurrent = slug === currentSlug
            const isHighlight = meta.highlight

            return (
              <div
                key={slug}
                className={`rounded-2xl p-5 flex flex-col gap-3 border-2 relative transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50'
                    : isHighlight
                    ? 'border-slate-800 bg-slate-900'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Badge */}
                {meta.badge && !isCurrent && (
                  <span className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full w-fit ${
                    isHighlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {meta.badge}
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full w-fit bg-emerald-600 text-white">
                    ✓ Gói hiện tại
                  </span>
                )}

                {/* Price */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${
                    isCurrent ? 'text-emerald-600' : isHighlight ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    {slug === 'free' ? 'Free' : slug === 'starter' ? 'Starter' : slug === 'pro' ? 'Pro' : 'Pro Yearly'}
                  </p>
                  <p className={`text-2xl font-black tracking-tight ${
                    isCurrent ? 'text-slate-900' : isHighlight ? 'text-white' : 'text-slate-900'
                  }`}>
                    {meta.priceLabel}
                  </p>
                  {meta.priceDay && (
                    <p className={`text-xs mt-0.5 font-medium ${
                      isCurrent ? 'text-emerald-600' : isHighlight ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      {meta.priceDay}
                    </p>
                  )}
                </div>

                <p className={`text-xs leading-relaxed ${
                  isCurrent ? 'text-slate-600' : isHighlight ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {meta.desc}
                </p>

                {/* Features */}
                <ul className="space-y-1.5 flex-1">
                  {meta.features.map(f => (
                    <li key={f} className={`text-xs flex items-start gap-1.5 ${
                      isCurrent ? 'text-slate-700' : isHighlight ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                  {(meta.locked ?? []).map(f => (
                    <li key={f} className="text-xs flex items-start gap-1.5 text-slate-300 line-through decoration-slate-200">
                      <span className="font-bold mt-0.5">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {!isCurrent && (
                  <Link
                    href="mailto:tranmanhdungc1dtd@gmail.com?subject=Nâng cấp Climb IELTS"
                    className={`mt-1 block text-center text-xs font-bold py-2.5 rounded-xl transition-all ${
                      isHighlight
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {currentSlug === 'free' || PLAN_ORDER.indexOf(slug) > PLAN_ORDER.indexOf(currentSlug)
                      ? 'Liên hệ để nâng cấp →'
                      : 'Chuyển về gói này'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-center text-slate-400 mt-4">
          Để nâng cấp gói, liên hệ qua email hoặc Zalo — chúng tôi xử lý trong vòng 1 giờ.
        </p>
      </div>
    </div>
  )
}

function UsageBar({ label, used, limit, bonus }: { label: string; used: number; limit: number; bonus: number }) {
  const isUnlimited = limit >= 999
  const pct = (!isUnlimited && limit > 0) ? Math.min(100, (used / limit) * 100) : 0
  const isNearLimit = !isUnlimited && pct >= 80
  const isAtLimit = !isUnlimited && used >= limit

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {isUnlimited
            ? <span className="text-emerald-600 font-medium">Không giới hạn</span>
            : <>{used} / {limit}{bonus > 0 && <span className="text-emerald-600 ml-1">+{bonus} bonus</span>}</>
          }
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isUnlimited ? 'bg-emerald-500' : isAtLimit ? 'bg-red-400' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: isUnlimited ? '100%' : `${pct}%` }}
        />
      </div>
      {isAtLimit && bonus === 0 && (
        <div className="text-xs text-red-500 mt-1">Đã dùng hết lượt tháng này</div>
      )}
    </div>
  )
}
