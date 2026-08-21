'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Word = { id: string; word: string; definition: string | null; example: string | null; status: string }

export default function FlashcardClient({
  words,
  folderId,
  folderName,
}: {
  words: Word[]
  folderId: string
  folderName: string
}) {
  const [index, setIndex]     = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [knownCount, setKnownCount]   = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  const current = words[index]
  const total   = words.length

  async function handleAction(action: 'known' | 'review') {
    if (saving) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('vocab_words')
      .update({ status: action === 'known' ? 'known' : 'learning' })
      .eq('id', current.id)

    if (action === 'known') setKnownCount(k => k + 1)
    else setReviewCount(r => r + 1)

    setFlipped(false)
    setSaving(false)

    if (index < total - 1) {
      setTimeout(() => setIndex(i => i + 1), 200)
    } else {
      setTimeout(() => setDone(true), 200)
    }
  }

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f) }
    if (e.code === 'ArrowRight' && flipped) handleAction('known')
    if (e.code === 'ArrowLeft'  && flipped) handleAction('review')
  }, [flipped, index])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (total === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 mb-4">Thư mục chưa có từ nào để ôn.</p>
        <Link href={`/vocabulary/${folderId}`} className="text-emerald-600 font-semibold hover:underline">
          ← Quay lại thêm từ
        </Link>
      </div>
    )
  }

  /* ── Done screen ── */
  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Hoàn thành!</h2>
          <p className="text-slate-400 text-sm">Bạn đã ôn xong {total} thẻ trong &ldquo;{folderName}&rdquo;</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-2xl p-5">
            <p className="text-4xl font-black text-emerald-600">{knownCount}</p>
            <p className="text-sm text-emerald-700 mt-1 font-medium">Đã nhớ ✓</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-5">
            <p className="text-4xl font-black text-amber-600">{reviewCount}</p>
            <p className="text-sm text-amber-700 mt-1 font-medium">Cần ôn lại</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setIndex(0); setFlipped(false); setDone(false); setKnownCount(0); setReviewCount(0) }}
            className="bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors btn-press"
          >
            Ôn lại từ đầu
          </button>
          <Link
            href={`/vocabulary/${folderId}`}
            className="py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-center"
          >
            Quay lại thư mục
          </Link>
        </div>
      </div>
    )
  }

  /* ── Flashcard screen ── */
  const pct = (index / total) * 100

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/vocabulary/${folderId}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {folderName}
        </Link>
        <span className="text-sm text-slate-400 font-medium">{index + 1} / {total}</span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-1.5 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Flashcard */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1200px', minHeight: '300px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div className={`flip-card-inner relative w-full${flipped ? ' flipped' : ''}`} style={{ minHeight: '300px' }}>

          {/* Front */}
          <div className="flip-card-front absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-lg flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-6">Từ vựng</p>
            <p className="text-4xl font-black text-slate-900 mb-4">{current.word}</p>
            <p className="text-sm text-slate-400 mt-4 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Nhấn để xem nghĩa
            </p>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 bg-slate-900 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">{current.word}</p>
            {current.definition ? (
              <p className="text-2xl font-bold text-white mb-5 leading-snug">{current.definition}</p>
            ) : (
              <p className="text-slate-500 italic mb-5">Chưa có nghĩa</p>
            )}
            {current.example && (
              <p className="text-sm text-slate-400 italic border-t border-slate-700 pt-4 mt-1 leading-relaxed">
                &ldquo;{current.example}&rdquo;
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Action buttons — only show when flipped */}
      <div className={`grid grid-cols-2 gap-3 transition-all duration-200 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <button
          onClick={() => handleAction('review')}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 py-3.5 rounded-2xl font-bold hover:bg-amber-100 transition-colors btn-press"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
          Ôn lại
        </button>
        <button
          onClick={() => handleAction('known')}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl font-bold hover:bg-emerald-700 transition-colors btn-press shadow-md shadow-emerald-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Đã nhớ
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-slate-300">
        <kbd className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono">Space</kbd> lật thẻ ·
        <kbd className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono mx-1">←</kbd> Ôn lại ·
        <kbd className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono">→</kbd> Đã nhớ
      </p>
    </div>
  )
}
