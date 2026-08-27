'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalUsers: number
  activeSubscriptions: number
  currentMonthUsage: number
  lastMonthUsage: number
  suspendedUsers: number
  planDistribution: Record<string, { name: string; count: number }>
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
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
    return <div className="text-slate-400 text-sm">Đang tải...</div>
  }

  if (!stats) {
    return <div className="text-red-500 text-sm">Không thể tải dữ liệu.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hệ thống Climb IELTS</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Tổng users" value={stats.totalUsers} />
        <StatCard label="Đang active" value={stats.activeSubscriptions} sub="subscriptions" />
        <StatCard label="Lượt grading tháng này" value={stats.currentMonthUsage} />
        <StatCard label="Tháng trước" value={stats.lastMonthUsage} sub="lượt grading" />
        <StatCard label="Bị suspended" value={stats.suspendedUsers} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Phân phối gói</h2>
        <div className="space-y-2">
          {Object.entries(stats.planDistribution).map(([slug, { name, count }]) => (
            <div key={slug} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm font-medium text-slate-700">{name}</span>
              <span className="text-sm font-bold text-slate-900">{count} users</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
