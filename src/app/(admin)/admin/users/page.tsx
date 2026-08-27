'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface PlanInfo { id: string; slug: string; name: string; price: number; limits: Record<string, number> }
interface UserRow {
  user_id: string
  full_name: string
  email: string
  role: string
  status: string
  created_at: string
  usage: { writing: number; speaking: number }
  subscriptions: Array<{
    status: string
    expires_at: string | null
    plans: PlanInfo | null
  }>
}

const STATUS_FILTERS = [
  { label: 'Tất cả', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
]
const PLAN_FILTERS = [
  { label: 'Mọi gói', value: '' },
  { label: 'Free', value: 'free' },
  { label: 'Basic', value: 'basic' },
  { label: 'Pro', value: 'pro' },
]

function planBadge(slug: string | undefined) {
  if (!slug) return <span className="text-xs text-slate-400">—</span>
  const colors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-500',
    basic: 'bg-blue-50 text-blue-600',
    pro: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[slug] ?? 'bg-slate-100 text-slate-500'}`}>
      {slug}
    </span>
  )
}

function statusBadge(status: string) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
    }`}>
      {status}
    </span>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      status: statusFilter,
      plan: planFilter,
    })
    const r = await fetch(`/api/admin/users?${params}`)
    const data = await r.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search, statusFilter, planFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const totalPages = Math.ceil(total / limit)

  function setFilter(type: 'status' | 'plan', value: string) {
    setPage(1)
    if (type === 'status') setStatusFilter(value)
    else setPlanFilter(value)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">{total} người dùng</p>
        </div>
        <input
          type="text"
          placeholder="Tên hoặc email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6">
        <div className="flex gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter('status', f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex gap-1">
          {PLAN_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter('plan', f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                planFilter === f.value
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Người dùng</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Gói</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Writing</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Speaking</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Ngày tham gia</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Không có user nào.</td></tr>
            ) : users.map(u => {
              const sub = u.subscriptions?.[0]
              const plan = sub?.plans
              const writingLimit = plan?.limits?.writing_grading_monthly ?? 0
              const speakingLimit = plan?.limits?.speaking_grading_monthly ?? 0
              return (
                <tr key={u.user_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{u.full_name || '—'}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{planBadge(plan?.slug)}</td>
                  <td className="px-4 py-3">{statusBadge(u.status)}</td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums">
                    {u.usage.writing}{writingLimit > 0 ? `/${writingLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums">
                    {u.usage.speaking}{speakingLimit > 0 ? `/${speakingLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.user_id}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-xs"
                    >
                      Chi tiết →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
          >
            ← Trước
          </button>
          <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  )
}
