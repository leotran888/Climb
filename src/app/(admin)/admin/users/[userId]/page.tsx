'use client'

import { use, useEffect, useState } from 'react'

interface UserDetail {
  profile: {
    user_id: string
    full_name: string
    role: string
    status: string
    target_band: number | null
    exam_date: string | null
    created_at: string
  }
  subscription: {
    status: string
    started_at: string
    expires_at: string | null
    plans: { id: string; name: string; slug: string } | null
  } | null
  currentMonthUsage: { writing: number; speaking: number }
  bonusCredits: Array<{ id: string; feature: string; remaining: number; reason: string | null; expires_at: string | null }>
  auditLogs: Array<{ id: string; action: string; old_value: unknown; new_value: unknown; reason: string | null; created_at: string }>
}

interface Plan {
  id: string
  name: string
  slug: string
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Form state
  const [newPlanId, setNewPlanId] = useState('')
  const [planExpiry, setPlanExpiry] = useState('')
  const [planReason, setPlanReason] = useState('')
  const [creditFeature, setCreditFeature] = useState('writing_grading')
  const [creditAmount, setCreditAmount] = useState(1)
  const [creditReason, setCreditReason] = useState('')

  async function load() {
    setLoading(true)
    const [detailRes, plansRes] = await Promise.all([
      fetch(`/api/admin/users/${userId}`).then(r => r.json()),
      fetch('/api/admin/plans').then(r => r.json()),
    ])
    setDetail(detailRes)
    setPlans(plansRes.plans ?? [])
    setNewPlanId(detailRes.subscription?.plans?.id ?? '')
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  async function handleAssignPlan(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const r = await fetch(`/api/admin/users/${userId}/subscription`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: newPlanId, expiresAt: planExpiry || null, reason: planReason }),
    })
    setSaving(false)
    setMsg(r.ok ? '✓ Gói đã được cập nhật.' : '✗ Lỗi khi cập nhật gói.')
    if (r.ok) { setPlanReason(''); load() }
  }

  async function handleGrantCredits(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const r = await fetch(`/api/admin/users/${userId}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: creditFeature, amount: creditAmount, reason: creditReason }),
    })
    setSaving(false)
    setMsg(r.ok ? '✓ Credits đã được thêm.' : '✗ Lỗi khi thêm credits.')
    if (r.ok) { setCreditReason(''); load() }
  }

  async function handleToggleStatus() {
    const newStatus = detail?.profile.status === 'active' ? 'suspended' : 'active'
    const reason = prompt(`Lý do ${newStatus === 'suspended' ? 'suspend' : 'unsuspend'}:`)
    if (reason === null) return
    setSaving(true)
    const r = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reason }),
    })
    setSaving(false)
    setMsg(r.ok ? `✓ User đã được ${newStatus}.` : '✗ Lỗi khi thay đổi trạng thái.')
    if (r.ok) load()
  }

  if (loading) return <div className="text-slate-400 text-sm">Đang tải...</div>
  if (!detail) return <div className="text-red-500 text-sm">Không tìm thấy user.</div>

  const { profile, subscription, currentMonthUsage, bonusCredits, auditLogs } = detail

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile.role} · Tham gia {new Date(profile.created_at).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            profile.status === 'active'
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          {profile.status === 'active' ? 'Suspend user' : 'Unsuspend user'}
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Gói hiện tại</div>
          <div className="text-lg font-bold text-slate-900">{subscription?.plans?.name ?? 'Không có'}</div>
          {subscription?.expires_at && (
            <div className="text-xs text-slate-500 mt-1">Hết hạn: {new Date(subscription.expires_at).toLocaleDateString('vi-VN')}</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Writing tháng này</div>
          <div className="text-lg font-bold text-slate-900">{currentMonthUsage.writing} lượt</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Speaking tháng này</div>
          <div className="text-lg font-bold text-slate-900">{currentMonthUsage.speaking} lượt</div>
        </div>
      </div>

      {/* Assign plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Đổi gói subscription</h2>
        <form onSubmit={handleAssignPlan} className="space-y-3">
          <div className="flex gap-3">
            <select
              value={newPlanId}
              onChange={e => setNewPlanId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={planExpiry}
              onChange={e => setPlanExpiry(e.target.value)}
              placeholder="Ngày hết hạn (để trống = vĩnh viễn)"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            value={planReason}
            onChange={e => setPlanReason(e.target.value)}
            placeholder="Lý do (tùy chọn)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Cập nhật gói
          </button>
        </form>
      </div>

      {/* Grant credits */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Tặng bonus credits</h2>
        <form onSubmit={handleGrantCredits} className="space-y-3">
          <div className="flex gap-3">
            <select
              value={creditFeature}
              onChange={e => setCreditFeature(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="writing_grading">Writing</option>
              <option value="speaking_grading">Speaking</option>
            </select>
            <input
              type="number"
              min={1}
              max={100}
              value={creditAmount}
              onChange={e => setCreditAmount(parseInt(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={creditReason}
              onChange={e => setCreditReason(e.target.value)}
              placeholder="Lý do"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50"
          >
            Tặng credits
          </button>
        </form>

        {bonusCredits.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Credits hiện có</div>
            {bonusCredits.map(bc => (
              <div key={bc.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50">
                <span className="text-slate-700">{bc.feature === 'writing_grading' ? 'Writing' : 'Speaking'}</span>
                <span className="font-medium text-slate-900">{bc.remaining} còn lại</span>
                {bc.reason && <span className="text-slate-400 text-xs">{bc.reason}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit log */}
      {auditLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Lịch sử thay đổi</h2>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-start justify-between py-2 border-b border-slate-50 text-sm">
                <div>
                  <span className="font-medium text-slate-800">{log.action}</span>
                  {log.reason && <span className="text-slate-400 ml-2">— {log.reason}</span>}
                </div>
                <span className="text-slate-400 text-xs shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
