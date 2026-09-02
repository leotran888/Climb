'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Word = {
  id: string
  word: string
  definition: string | null
  example: string | null
  status: 'new' | 'learning' | 'known'
}

const STATUS_CONFIG = {
  new:      { label: 'Mới',      bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400' },
  learning: { label: 'Đang học', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  known:    { label: 'Đã nhớ',   bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

const STATUS_CYCLE: Record<string, 'new' | 'learning' | 'known'> = {
  new: 'learning', learning: 'known', known: 'new',
}

export function AddWordForm({ userId, folderId }: { userId: string; folderId: string }) {
  const router = useRouter()
  const [word, setWord]   = useState('')
  const [def, setDef]     = useState('')
  const [ex, setEx]       = useState('')
  const [open, setOpen]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!word.trim()) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('vocab_words').insert({
      user_id: userId, folder_id: folderId,
      word: word.trim(), definition: def.trim() || null, example: ex.trim() || null,
    })
    setWord(''); setDef(''); setEx('')
    setOpen(false); setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors btn-press"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Thêm từ mới
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg">Thêm từ vựng</h3>
            {[
              { label: 'Từ / Cụm từ *', value: word, set: setWord, placeholder: 'Ví dụ: mitigate' },
              { label: 'Nghĩa / Định nghĩa', value: def, set: setDef, placeholder: 'Ví dụ: làm giảm nhẹ, giảm thiểu' },
              { label: 'Ví dụ', value: ex, set: setEx, placeholder: 'Ví dụ: Governments should mitigate climate change...' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-500 block mb-1">{f.label}</label>
                <input
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={loading || !word.trim()}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 btn-press transition-colors"
              >
                {loading ? 'Đang thêm…' : 'Thêm từ'}
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

export function WordList({ words, filter }: { words: Word[]; filter: string }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editWord, setEditWord]     = useState<Word | null>(null)
  const [editW, setEditW]           = useState('')
  const [editDef, setEditDef]       = useState('')
  const [editEx, setEditEx]         = useState('')
  const [saving, setSaving]         = useState(false)

  const filtered = filter === 'all' ? words : words.filter(w => w.status === filter)

  async function cycleStatus(id: string, current: string) {
    const supabase = createClient()
    await supabase.from('vocab_words').update({ status: STATUS_CYCLE[current] }).eq('id', id)
    router.refresh()
  }

  async function deleteWord(id: string) {
    if (!confirm('Xóa từ này?')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('vocab_words').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  function openEdit(w: Word) {
    setEditWord(w)
    setEditW(w.word)
    setEditDef(w.definition ?? '')
    setEditEx(w.example ?? '')
  }

  async function saveEdit() {
    if (!editWord || !editW.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('vocab_words').update({
      word: editW.trim(),
      definition: editDef.trim() || null,
      example: editEx.trim() || null,
    }).eq('id', editWord.id)
    setSaving(false)
    setEditWord(null)
    router.refresh()
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
        <p className="text-slate-400 text-sm">Không có từ nào{filter !== 'all' ? ` ở trạng thái "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label}"` : ''}.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {filtered.map(w => {
          const s = STATUS_CONFIG[w.status]
          return (
            <div key={w.id} className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-start gap-4 card-hover group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-900">{w.word}</p>
                  <button
                    onClick={() => cycleStatus(w.id, w.status)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text} transition-all hover:scale-105 btn-press`}
                    title="Click để đổi trạng thái"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </button>
                </div>
                {w.definition && <p className="text-sm text-slate-600 mt-1">{w.definition}</p>}
                {w.example    && <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{w.example}&rdquo;</p>}
              </div>
              <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(w)} className="text-slate-300 hover:text-emerald-500 transition-colors p-1" title="Sửa từ">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button onClick={() => deleteWord(w.id)} disabled={deletingId === w.id} className="text-slate-300 hover:text-red-400 transition-colors p-1" title="Xóa từ">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {editWord && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditWord(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg">Sửa từ vựng</h3>
            {[
              { label: 'Từ / Cụm từ *', value: editW,   set: setEditW,   placeholder: 'Ví dụ: mitigate' },
              { label: 'Nghĩa',          value: editDef, set: setEditDef, placeholder: 'Ví dụ: làm giảm nhẹ' },
              { label: 'Ví dụ',          value: editEx,  set: setEditEx,  placeholder: 'Ví dụ: Governments should mitigate...' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-500 block mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={saveEdit} disabled={saving || !editW.trim()}
                style={{ flex: 1, background: '#16a344', color: '#fff', border: 'none', borderRadius: 12, padding: '10px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: (saving || !editW.trim()) ? .5 : 1 }}>
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
              <button onClick={() => setEditWord(null)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function StatusFilter({ current, counts }: { current: string; counts: Record<string, number> }) {
  const router = useRouter()

  const tabs = [
    { key: 'all',      label: 'Tất cả',    count: counts.all },
    { key: 'known',    label: 'Đã nhớ',    count: counts.known },
    { key: 'learning', label: 'Đang học',  count: counts.learning },
    { key: 'new',      label: 'Mới',       count: counts.new },
  ]

  function setFilter(key: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('status', key)
    router.push(url.pathname + url.search)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setFilter(t.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all btn-press ${
            current === t.key
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          {t.label}
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${current === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
            {t.count}
          </span>
        </button>
      ))}
    </div>
  )
}
