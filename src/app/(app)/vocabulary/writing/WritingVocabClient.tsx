'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  ALL_VOCABULARY,
  ALL_COLLOCATIONS,
  ALL_PHRASAL_VERBS,
  ALL_WRITING_PHRASES,
  ALL_MISTAKES,
  LEARN_FIRST_IDS,
  type StudyItem,
} from './data'
import {
  VocabularyItem,
  CollocationItem,
  PhrasalVerbItem,
  WritingPhraseItem,
  CommonMistakeItem,
  WritingTask,
  BandLevel,
  LearningPriority,
  TOPICS,
  BAND_COLORS,
  SUITABILITY_LABELS,
  PRIORITY_LABELS,
  PHRASE_FUNCTIONS,
} from './types'

const LS_SAVED = 'climb_wv_saved'
const LS_STATUS = 'climb_wv_status'

type StatusMap = Record<string, 'learning' | 'learned'>
type TabKey = 'vocabulary' | 'collocation' | 'phrasal_verb' | 'writing_phrase' | 'common_mistake'

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

function PriorityPill({ p }: { p: LearningPriority }) {
  const info = PRIORITY_LABELS[p]
  return (
    <span className={`text-xs font-medium ${info.color} flex items-center gap-0.5`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}

function TagList({ label, items, tone }: { label: string; items: string[]; tone: 'green' | 'blue' | 'slate' }) {
  if (items.length === 0) return null
  const cls =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'blue'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-slate-100 text-slate-600'
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(i => (
          <span key={i} className={`${cls} text-xs px-2 py-0.5 rounded`}>{i}</span>
        ))}
      </div>
    </div>
  )
}

function WritingTip({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
      <span className="font-semibold text-amber-700">Writing Tip: </span>
      {text}
    </div>
  )
}

// ─── Practice Modal ──────────────────────────────────────────────────────────

function PracticeModal({
  item,
  onClose,
}: {
  item: StudyItem
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

// ─── Study card (vocabulary / collocation / phrasal verb) ────────────────────

function StudyCard({
  item,
  saved,
  status,
  onToggleSave,
  onSetStatus,
  onPractice,
}: {
  item: StudyItem
  saved: boolean
  status: 'learning' | 'learned' | undefined
  onToggleSave: (id: string) => void
  onSetStatus: (id: string, s: 'learning' | 'learned') => void
  onPractice: (item: StudyItem) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const isVocab = item.type === 'vocabulary'
  const isColl = item.type === 'collocation'
  const isPhrasal = item.type === 'phrasal_verb'

  const vocab = isVocab ? (item as VocabularyItem) : null
  const coll = isColl ? (item as CollocationItem) : null
  const phrasal = isPhrasal ? (item as PhrasalVerbItem) : null

  const pronunciation = vocab?.pronunciation
  const partOfSpeech = vocab?.partOfSpeech ?? phrasal?.partOfSpeech
  const suitability = vocab?.writingSuitability ?? phrasal?.writingSuitability

  const collocationTags = vocab?.collocations ?? phrasal?.collocations ?? []
  const alternativeTags =
    vocab?.alternatives ?? phrasal?.academicAlternatives ?? (coll?.alternative ? [coll.alternative] : [])
  const alternativesLabel = phrasal ? 'Academic alternatives' : 'Alternatives'
  const writingTip = vocab?.writingTip ?? coll?.writingTip

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
    collocationTags.length > 0 ||
    alternativeTags.length > 0 ||
    (vocab?.wordFamily?.length ?? 0) > 0 ||
    Boolean(vocab?.antonym) ||
    Boolean(phrasal?.formalAlternative) ||
    Boolean(phrasal?.usageWarning) ||
    Boolean(writingTip)

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-slate-400 transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-slate-900">{item.term}</span>
            {LEARN_FIRST_IDS.has(item.id) && (
              <span title="Learn this first" className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-semibold">
                Learn first
              </span>
            )}
            {pronunciation && (
              <button
                onClick={speakTerm}
                title="Listen"
                className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs"
              >
                🔊 <span className="text-slate-400 font-mono text-xs">{pronunciation}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {partOfSpeech && <span className="text-xs text-slate-400 italic">{partOfSpeech}</span>}
            {coll && <span className="text-xs text-slate-400 italic">{coll.collocationType}</span>}
            {vocab?.cefrLevel && (
              <span className="text-xs text-slate-400 font-mono">{vocab.cefrLevel}</span>
            )}
          </div>
        </div>

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
      <div className="flex flex-wrap items-center gap-1.5">
        <BandPill band={item.bandLevel} />
        <TopicPill topic={item.topic} />
        <TaskPill task={item.task} />
        {suitability && <SuitabilityBadge s={suitability} />}
        <PriorityPill p={item.priority} />
      </div>

      <p className="text-slate-700 text-sm">{item.definition}</p>
      <p className="text-slate-500 text-sm italic">{item.vietnameseMeaning}</p>

      <div className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3 border-l-2 border-emerald-500">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-0.5">Example</span>
        {item.example}
      </div>

      {hasExtra && (
        <>
          {expanded && (
            <div className="space-y-3">
              <TagList label="Collocations" items={collocationTags} tone="green" />
              <TagList label={alternativesLabel} items={alternativeTags} tone="blue" />
              {vocab?.wordFamily && <TagList label="Word family" items={vocab.wordFamily} tone="slate" />}

              {vocab?.antonym && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Opposite: </span>
                  {vocab.antonym}
                </p>
              )}

              {phrasal?.formalAlternative && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Formal alternative: </span>
                  {phrasal.formalAlternative}
                </p>
              )}

              {phrasal?.usageWarning && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  <span className="font-semibold text-red-700">Usage warning: </span>
                  {phrasal.usageWarning}
                </div>
              )}

              {writingTip && <WritingTip text={writingTip} />}
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

// ─── Writing phrase card ─────────────────────────────────────────────────────

function PhraseCard({
  item,
  saved,
  onToggleSave,
}: {
  item: WritingPhraseItem
  saved: boolean
  onToggleSave: (id: string) => void
}) {
  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-slate-400 transition-all">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-semibold text-slate-900 leading-snug flex-1">{item.term}</p>
        <button
          onClick={() => onToggleSave(item.id)}
          title={saved ? 'Unsave' : 'Save'}
          className={`p-1.5 rounded-lg shrink-0 transition-colors ${saved ? 'text-red-500 hover:text-red-700' : 'text-slate-300 hover:text-red-400'}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700">{item.function}</span>
        <BandPill band={item.bandLevel} />
        <TopicPill topic={item.topic} />
        <TaskPill task={item.task} />
        <PriorityPill p={item.priority} />
      </div>

      <p className="text-slate-500 text-sm italic">{item.vietnameseMeaning}</p>

      <div className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3 border-l-2 border-indigo-500">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-0.5">In an essay</span>
        {item.example}
      </div>
    </div>
  )
}

// ─── Common mistake card ─────────────────────────────────────────────────────

function MistakeCard({ item }: { item: CommonMistakeItem }) {
  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-slate-400 transition-all">
      <div className="flex flex-wrap items-center gap-1.5">
        <TopicPill topic={item.topic} />
        <PriorityPill p={item.priority} />
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <span className="text-red-600 text-xs font-semibold uppercase tracking-wide block mb-0.5">✗ Incorrect</span>
        <p className="text-sm text-red-900 line-through decoration-red-300">{item.incorrect}</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <span className="text-emerald-600 text-xs font-semibold uppercase tracking-wide block mb-0.5">✓ Correct</span>
        <p className="text-sm text-emerald-900">{item.correct}</p>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed">{item.explanation}</p>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

const FREE_TOPICS = ['Environment', 'Education', 'Health']

export default function WritingVocabClient({ userId, planSlug }: { userId: string; planSlug: string }) {
  const isFree = planSlug === 'free'
  const isTopicLocked = (topic: string) => isFree && topic !== 'All Topics' && !FREE_TOPICS.includes(topic)
  const [activeTab, setActiveTab] = useState<TabKey>('vocabulary')
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('All Topics')
  const [bandFilter, setBandFilter] = useState<BandLevel | 'all'>('all')
  const [taskFilter, setTaskFilter] = useState<WritingTask | 'all'>('all')
  const [functionFilter, setFunctionFilter] = useState<string>('All Functions')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [statusMap, setStatusMap] = useState<StatusMap>({})
  const [practiceItem, setPracticeItem] = useState<StudyItem | null>(null)
  const [hydrated, setHydrated] = useState(false)

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
    try { localStorage.setItem(LS_SAVED, JSON.stringify([...next])) } catch { /* ignore */ }
  }, [])

  const persistStatus = useCallback((next: StatusMap) => {
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

  const matchesShared = useCallback(
    (topic: string, band: BandLevel, task: WritingTask) => {
      if (isFree && !FREE_TOPICS.includes(topic)) return false
      if (topicFilter !== 'All Topics' && topic !== topicFilter) return false
      if (bandFilter !== 'all' && band !== bandFilter) return false
      if (taskFilter !== 'all' && task !== taskFilter && task !== 'both') return false
      return true
    },
    [isFree, topicFilter, bandFilter, taskFilter]
  )

  const filteredStudy = useMemo(() => {
    const source: StudyItem[] =
      activeTab === 'vocabulary'
        ? ALL_VOCABULARY
        : activeTab === 'collocation'
        ? ALL_COLLOCATIONS
        : ALL_PHRASAL_VERBS

    return source.filter(item => {
      if (!matchesShared(item.topic, item.bandLevel, item.task)) return false
      if (!q) return true
      const extras =
        item.type === 'vocabulary'
          ? [...(item.collocations ?? []), ...(item.alternatives ?? []), ...(item.wordFamily ?? [])]
          : item.type === 'phrasal_verb'
          ? [...(item.collocations ?? []), ...(item.academicAlternatives ?? [])]
          : item.alternative
          ? [item.alternative]
          : []
      const hay = [item.term, item.definition, item.vietnameseMeaning, item.topic, item.example, ...extras]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [activeTab, matchesShared, q])

  const filteredPhrases = useMemo(() => {
    return ALL_WRITING_PHRASES.filter(item => {
      if (!matchesShared(item.topic, item.bandLevel, item.task)) return false
      if (functionFilter !== 'All Functions' && item.function !== functionFilter) return false
      if (!q) return true
      const hay = [item.term, item.function, item.vietnameseMeaning, item.topic, item.example]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [matchesShared, functionFilter, q])

  const filteredMistakes = useMemo(() => {
    return ALL_MISTAKES.filter(item => {
      if (isFree && !FREE_TOPICS.includes(item.topic)) return false
      if (topicFilter !== 'All Topics' && item.topic !== topicFilter) return false
      if (!q) return true
      const hay = [item.incorrect, item.correct, item.explanation, item.topic].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [isFree, topicFilter, q])

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'vocabulary', label: 'Vocabulary', count: ALL_VOCABULARY.length },
    { key: 'collocation', label: 'Collocations', count: ALL_COLLOCATIONS.length },
    { key: 'phrasal_verb', label: 'Phrasal Verbs', count: ALL_PHRASAL_VERBS.length },
    { key: 'writing_phrase', label: 'Writing Phrases', count: ALL_WRITING_PHRASES.length },
    { key: 'common_mistake', label: 'Common Mistakes', count: ALL_MISTAKES.length },
  ]

  const bands: (BandLevel | 'all')[] = ['all', '5-6', '6-7', '7+']
  const taskOptions: { v: WritingTask | 'all'; label: string }[] = [
    { v: 'all', label: 'All Tasks' },
    { v: 'task1', label: 'Task 1' },
    { v: 'task2', label: 'Task 2' },
  ]

  const isStudyTab =
    activeTab === 'vocabulary' || activeTab === 'collocation' || activeTab === 'phrasal_verb'
  const isPhraseTab = activeTab === 'writing_phrase'
  const isMistakeTab = activeTab === 'common_mistake'

  const resultCount = isStudyTab
    ? filteredStudy.length
    : isPhraseTab
    ? filteredPhrases.length
    : filteredMistakes.length

  const clearFilters = () => {
    setSearch('')
    setTopicFilter('All Topics')
    setBandFilter('all')
    setTaskFilter('all')
    setFunctionFilter('All Functions')
  }

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
              18 IELTS topics: vocabulary, collocations, phrasal verbs, writing phrases and common mistakes.
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tabs.map(t => (
            <div key={t.key} className="bg-white rounded-xl border-2 border-emerald-600 p-3 text-center">
              <p className="text-2xl font-black text-slate-900">{t.count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 bg-white border-2 border-slate-300 rounded-xl p-1.5 overflow-x-auto shadow-sm">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 whitespace-nowrap text-sm font-semibold py-2 px-3 rounded-lg transition-all border-2 ${
                activeTab === t.key
                  ? 'bg-white text-emerald-700 border-emerald-600 shadow-sm'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-200'
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
            {TOPICS.map(t => {
              const locked = isTopicLocked(t)
              return (
                <button
                  key={t}
                  onClick={() => setTopicFilter(t)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                    topicFilter === t
                      ? locked
                        ? 'bg-slate-200 text-slate-500 border border-slate-300'
                        : 'bg-emerald-600 text-white'
                      : locked
                      ? 'bg-white border border-slate-100 text-slate-400'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {locked && <span className="text-[10px]">🔒</span>}
                  {t}
                </button>
              )
            })}
          </div>

          {/* Function filter (writing phrases only) */}
          {isPhraseTab && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {PHRASE_FUNCTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setFunctionFilter(f)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                    functionFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Band + Task filters */}
          {!isMistakeTab && (
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
                {taskOptions.map(t => (
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
          )}
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
            placeholder="Search term, definition, Vietnamese meaning, example..."
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
          {resultCount} item{resultCount !== 1 ? 's' : ''} found
          {q ? ` for "${search}"` : ''}
        </p>

        {/* Free tier upgrade banner */}
        {isFree && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-lg">🔒</span>
            <p className="text-sm text-amber-800 flex-1">
              Upgrade to unlock <strong>15 more topics</strong> and get full access to all vocabulary.
            </p>
            <Link
              href="/subscription"
              className="shrink-0 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Upgrade now
            </Link>
          </div>
        )}

        {/* Card grid */}
        {isTopicLocked(topicFilter) ? (
          <div className="bg-white rounded-xl border-2 border-slate-200 py-16 px-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
            <p className="font-bold text-slate-800 text-lg mb-1">{topicFilter} is locked</p>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Upgrade to unlock all 18 IELTS topics and get full access to vocabulary, collocations, phrasal verbs, writing phrases, and common mistakes.
            </p>
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Upgrade to unlock all topics
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ) : resultCount === 0 ? (
          <div className="bg-white rounded-xl border-2 border-slate-300 py-16 text-center shadow-sm">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-slate-700">No items found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isStudyTab &&
              filteredStudy.map(item => (
                <StudyCard
                  key={item.id}
                  item={item}
                  saved={savedIds.has(item.id)}
                  status={statusMap[item.id]}
                  onToggleSave={toggleSave}
                  onSetStatus={setStatus}
                  onPractice={setPracticeItem}
                />
              ))}

            {isPhraseTab &&
              filteredPhrases.map(item => (
                <PhraseCard
                  key={item.id}
                  item={item}
                  saved={savedIds.has(item.id)}
                  onToggleSave={toggleSave}
                />
              ))}

            {isMistakeTab && filteredMistakes.map(item => <MistakeCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Suppress unused userId warning — kept for potential future personalisation */}
      <span data-user={userId} className="hidden" />
    </>
  )
}
