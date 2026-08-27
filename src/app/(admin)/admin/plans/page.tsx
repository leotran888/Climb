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
      body: JSON.stringify(editing),
    })
    setSaving(false)
    setMsg(r.ok ? '✓ Đã lưu.' : '✗ Lỗi khi lưu.')
    if (r.ok) { setEditing(null); load() }
  }

  if (loading) return <div className="text-slate-400 text-sm">Đang tải...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plans</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý các gói subscription</p>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      <div className="grid gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-5">
            {editing?.id === plan.id ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Tên</label>
                    <input
                      value={editing.name}
                      onChange={e => setEditing({ ...editing, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
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
                  <div className="text-sm text-slate-500 mb-2">{plan.description}</div>
                  <div className="flex gap-4 text-sm text-slate-700">
                    <span><strong>{plan.price.toLocaleString('vi-VN')}</strong> {plan.currency}/{plan.billing_interval}</span>
                    <span>Writing: <strong>{plan.limits.writing_grading_monthly}/tháng</strong></span>
                    <span>Speaking: <strong>{plan.limits.speaking_grading_monthly}/tháng</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(plan)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
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
