'use client'

import { use, useEffect, useState } from 'react'

interface Plan { id: string; name: string; slug: string; price: number; limits: Record<string, number> }
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
  email: string
  subscription: {
    status: string
    started_at: string
    expires_at: string | null
    plans: Plan | null
  } | null
  currentMonthUsage: { writing: number; speaking: number }
  bonusCredits: Array<{ id: string; feature: string; remaining: number; reason: string | null; expires_at: string | null }>
  auditLogs: Array<{ id: string; action: string; old_value: unknown; new_value: unknown; reason: string | null; created_at: string; admin_name?: string }>
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

export default function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Plan form
  const [newPlanId, setNewPlanId] = useState('')
  const [planExpiry, setPlanExpiry] = useState('')
  const [planReason, setPlanReason] = useState('')
  const [confirmPlan, setConfirmPlan] = useState(false)

  // Credits form
  const [creditFeature, setCreditFeature] = useState('writing_grading')
  const [creditAmount, setCreditAmount] = useState(1)
  const [creditReason, setCreditReason] = useState('')

  // Suspend confirm
  const [suspendReason, setSuspendReason] = useState('')
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false)

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

  function showMsg(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 4000)
  }

  async function handleAssignPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmPlan) { setConfirmPlan(true); return }
    setSaving(true)
    const r = await fetch(`/api/admin/users/${userId}/subscription`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: newPlanId, expiresAt: planExpiry || null, reason: planReason }),
    })
    setSaving(false)
    setConfirmPlan(false)
    showMsg(r.ok ? '✓ Gói đã được cập nhật.' : '✗ Lỗi khi cập nhật gói.')
    if (r.ok) { setPlanReason(''); load() }
  }

  async function handleGrantCredits(e: React.FormEvent) {
    e.preventDefault()
    if (creditAmount < 1) return
    setSaving(true)
    const r = await fetch(`/api/admin/users/${userId}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: creditFeature, amount: creditAmount, reason: creditReason }),
    })
    setSaving(false)
    showMsg(r.ok ? '✓ Credits đã được thêm.' : '✗ Lỗi khi thêm credits.')
    if (r.ok) { setCreditReason(''); setCreditAmount(1); load() }
  }

  async function handleToggleStatus() {
    if (!detail) return
    const newStatus = detail.profile.status === 'active' ? 'suspended' : 'active'
    if (newStatus === 'suspended' && !showSuspendConfirm) {
      setShowSuspendConfirm(true)
      return
    }
    setSaving(true)
    const r = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reason: suspendReason }),
    })
    setSaving(false)
    setShowSuspendConfirm(false)
    setSuspendReason('')
    showMsg(r.ok ? `✓ User đã được ${newStatus === 'suspended' ? 'suspend' : 'unsuspend'}.` : '✗ Lỗi khi thay đổi trạng thái.')
    if (r.ok) load()
  }

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Đang tải...</div>
  if (!detail) return <div className="text-red-500 text-sm">Không tìm thấy user.</div>

  const { profile, email, subscription, currentMonthUsage, bonusCredits, auditLogs } = detail
  const currentPlan = subscription?.plans
  const writingLimit = currentPlan?.limits?.writing_grading_monthly ?? 0
  const speakingLimit = currentPlan?.limits?.speaking_grading_monthly ?? 0
  const isSuspended = profile.status === 'suspended'

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.full_name || '(Chưa đặt tên)'}</h1>
          <p className="text-sm text-slate-400 mt-1">{email}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile.role} · Tham gia {new Date(profile.created_at).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isSuspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {isSuspended ? 'Suspended' : 'Active'}
        </span>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Gói hiện tại</div>
          <div className="text-lg font-bold text-slate-900">{currentPlan?.name ?? 'Không có'}</div>
          {currentPlan && (
            <div className="text-xs text-slate-400 mt-1">{currentPlan.price.toLocaleString('vi-VN')}đ/tháng</div>
          )}
          {subscription?.expires_at && (
            <div className="text-xs text-slate-400">Hết hạn: {new Date(subscription.expires_at).toLocaleDateString('vi-VN')}</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Writing tháng này</div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            {currentMonthUsage.writing}{writingLimit > 0 ? `/${writingLimit}` : ''}
          </div>
          <div className="text-xs text-slate-400 mt-1">{writingLimit > 0 ? `Giới hạn: ${writingLimit}/tháng` : 'Unlimited'}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Speaking tháng này</div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            {currentMonthUsage.speaking}{speakingLimit > 0 ? `/${speakingLimit}` : ''}
          </div>
          <div className="text-xs text-slate-400 mt-1">{speakingLimit > 0 ? `Giới hạn: ${speakingLimit}/tháng` : 'Unlimited'}</div>
        </div>
      </div>

      {/* Assign plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Đổi gói subscription</h2>
        <form onSubmit={handleAssignPlan} className="space-y-3">
          <div className="flex gap-3">
            <select
              value={newPlanId}
              onChange={e => { setNewPlanId(e.target.value); setConfirmPlan(false) }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.price > 0 ? p.price.toLocaleString('vi-VN') + 'đ' : 'Free'}</option>
              ))}
            </select>
            <input
              type="date"
              value={planExpiry}
              onChange={e => setPlanExpiry(e.target.value)}
              title="Ngày hết hạn (để trống = vĩnh viễn)"
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
          {confirmPlan && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
              Xác nhận đổi sang gói <strong>{plans.find(p => p.id === newPlanId)?.name}</strong>? Nhấn &quot;Cập nhật gói&quot; lần nữa để xác nhận.
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {confirmPlan ? 'Xác nhận đổi gói' : 'Cập nhật gói'}
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
            disabled={saving || creditAmount < 1}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50"
          >
            Tặng credits
          </button>
        </form>

        {bonusCredits.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Credits hiện có</div>
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

      {/* Suspend / Unsuspend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          {isSuspended ? 'Mở khóa tài khoản' : 'Suspend tài khoản'}
        </h2>
        {!isSuspended && (
          <p className="text-sm text-slate-500 mb-4">User sẽ bị chặn đăng nhập và không thể dùng app cho đến khi được mở khóa.</p>
        )}

        {showSuspendConfirm && !isSuspended && (
          <div className="mb-4 space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              Xác nhận suspend <strong>{profile.full_name}</strong>? User sẽ mất quyền truy cập ngay lập tức.
            </div>
            <input
              type="text"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="Lý do suspend (tùy chọn)"
              className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
              isSuspended
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            {isSuspended ? 'Mở khóa' : showSuspendConfirm ? 'Xác nhận Suspend' : 'Suspend user'}
          </button>
          {showSuspendConfirm && !isSuspended && (
            <button
              onClick={() => { setShowSuspendConfirm(false); setSuspendReason('') }}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* Audit log */}
      {auditLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Lịch sử thay đổi</h2>
          <div className="space-y-0">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {actionLabel(log.action)}
                  </span>
                  {log.reason && <span className="text-slate-400">{log.reason}</span>}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4 text-xs">
                  {log.admin_name && <span className="text-slate-500">{log.admin_name}</span>}
                  <span className="text-slate-400">{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
