'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ALL_ITEMS, ALL_WRITING_PHRASES, type StudyItem } from '../data'
import {
  VocabularyItem,
  CollocationItem,
  PhrasalVerbItem,
  WritingPhraseItem,
  BAND_COLORS,
  SUITABILITY_LABELS,
  BandLevel,
} from '../types'

const LS_SAVED = 'climb_wv_saved'
const LS_STATUS = 'climb_wv_status'

type StatusMap = Record<string, 'learning' | 'learned'>
type SavedTab = 'all' | 'vocabulary' | 'collocation' | 'phrasal_verb' | 'writing_phrase'
type SavedEntry = StudyItem | WritingPhraseItem

function BandPill({ band }: { band: BandLevel }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BAND_COLORS[band]}`}>Band {band}</span>
}

function StatusPill({ status }: { status: 'learning' | 'learned' }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      status === 'learned' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
    }`}>
      {status === 'learned' ? '✓ Learned' : '⟳ Learning'}
    </span>
  )
}

function SavedCard({
  item,
  status,
  onUnsave,
}: {
  item: SavedEntry
  status: 'learning' | 'learned' | undefined
  onUnsave: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const vocab = item.type === 'vocabulary' ? (item as VocabularyItem) : null
  const coll = item.type === 'collocation' ? (item as CollocationItem) : null
  const phrasal = item.type === 'phrasal_verb' ? (item as PhrasalVerbItem) : null
  const phrase = item.type === 'writing_phrase' ? (item as WritingPhraseItem) : null

  const suitability = vocab?.writingSuitability ?? phrasal?.writingSuitability
  const suitabilityInfo = suitability ? SUITABILITY_LABELS[suitability] : null
  const partOfSpeech = vocab?.partOfSpeech ?? phrasal?.partOfSpeech
  const pronunciation = vocab?.pronunciation

  const collocationTags = vocab?.collocations ?? phrasal?.collocations ?? []
  const alternativeTags =
    vocab?.alternatives ?? phrasal?.academicAlternatives ?? (coll?.alternative ? [coll.alternative] : [])

  const writingTip = vocab?.writingTip ?? coll?.writingTip

  const speakTerm = () => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(item.term)
        utt.lang = 'en-GB'
        window.speechSynthesis.speak(utt)
      }
    } catch { /* ignore */ }
  }

  const hasExtra =
    collocationTags.length > 0 ||
    alternativeTags.length > 0 ||
    (vocab?.wordFamily?.length ?? 0) > 0 ||
    Boolean(phrasal?.usageWarning) ||
    Boolean(writingTip)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-slate-900 ${phrase ? 'text-base leading-snug' : 'text-lg'}`}>{item.term}</span>
            {pronunciation && (
              <button onClick={speakTerm} title="Listen" className="text-slate-400 hover:text-emerald-600 transition-colors text-xs flex items-center gap-1">
                🔊 <span className="font-mono text-slate-400">{pronunciation}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {partOfSpeech && <span className="text-xs text-slate-400 italic">{partOfSpeech}</span>}
            {coll && <span className="text-xs text-slate-400 italic">{coll.collocationType}</span>}
          </div>
        </div>
        <button
          onClick={() => onUnsave(item.id)}
          title="Remove from saved"
          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {phrase && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700">{phrase.function}</span>
        )}
        <BandPill band={item.bandLevel} />
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.topic}</span>
        {suitabilityInfo && (
          <span className={`text-xs font-medium ${suitabilityInfo.color} flex items-center gap-0.5`}>
            <span>{suitabilityInfo.icon}</span><span>{suitabilityInfo.label}</span>
          </span>
        )}
        {status && <StatusPill status={status} />}
      </div>

      {!phrase && <p className="text-slate-700 text-sm">{(item as StudyItem).definition}</p>}
      <p className="text-slate-500 text-sm italic">{item.vietnameseMeaning}</p>

      <div className={`text-slate-700 text-sm bg-slate-50 rounded-lg p-3 border-l-2 ${phrase ? 'border-indigo-500' : 'border-emerald-500'}`}>
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-0.5">
          {phrase ? 'In an essay' : 'Example'}
        </span>
        {item.example}
      </div>

      {hasExtra && (
        <>
          {expanded && (
            <div className="space-y-3">
              {collocationTags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Collocations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {collocationTags.map(c => (
                      <span key={c} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {alternativeTags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    {phrasal ? 'Academic alternatives' : 'Alternatives'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {alternativeTags.map(a => (
                      <span key={a} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {vocab?.wordFamily && vocab.wordFamily.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Word family</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vocab.wordFamily.map(w => (
                      <span key={w} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{w}</span>
                    ))}
                  </div>
                </div>
              )}
              {phrasal?.usageWarning && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  <span className="font-semibold text-red-700">Usage warning: </span>
                  {phrasal.usageWarning}
                </div>
              )}
              {writingTip && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <span className="font-semibold text-amber-700">Writing Tip: </span>
                  {writingTip}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium text-left"
          >
            {expanded ? '▲ Show less' : '▼ See more'}
          </button>
        </>
      )}
    </div>
  )
}

export default function SavedVocabPage() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [statusMap, setStatusMap] = useState<StatusMap>({})
  const [activeTab, setActiveTab] = useState<SavedTab>('all')
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

  const unsave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      try { localStorage.setItem(LS_SAVED, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  const savedItems = useMemo<SavedEntry[]>(
    () => [...ALL_ITEMS, ...ALL_WRITING_PHRASES].filter(item => savedIds.has(item.id)),
    [savedIds]
  )

  const filtered = useMemo(
    () => (activeTab === 'all' ? savedItems : savedItems.filter(i => i.type === activeTab)),
    [savedItems, activeTab]
  )

  const counts = useMemo(() => ({
    all: savedItems.length,
    vocabulary: savedItems.filter(i => i.type === 'vocabulary').length,
    collocation: savedItems.filter(i => i.type === 'collocation').length,
    phrasal_verb: savedItems.filter(i => i.type === 'phrasal_verb').length,
    writing_phrase: savedItems.filter(i => i.type === 'writing_phrase').length,
  }), [savedItems])

  const tabs: { type: SavedTab; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'vocabulary', label: 'Vocabulary' },
    { type: 'collocation', label: 'Collocations' },
    { type: 'phrasal_verb', label: 'Phrasal Verbs' },
    { type: 'writing_phrase', label: 'Writing Phrases' },
  ]

  if (!hydrated) return null

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/vocabulary/writing" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Writing Vocabulary
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Writing Vocabulary</h1>
          <p className="text-slate-400 text-sm mt-1">Items you have saved for review.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total saved', value: counts.all, color: 'text-slate-900' },
          { label: 'Vocabulary', value: counts.vocabulary, color: 'text-emerald-600' },
          { label: 'Collocations', value: counts.collocation, color: 'text-blue-600' },
          { label: 'Phrasal verbs', value: counts.phrasal_verb, color: 'text-purple-600' },
          { label: 'Writing phrases', value: counts.writing_phrase, color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.type}
            onClick={() => setActiveTab(t.type)}
            className={`flex-1 whitespace-nowrap text-sm font-semibold py-1.5 px-3 rounded-lg transition-all ${
              activeTab === t.type
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            <span className="ml-1 text-xs text-slate-400">({counts[t.type]})</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <p className="text-4xl mb-3">💾</p>
          <p className="font-semibold text-slate-700">
            {savedItems.length === 0 ? 'No saved items yet' : 'No items in this category'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {savedItems.length === 0
              ? 'Head back to Writing Vocabulary and save items you want to review.'
              : 'Try switching to a different tab.'}
          </p>
          <Link
            href="/vocabulary/writing"
            className="mt-4 inline-block text-sm text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Browse Writing Vocabulary
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <SavedCard
              key={item.id}
              item={item}
              status={statusMap[item.id]}
              onUnsave={unsave}
            />
          ))}
        </div>
      )}
    </div>
  )
}
