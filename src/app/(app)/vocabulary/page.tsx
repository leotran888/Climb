import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreateFolderButton } from './VocabFoldersClient'

const COLOR_MAP: Record<string, { card: string; hover: string; icon: string; text: string }> = {
  green:  { card: 'bg-emerald-100 border-emerald-200', hover: 'hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-200', icon: 'bg-emerald-500', text: 'text-emerald-700' },
  pink:   { card: 'bg-pink-100 border-pink-200',       hover: 'hover:border-pink-500 hover:shadow-xl hover:shadow-pink-200',       icon: 'bg-pink-400',    text: 'text-pink-700' },
  purple: { card: 'bg-purple-100 border-purple-200',   hover: 'hover:border-purple-500 hover:shadow-xl hover:shadow-purple-200',   icon: 'bg-purple-500',  text: 'text-purple-700' },
  amber:  { card: 'bg-amber-100 border-amber-200',     hover: 'hover:border-amber-500 hover:shadow-xl hover:shadow-amber-200',     icon: 'bg-amber-400',   text: 'text-amber-700' },
  blue:   { card: 'bg-blue-100 border-blue-200',       hover: 'hover:border-blue-500 hover:shadow-xl hover:shadow-blue-200',       icon: 'bg-blue-500',    text: 'text-blue-700' },
}

export default async function VocabularyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: folders } = await supabase
    .from('vocab_folders')
    .select('*, vocab_words(status)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const allWords = (folders ?? []).flatMap((f: { vocab_words: { status: string }[] }) => f.vocab_words ?? [])
  const totalWords    = allWords.length
  const knownCount    = allWords.filter((w: { status: string }) => w.status === 'known').length
  const learningCount = allWords.filter((w: { status: string }) => w.status === 'learning').length
  const newCount      = allWords.filter((w: { status: string }) => w.status === 'new').length

  return (
    <div className="space-y-7 pb-12">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sổ từ vựng</h1>
          <p className="text-slate-400 text-sm mt-1">Lưu và ôn luyện từ vựng IELTS của bạn.</p>
        </div>
        <CreateFolderButton userId={user!.id} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng từ',    value: totalWords,    color: 'text-slate-900' },
          { label: 'Đã nhớ',     value: knownCount,    color: 'text-emerald-600' },
          { label: 'Đang học',   value: learningCount, color: 'text-amber-600' },
          { label: 'Mới thêm',   value: newCount,      color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[rgba(22,163,68,.13)] p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Writing Vocabulary Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Học theo kỹ năng</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/vocabulary/writing"
            className="bg-emerald-600 hover:bg-emerald-700 border border-[rgba(22,163,68,.13)] rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-emerald-200"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-emerald-100 bg-white/20 px-2 py-0.5 rounded-full">80 mục</span>
            </div>
            <div>
              <p className="font-bold text-base text-white">Từ vựng Writing</p>
              <p className="text-xs text-emerald-100 mt-0.5">Vocabulary · Collocations · Phrasal Verbs cho IELTS Writing</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-100 text-xs font-medium">
              <span>Khám phá ngay</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Folders */}
      {(folders ?? []).length === 0 ? (
        <div className="bg-white rounded-[20px] border border-[rgba(22,163,68,.13)] py-20 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700">Chưa có thư mục nào</p>
          <p className="text-slate-400 text-sm mt-1">Tạo thư mục để bắt đầu lưu từ vựng IELTS.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Thư mục của bạn</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(folders ?? []).map((folder: { id: string; name: string; color: string; vocab_words: { status: string }[] }) => {
              const c = COLOR_MAP[folder.color] ?? COLOR_MAP.green
              const words = folder.vocab_words ?? []
              const known = words.filter((w: { status: string }) => w.status === 'known').length
              return (
                <Link
                  key={folder.id}
                  href={`/vocabulary/${folder.id}`}
                  className={`${c.card} ${c.hover} border-2 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{words.length} từ</span>
                  </div>
                  <div>
                    <p className={`font-bold text-base ${c.text}`}>{folder.name}</p>
                    {words.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">{known}/{words.length} đã nhớ</p>
                    )}
                  </div>
                  {words.length > 0 && (
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${(known / words.length) * 100}%` }} />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
