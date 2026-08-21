import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AddWordForm, WordList, StatusFilter } from './WordsClient'

function FlashcardButton({ folderId, disabled }: { folderId: string; disabled: boolean }) {
  if (disabled) return null
  return (
    <Link
      href={`/vocabulary/${folderId}/flashcard`}
      className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-400 transition-colors card-hover"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
      Flashcard
    </Link>
  )
}

type Word = { id: string; word: string; definition: string | null; example: string | null; status: 'new' | 'learning' | 'known' }

const COLOR_ICON: Record<string, string> = {
  green:  'bg-emerald-500',
  pink:   'bg-pink-400',
  purple: 'bg-purple-500',
  amber:  'bg-amber-400',
  blue:   'bg-blue-500',
}

export default async function FolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ folderId: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { folderId }    = await params
  const { status = 'all' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: folder }, { data: words }] = await Promise.all([
    supabase.from('vocab_folders').select('*').eq('id', folderId).eq('user_id', user!.id).single(),
    supabase.from('vocab_words').select('*').eq('folder_id', folderId).eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])

  if (!folder) notFound()

  const typedWords: Word[] = (words ?? []) as Word[]
  const counts = {
    all:      typedWords.length,
    known:    typedWords.filter(w => w.status === 'known').length,
    learning: typedWords.filter(w => w.status === 'learning').length,
    new:      typedWords.filter(w => w.status === 'new').length,
  }

  const iconBg = COLOR_ICON[folder.color] ?? COLOR_ICON.green

  return (
    <div className="space-y-6 pb-12 max-w-3xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/vocabulary" className="hover:text-emerald-600 transition-colors">Sổ từ vựng</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{folder.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{folder.name}</h1>
            <p className="text-sm text-slate-400">{counts.all} từ · {counts.known} đã nhớ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FlashcardButton folderId={folderId} disabled={counts.all === 0} />
          <AddWordForm userId={user!.id} folderId={folderId} />
        </div>
      </div>

      {/* Progress bar */}
      {counts.all > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Tiến độ</span>
            <span>{Math.round((counts.known / counts.all) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${(counts.known / counts.all) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
            <span><span className="font-semibold text-emerald-600">{counts.known}</span> đã nhớ</span>
            <span><span className="font-semibold text-amber-600">{counts.learning}</span> đang học</span>
            <span><span className="font-semibold text-slate-500">{counts.new}</span> mới</span>
          </div>
        </div>
      )}

      {/* Filter + list */}
      {counts.all > 0 && (
        <StatusFilter current={status} counts={counts} />
      )}

      <WordList words={typedWords} filter={status} />

      {counts.all === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="font-semibold text-slate-700 mb-1">Thư mục đang trống</p>
          <p className="text-slate-400 text-sm mb-5">Thêm từ vựng để bắt đầu luyện tập.</p>
          <AddWordForm userId={user!.id} folderId={folderId} />
        </div>
      )}
    </div>
  )
}
