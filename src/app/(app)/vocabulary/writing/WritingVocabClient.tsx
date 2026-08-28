'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { VOCABULARY_DATA } from './data'
import {
  VocabularyItem,
  ItemType,
  WritingTask,
  BandLevel,
  TOPICS,
  BAND_COLORS,
  SUITABILITY_LABELS,
} from './types'

const LS_SAVED = 'climb_wv_saved'
const LS_STATUS = 'climb_wv_status'

type StatusMap = Record<string, 'learning' | 'learned'>

// ─── Small UI helpers ────────────────────────────────────────────────────────

function SuitabilityBadge({ s }: { s: VocabularyItem['writingSuitability'] }) {
  const info = SUITABILITY_LABELS[s]
  return (
    <span className={`text-xs font-medium ${info.color} flex items-center gap-0.5`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}

function BandPill({ band }: { band: BandLevel }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BAND_COLORS[band]}`}>
      Band {band}
    </span>
  )
}

function TopicPill({ topic }: { topic: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{topic}</span>
  )
}

function TaskPill({ task }: { task: WritingTask }) {
  const label = task === 'both' ? 'Task 1 & 2' : task === 'task1' ? 'Task 1' : 'Task 2'
  const color =
    task === 'task1'
      ? 'bg-purple-50 text-purple-700'
      : task === 'task2'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-teal-50 text-teal-700'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
}

// ─── Practice Modal ──────────────────────────────────────────────────────────

function PracticeModal({
  item,
  onClose,
}: {
  item: VocabularyItem
  onClose: () => void
}) {
  const [sentence, setSentence] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = useCallback(async () => {
    if (!sentence.trim()) return
    setLoading(true)
    setFeedback('')
    try {
      const res = await fetch('/api/vocabulary/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: item.term, sentence, definition: item.definition }),
      })
      const data = await res.json()
      setFeedback(data.feedback || 'No feedback received.')
    } catch {
      setFeedback('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [sentence, item])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base">Practice: <span className="text-emerald-600">{item.term}</span></h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm">
            Write an IELTS-style sentence using <strong className="text-slate-900">&ldquo;{item.term}&rdquo;</strong>.
          </p>

          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border-l-2 border-slate-300">
            <span className="font-medium text-slate-700">Definition:</span> {item.definition}
          </div>

          <textarea
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            placeholder="Write your sentence here..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none"
          />

          <button
            onClick={submit}
            disabled={loading || !sentence.trim()}
            className="w-full bg-emerald-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Getting feedback...' : 'Get AI Feedback'}
          </button>

          {feedback && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-emerald-700 mb-1">Feedback</p>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Vocabulary Card ─────────────────────────────────────────────────────────

function VocabCard({
  item,
  saved,
  status,
  onToggleSave,
  onSetStatus,
  onPractice,
}: {
  item: VocabularyItem
  saved: boolean
  status: 'learning' | 'learned' | undefined
  onToggleSave: (id: string) => void
  onSetStatus: (id: string, s: 'learning' | 'learned') => void
  onPractice: (item: VocabularyItem) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const speakTerm = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(item.term)
        utt.lang = 'en-GB'
        window.speechSynthesis.speak(utt)
      }
    } catch {
      // silently ignore
    }
  }, [item.term])

  const hasExtra =
    (item.collocations && item.collocations.length > 0) ||
    (item.alternatives && item.alternatives.length > 0) ||
    (item.academicAlternatives && item.academicAlternatives.length > 0) ||
    item.writingTip

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-slate-900">{item.term}</span>
            {item.pronunciation && (
              <button
                onClick={speakTerm}
                title="Listen"
                className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs"
              >
                🔊 <span className="text-slate-400 font-mono text-xs">{item.pronunciation}</span>
              </button>
            )}
          </div>
          {item.partOfSpeech && (
            <span className="text-xs text-slate-400 italic">{item.partOfSpeech}</span>
          )}
          {item.collocationType && (
            <span className="text-xs text-slate-400 italic ml-1">{item.collocationType}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleSave(item.id)}
            title={saved ? 'Unsave' : 'Save'}
            className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-red-500 hover:text-red-700' : 'text-slate-300 hover:text-red-400'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Metadata pills */}
      <div className="flex flex-wrap gap-1.5">
        <BandPill band={item.bandLevel} />
        <TopicPill topic={item.topic} />
        <TaskPill task={item.task} />
        <SuitabilityBadge s={item.writingSuitability} />
      </div>

      {/* Definition */}
      <p className="text-slate-700 text-sm">{item.definition}</p>

      {/* Vietnamese */}
      <p className="text-slate-500 text-sm italic">{item.vietnameseMeaning}</p>

      {/* Example */}
      <div className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3 border-l-2 border-emerald-500">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-0.5">Example</span>
        {item.example}
      </div>

      {/* Expandable section */}
      {hasExtra && (
        <>
          {expanded && (
            <div className="space-y-3">
              {item.collocations && item.collocations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Collocations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.collocations.map(c => (
                      <span key={c} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {(item.alternatives || item.academicAlternatives) && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    {item.academicAlternatives ? 'Academic alternatives' : 'Alternatives'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.academicAlternatives ?? item.alternatives ?? []).map(a => (
                      <span key={a} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.writingTip && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <span className="font-semibold text-amber-700">Writing Tip: </span>
                  {item.writingTip}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium text-left transition-colors"
          >
            {expanded ? '▲ Show less' : '▼ See more'}
          </button>
        </>
      )}

      {/* Status + Practice */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
        <button
          onClick={() => onSetStatus(item.id, status === 'learning' ? 'learned' : 'learning')}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border ${
            status === 'learned'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : status === 'learning'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300'
          }`}
        >
          {status === 'learned' ? '✓ Learned' : status === 'learning' ? '⟳ Learning' : 'Mark as Learning'}
        </button>

        <button
          onClick={() => onPractice(item)}
          className="text-xs px-2.5 py-1 rounded-lg font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          Practice ✏️
        </button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function WritingVocabClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<ItemType>('vocabulary')
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('All Topics')
  const [bandFilter, setBandFilter] = useState<BandLevel | 'all'>('all')
  const [taskFilter, setTaskFilter] = useState<WritingTask | 'all'>('all')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [statusMap, setStatusMap] = useState<StatusMap>({})
  const [practiceItem, setPracticeItem] = useState<VocabularyItem | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SAVED)
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]))
    } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem(LS_STATUS)
      if (raw) setStatusMap(JSON.parse(raw) as StatusMap)
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  const persistSaved = useCallback((next: Set<string>) => {
    setSavedIds(next)
    try { localStorage.setItem(LS_SAVED, JSON.stringify([...next])) } catch { /* ignore */ }
  }, [])

  const persistStatus = useCallback((next: StatusMap) => {
    setStatusMap(next)
    try { localStorage.setItem(LS_STATUS, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const toggleSave = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persistSaved(next)
      return next
    })
  }, [persistSaved])

  const setStatus = useCallback((id: string, s: 'learning' | 'learned') => {
    setStatusMap(prev => {
      const next = { ...prev }
      if (prev[id] === s) delete next[id]
      else next[id] = s
      persistStatus(next)
      return next
    })
  }, [persistStatus])

  const q = search.toLowerCase().trim()

  const filtered = useMemo(() => {
    return VOCABULARY_DATA.filter(item => {
      if (item.type !== activeTab) return false
      if (topicFilter !== 'All Topics' && item.topic !== topicFilter) return false
      if (bandFilter !== 'all' && item.bandLevel !== bandFilter) return false
      if (taskFilter !== 'all' && item.task !== taskFilter && item.task !== 'both') return false
      if (q) {
        const hay = [
          item.term,
          item.definition,
          item.vietnameseMeaning,
          item.topic,
          ...(item.collocations ?? []),
          ...(item.alternatives ?? []),
          ...(item.academicAlternatives ?? []),
        ].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [activeTab, topicFilter, bandFilter, taskFilter, q])

  const tabCounts = useMemo(() => ({
    vocabulary: VOCABULARY_DATA.filter(i => i.type === 'vocabulary').length,
    collocation: VOCABULARY_DATA.filter(i => i.type === 'collocation').length,
    phrasal_verb: VOCABULARY_DATA.filter(i => i.type === 'phrasal_verb').length,
  }), [])

  const tabs: { type: ItemType; label: string }[] = [
    { type: 'vocabulary', label: 'Vocabulary' },
    { type: 'collocation', label: 'Collocations' },
    { type: 'phrasal_verb', label: 'Phrasal Verbs' },
  ]

  const bands: (BandLevel | 'all')[] = ['all', '5-6', '6-7', '7+']
  const tasks: { v: WritingTask | 'all'; label: string }[] = [
    { v: 'all', label: 'All Tasks' },
    { v: 'task1', label: 'Task 1' },
    { v: 'task2', label: 'Task 2' },
  ]

  // suppress hydration mismatch for localStorage-driven state
  if (!hydrated) return null

  return (
    <>
      {practiceItem && (
        <PracticeModal item={practiceItem} onClose={() => setPracticeItem(null)} />
      )}

      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Writing Vocabulary</h1>
            <p className="text-slate-400 text-sm mt-1">
              IELTS-curated vocabulary, collocations, and phrasal verbs for writing tasks.
            </p>
          </div>
          <Link
            href="/vocabulary/writing/saved"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Saved ({savedIds.size})
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {tabs.map(t => (
            <div key={t.type} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <p className="text-2xl font-black text-slate-900">{tabCounts[t.type]}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.type}
              onClick={() => setActiveTab(t.type)}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
                activeTab === t.type
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Topic scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  topicFilter === t
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Band + Task filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-1">
              {bands.map(b => (
                <button
                  key={b}
                  onClick={() => setBandFilter(b)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    bandFilter === b
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {b === 'all' ? 'All Bands' : `Band ${b}`}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {tasks.map(t => (
                <button
                  key={t.v}
                  onClick={() => setTaskFilter(t.v)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    taskFilter === t.v
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search term, definition, Vietnamese meaning, collocations..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-400">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
          {q ? ` for "${search}"` : ''}
        </p>

        {/* Card grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-slate-700">No items found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
            <button
              onClick={() => { setSearch(''); setTopicFilter('All Topics'); setBandFilter('all'); setTaskFilter('all') }}
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(item => (
              <VocabCard
                key={item.id}
                item={item}
                saved={savedIds.has(item.id)}
                status={statusMap[item.id]}
                onToggleSave={toggleSave}
                onSetStatus={setStatus}
                onPractice={setPracticeItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suppress unused userId warning — kept for potential future personalisation */}
      <span data-user={userId} className="hidden" />
    </>
  )
}
