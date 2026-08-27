import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserEntitlements } from '@/lib/entitlement'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [subData, entitlements, allPlans] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .single()
      .then(r => r.data),
    getUserEntitlements(user.id),
    supabase
      .from('plans')
      .select('slug, name, price, currency, billing_interval, limits')
      .eq('is_active', true)
      .order('sort_order')
      .then(r => r.data ?? []),
  ])

  type PlanRow = { slug: string; name: string; price: number; currency: string; billing_interval: string; limits: Record<string, number> }
  const plan = (subData as { plans?: { name: string; description: string | null; slug: string; limits: Record<string, number> } } | null)?.plans
  const nextPlan = (allPlans as PlanRow[]).find(p => p.slug !== 'free' && p.slug !== plan?.slug) ?? null
  const billingPeriod = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý gói và theo dõi lượt sử dụng của bạn</p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">Gói hiện tại</div>
            <div className="text-2xl font-bold text-slate-900">{plan?.name ?? 'Free'}</div>
            {plan?.description && <div className="text-sm text-slate-500 mt-1">{plan.description}</div>}
          </div>
          {(subData as { expires_at?: string | null } | null)?.expires_at && (
            <div className="text-right">
              <div className="text-xs text-slate-400">Hết hạn</div>
              <div className="text-sm font-medium text-slate-700">
                {new Date((subData as { expires_at: string }).expires_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">
          Lượt sử dụng — {billingPeriod}
        </div>
        <div className="space-y-4">
          <UsageBar
            label="Writing AI Grading"
            used={entitlements.writing.currentUsage}
            limit={entitlements.writing.monthlyLimit}
            bonus={entitlements.writing.bonusRemaining}
          />
          <UsageBar
            label="Speaking AI Grading"
            used={entitlements.speaking.currentUsage}
            limit={entitlements.speaking.monthlyLimit}
            bonus={entitlements.speaking.bonusRemaining}
          />
        </div>
      </div>

      {/* Upgrade CTA */}
      {plan?.slug === 'free' && nextPlan && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6 text-center">
          <div className="text-lg font-bold text-emerald-900 mb-2">Nâng cấp để luyện tập không giới hạn</div>
          <div className="text-sm text-emerald-700 mb-4">
            Gói {nextPlan.name} từ {nextPlan.price.toLocaleString('vi-VN')}đ/{nextPlan.billing_interval === 'month' ? 'tháng' : nextPlan.billing_interval}
            {' — '}
            {nextPlan.limits.writing_grading_monthly} lượt Writing & Speaking mỗi tháng
          </div>
          <div className="text-xs text-emerald-600">
            Liên hệ admin để nâng cấp gói
          </div>
        </div>
      )}
    </div>
  )
}

function UsageBar({ label, used, limit, bonus }: { label: string; used: number; limit: number; bonus: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const isNearLimit = pct >= 80
  const isAtLimit = used >= limit

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {used} / {limit}
          {bonus > 0 && <span className="text-emerald-600 ml-1">+{bonus} bonus</span>}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-red-400' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isAtLimit && bonus === 0 && (
        <div className="text-xs text-red-500 mt-1">Đã dùng hết lượt tháng này</div>
      )}
    </div>
  )
}
