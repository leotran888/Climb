'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileEditForm({
  userId,
  initialName,
}: {
  userId: string
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setLoading(true)
    setMsg('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('user_id', userId)
    setMsg(error ? 'Lỗi: ' + error.message : 'Đã lưu!')
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-1">Họ tên</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 btn-press"
        >
          {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
        {msg && <span className={`text-xs font-medium ${msg.startsWith('Lỗi') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
