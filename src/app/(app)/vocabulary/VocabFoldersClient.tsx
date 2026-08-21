'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const COLORS = [
  { value: 'green',  bg: 'bg-emerald-500', label: 'Xanh' },
  { value: 'pink',   bg: 'bg-pink-400',    label: 'Hồng' },
  { value: 'purple', bg: 'bg-purple-500',  label: 'Tím' },
  { value: 'amber',  bg: 'bg-amber-400',   label: 'Vàng' },
  { value: 'blue',   bg: 'bg-blue-500',    label: 'Xanh dương' },
]

export function CreateFolderButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [name, setName]     = useState('')
  const [color, setColor]   = useState('green')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('vocab_folders').insert({ user_id: userId, name: name.trim(), color })
    setName('')
    setColor('green')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors btn-press"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tạo thư mục mới
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg">Tạo thư mục mới</h3>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Tên thư mục</label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Ví dụ: IELTS Task 2 Vocabulary"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-2">Màu sắc</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 btn-press"
              >
                {loading ? 'Đang tạo…' : 'Tạo thư mục'}
              </button>
              <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
