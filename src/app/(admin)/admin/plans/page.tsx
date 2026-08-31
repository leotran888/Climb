'use client'

import { useEffect, useState } from 'react'

interface Plan {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  currency: string
  billing_interval: string
  limits: Record<string, number>
  features: Record<string, boolean>
  is_active: boolean
  sort_order: number
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const r = await fetch('/api/admin/plans')
    const data = await r.json()
    setPlans(data.plans ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    const r = await fetch(`/api/admin/plans/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        limits: editing.limits,
        features: editing.features,
        is_active: editing.is_active,
        sort_order: editing.sort_order,
      }),
    })
    setSaving(false)
    setMsg(r.ok ? '✓ Đã lưu.' : '✗ Lỗi khi lưu.')
    if (r.ok) { setEditing(null); load() }
    setTimeout(() => setMsg(''), 4000)
  }

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Đang tải...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plans</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý các gói subscription. Thay đổi giá và giới hạn sẽ áp dụng ngay lập tức.</p>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      <div className="grid gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white rounded-xl border p-5 ${!plan.is_active ? 'opacity-60 border-slate-100' : 'border-slate-200'}`}>
            {editing?.id === plan.id ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-900">{plan.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{plan.slug}</span>
                  <span className="text-xs text-slate-400 ml-1">(slug không thể sửa)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Giá (VND)</label>
                    <input
                      type="number"
                      value={editing.price}
                      onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Sort order</label>
                    <input
                      type="number"
                      value={editing.sort_order}
                      onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Writing/tháng</label>
                    <input
                      type="number"
                      value={editing.limits.writing_grading_monthly ?? 0}
                      onChange={e => setEditing({ ...editing, limits: { ...editing.limits, writing_grading_monthly: parseInt(e.target.value) } })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Speaking/tháng</label>
                    <input
                      type="number"
                      value={editing.limits.speaking_grading_monthly ?? 0}
                      onChange={e => setEditing({ ...editing, limits: { ...editing.limits, speaking_grading_monthly: parseInt(e.target.value) } })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Mô tả</label>
                  <input
                    value={editing.description ?? ''}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {/* Feature toggles */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Tính năng có thể truy cập</p>
                  <div className="flex flex-col gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {[
                      { key: 'writing_vocab_full', label: 'Writing Vocabulary — toàn bộ 18 topics' },
                    ].map(f => {
                      const enabled = editing.features?.[f.key] ?? false
                      return (
                        <label key={f.key} className="flex items-center gap-3 cursor-pointer">
                          <button
                            type="button"
                            onClick={() => setEditing({ ...editing, features: { ...editing.features, [f.key]: !enabled } })}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                          <span className="text-sm text-slate-700">{f.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id={`active-${plan.id}`}
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={e => setEditing({ ...editing, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`active-${plan.id}`} className="text-sm text-slate-700">Gói đang active</label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{plan.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{plan.slug}</span>
                    {!plan.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-full">Inactive</span>
                    )}
                  </div>
                  {plan.description && <div className="text-sm text-slate-500 mb-2">{plan.description}</div>}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                    <span>
                      <strong className="text-slate-900">{plan.price.toLocaleString('vi-VN')}</strong>
                      <span className="text-slate-400"> {plan.currency}/{plan.billing_interval}</span>
                    </span>
                    <span>Writing: <strong>{plan.limits.writing_grading_monthly}/tháng</strong></span>
                    <span>Speaking: <strong>{plan.limits.speaking_grading_monthly}/tháng</strong></span>
                    <span className="text-slate-400">Order: {plan.sort_order}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.features?.writing_vocab_full ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {plan.features?.writing_vocab_full ? '✓' : '✗'} Writing Vocabulary Full
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(plan)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shrink-0"
                >
                  Sửa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
