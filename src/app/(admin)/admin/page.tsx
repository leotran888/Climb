'use client'

import { useEffect, useState } from 'react'

interface PlanInfo { name: string; count: number; price: number }
interface ActivityItem {
  id: string
  action: string
  reason: string | null
  created_at: string
  admin_name: string
  target_user_id: string | null
}
interface Stats {
  totalUsers: number
  suspendedUsers: number
  activeSubscriptions: number
  paidSubscribers: number
  writingThisMonth: number
  speakingThisMonth: number
  writingLastMonth: number
  speakingLastMonth: number
  totalBonusCreditsRemaining: number
  estimatedMRR: number
  planDistribution: Record<string, PlanInfo>
  recentActivity: ActivityItem[]
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
      <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    assign_plan: 'Đổi gói',
    grant_bonus_credits: 'Tặng credits',
    set_user_status: 'Đổi trạng thái',
    plan_updated: 'Cập nhật plan',
  }
  return map[action] ?? action
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-red-500 text-sm">Không thể tải dữ liệu.</div>
  }

  const planOrder = ['free', 'basic', 'pro']
  const sortedPlans = planOrder
    .filter(s => stats.planDistribution[s])
    .map(s => ({ slug: s, ...stats.planDistribution[s] }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hệ thống Climb IELTS</p>
      </div>

      {/* Users */}
      <section>
        <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Users</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tổng users" value={stats.totalUsers} />
          <StatCard label="Bị suspended" value={stats.suspendedUsers} sub="tài khoản" />
          <StatCard label="Active subs" value={stats.activeSubscriptions} sub="đang hoạt động" />
          <StatCard label="Paid subscribers" value={stats.paidSubscribers} sub="có trả phí" />
        </div>
      </section>

      {/* Usage */}
      <section>
        <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Lượt dùng tháng này</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Writing" value={stats.writingThisMonth} sub={`Tháng trước: ${stats.writingLastMonth}`} />
          <StatCard label="Speaking" value={stats.speakingThisMonth} sub={`Tháng trước: ${stats.speakingLastMonth}`} />
          <StatCard label="Tổng lượt tháng này" value={stats.writingThisMonth + stats.speakingThisMonth} />
          <StatCard label="Bonus credits còn lại" value={stats.totalBonusCreditsRemaining} sub="toàn hệ thống" />
        </div>
      </section>

      {/* Revenue + Plan distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Doanh thu ước tính</div>
          <div className="text-3xl font-bold text-emerald-600 mb-1">
            {stats.estimatedMRR.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-xs text-slate-400 mb-4">MRR ước tính (chưa bao gồm thuế, hoàn tiền)</div>
          <div className="space-y-2">
            {sortedPlans.filter(p => p.slug !== 'free').map(p => (
              <div key={p.slug} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-600">{p.name}</span>
                <span className="text-slate-900 font-medium">
                  {p.count} × {p.price.toLocaleString('vi-VN')}đ
                  <span className="text-slate-400 ml-1">= {(p.count * p.price).toLocaleString('vi-VN')}đ</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Phân phối gói</div>
          <div className="space-y-3">
            {sortedPlans.map(p => {
              const pct = stats.totalUsers > 0 ? Math.round((p.count / stats.totalUsers) * 100) : 0
              return (
                <div key={p.slug}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{p.name}</span>
                    <span className="text-sm text-slate-500">{p.count} users ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Hoạt động gần đây</div>
          <div className="space-y-0">
            {stats.recentActivity.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {actionLabel(item.action)}
                  </span>
                  {item.reason && <span className="text-slate-400 truncate max-w-xs">{item.reason}</span>}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-slate-500 text-xs">{item.admin_name}</span>
                  <span className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
