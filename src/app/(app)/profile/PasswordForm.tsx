'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PasswordForm() {
  const [pw, setPw]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]     = useState('')

  async function handleChange() {
    if (pw !== confirm) { setMsg('Mật khẩu không khớp.'); return }
    if (pw.length < 8)  { setMsg('Mật khẩu phải có ít nhất 8 ký tự.'); return }
    setLoading(true)
    setMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) setMsg('Lỗi: ' + error.message)
    else { setMsg('Đổi mật khẩu thành công!'); setPw(''); setConfirm('') }
    setLoading(false)
  }

  return (
    <div className="space-y-3 max-w-sm">
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-1">Mật khẩu mới</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="Ít nhất 8 ký tự"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-1">Xác nhận mật khẩu</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleChange}
          disabled={loading || !pw}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50 btn-press"
        >
          {loading ? 'Đang đổi…' : 'Đổi mật khẩu'}
        </button>
        {msg && <span className={`text-xs font-medium ${msg.startsWith('Lỗi') || msg.includes('không') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
