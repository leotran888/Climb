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
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#16a344', color: '#fff', border: 'none', borderRadius: 50, padding: '10px 20px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Thư mục mới
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

const FOLDER_BG: Record<string, string> = {
  green:  'rgba(22,163,68,.06)',
  amber:  'rgba(245,170,0,.06)',
  blue:   'rgba(80,80,220,.04)',
  pink:   'rgba(220,80,80,.04)',
  purple: 'rgba(120,80,220,.04)',
}

export function FolderCard({
  folder,
}: {
  folder: { id: string; name: string; color: string; vocab_words: { status: string }[] }
}) {
  const router = useRouter()
  const [editOpen,  setEditOpen]  = useState(false)
  const [editName,  setEditName]  = useState(folder.name)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)

  const words   = folder.vocab_words ?? []
  const known   = words.filter(w => w.status === 'known').length
  const pct     = words.length ? Math.round((known / words.length) * 100) : 0
  const bgColor = FOLDER_BG[folder.color] ?? FOLDER_BG.green

  async function saveEdit() {
    if (!editName.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('vocab_folders').update({ name: editName.trim() }).eq('id', folder.id)
    setSaving(false)
    setEditOpen(false)
    router.refresh()
  }

  async function deleteFolder() {
    if (!confirm(`Xóa thư mục "${folder.name}" và toàn bộ từ bên trong?`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('vocab_words').delete().eq('folder_id', folder.id)
    await supabase.from('vocab_folders').delete().eq('id', folder.id)
    router.refresh()
  }

  return (
    <>
      <div style={{ position: 'relative' }} className="group">
        <a href={`/vocabulary/${folder.id}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: bgColor, border: '1.5px solid rgba(22,163,68,0.13)', borderRadius: 16, padding: 20, cursor: 'pointer' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#192e1e', marginBottom: 4 }}>{folder.name}</p>
            <p style={{ fontSize: 12, color: '#5a7864', fontWeight: 600, marginBottom: 14 }}>{words.length} từ</p>
            <div style={{ background: 'rgba(22,163,68,.1)', borderRadius: 50, height: 6 }}>
              <div style={{ height: '100%', borderRadius: 50, background: '#16a344', width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, fontWeight: 700, color: '#5a7864' }}>
              <span>{known} đã thuộc</span>
              <span>{pct}%</span>
            </div>
          </div>
        </a>

        {/* Edit / Delete — hiện khi hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.preventDefault(); setEditName(folder.name); setEditOpen(true) }}
            style={{ background: 'rgba(255,255,255,.9)', border: '1px solid rgba(22,163,68,.2)', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#5a7864', lineHeight: 0 }}
            title="Đổi tên"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={e => { e.preventDefault(); deleteFolder() }}
            disabled={deleting}
            style={{ background: 'rgba(255,255,255,.9)', border: '1px solid rgba(220,80,80,.2)', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#e05050', lineHeight: 0 }}
            title="Xóa thư mục"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg">Đổi tên thư mục</h3>
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-2 pt-1">
              <button onClick={saveEdit} disabled={saving || !editName.trim()}
                style={{ flex: 1, background: '#16a344', color: '#fff', border: 'none', borderRadius: 12, padding: '10px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: (saving || !editName.trim()) ? .5 : 1 }}>
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
              <button onClick={() => setEditOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function CreateFolderCard({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [color, setColor]     = useState('green')
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
      <div
        onClick={() => setOpen(true)}
        style={{ border: '1.5px dashed rgba(22,163,68,.25)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, cursor: 'pointer', minHeight: 120 }}
      >
        <div style={{ fontSize: 24, color: '#16a344', opacity: .5 }}>+</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#5a7864' }}>Tạo thư mục mới</div>
      </div>

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
                style={{ flex: 1, background: '#16a344', color: '#fff', border: 'none', borderRadius: 12, padding: '10px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !name.trim()) ? .5 : 1 }}
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
