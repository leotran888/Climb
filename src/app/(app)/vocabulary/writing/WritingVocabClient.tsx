'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
  SUITABILITY_LABELS,
  PRIORITY_LABELS,
  PHRASE_FUNCTIONS,
} from './types'

const LS_SAVED  = 'climb_wv_saved'
const LS_STATUS = 'climb_wv_status'

type StatusMap = Record<string, 'learning' | 'learned'>
type TabKey    = 'vocabulary' | 'collocation' | 'phrasal_verb' | 'writing_phrase' | 'common_mistake'

// ─── Design tokens ────────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: '#fff',
  border: '1.5px solid rgba(22,163,68,.13)',
  borderRadius: 20,
}
const STAT_CARD: React.CSSProperties = {
  background: '#fff',
  border: '1.5px solid rgba(22,163,68,.13)',
  borderRadius: 16,
  padding: '16px 18px',
}

// ─── Folder accent colors (matches VocabFoldersClient) ───────────────────────
const FOLDER_ACCENT: Record<string, string> = {
  green:  '#16a344',
  amber:  '#d4900a',
  blue:   '#4444cc',
  pink:   '#cc3366',
  purple: '#7a3ccc',
}

// ─── Save-to-folder button ────────────────────────────────────────────────────

function FolderSaveButton({
  term, definition, example, userId, initialSaved,
}: {
  term: string
  definition: string | null
  example: string | null
  userId: string
  initialSaved: boolean
}) {
  const btnRef     = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open,     setOpen]    = useState(false)
  const [pos,      setPos]     = useState({ top: 0, right: 0 })
  const [folders,  setFolders] = useState<Array<{ id: string; name: string; color: string }> | null>(null)
  const [savedIn,  setSavedIn] = useState<Set<string>>(new Set())
  const [hasSaved, setHasSaved] = useState(initialSaved)
  const [saving,   setSaving]  = useState<string | null>(null)
  const [newName,  setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { setHasSaved(initialSaved) }, [initialSaved])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        btnRef.current    && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    function onScroll() { setOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  async function loadFolders() {
    const supabase = createClient()
    const { data: fs } = await supabase
      .from('vocab_folders').select('id, name, color')
      .eq('user_id', userId).order('created_at', { ascending: false })
    const list = fs ?? []
    setFolders(list)
    if (list.length > 0) {
      const { data: existing } = await supabase
        .from('vocab_words').select('folder_id')
        .eq('user_id', userId).eq('word', term)
        .in('folder_id', list.map(f => f.id))
      setSavedIn(new Set((existing ?? []).map((w: { folder_id: string }) => w.folder_id)))
    }
  }

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
    }
    setOpen(true)
    if (folders === null) loadFolders()
  }

  async function toggleFolder(folderId: string) {
    if (saving) return
    setSaving(folderId)
    const supabase = createClient()
    if (savedIn.has(folderId)) {
      await supabase.from('vocab_words')
        .delete()
        .eq('user_id', userId).eq('folder_id', folderId).eq('word', term)
      setSavedIn(prev => { const n = new Set(prev); n.delete(folderId); return n })
      setHasSaved(savedIn.size > 1)
    } else {
      await supabase.from('vocab_words').insert({
        user_id: userId, folder_id: folderId,
        word: term, definition: definition || null, example: example || null,
      })
      setSavedIn(prev => new Set([...prev, folderId]))
      setHasSaved(true)
    }
    setSaving(null)
  }

  async function createAndSave() {
    if (!newName.trim() || creating) return
    setCreating(true)
    const supabase = createClient()
    const { data: nf } = await supabase
      .from('vocab_folders')
      .insert({ user_id: userId, name: newName.trim(), color: 'green' })
      .select('id, name, color').single()
    if (nf) {
      setFolders(prev => prev ? [nf, ...prev] : [nf])
      await toggleFolder(nf.id)
    }
    setNewName('')
    setCreating(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        title="Lưu vào thư mục"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0, flexShrink: 0, color: hasSaved ? '#16a344' : '#b0c4b8', transition: 'color .15s' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={hasSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {open && createPortal(
        <div ref={popoverRef} style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999, background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 16, boxShadow: '0 8px 32px rgba(22,163,68,.15)', minWidth: 220, maxHeight: 300, overflowY: 'auto', paddingBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', padding: '10px 14px 6px' }}>Lưu vào thư mục</p>

            {folders === null ? (
              <p style={{ fontSize: 13, color: '#5a7864', padding: '6px 14px', fontWeight: 600 }}>Đang tải…</p>
            ) : folders.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5a7864', padding: '4px 14px 8px', fontWeight: 600 }}>Chưa có thư mục nào</p>
            ) : (
              folders.map(f => {
                const isSaved  = savedIn.has(f.id)
                const isSaving = saving === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFolder(f.id)}
                    disabled={isSaving}
                    title={isSaved ? 'Bỏ lưu khỏi thư mục này' : 'Lưu vào thư mục này'}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: isSaved ? '#16a344' : '#192e1e', cursor: isSaving ? 'not-allowed' : 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: FOLDER_ACCENT[f.color] ?? '#16a344', flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    {isSaving
                      ? <span style={{ fontSize: 11, color: '#5a7864' }}>…</span>
                      : isSaved
                      ? <span style={{ fontSize: 12, color: '#16a344', fontWeight: 900 }}>✓</span>
                      : <span style={{ fontSize: 12, color: '#b0c4b8' }}>+</span>}
                  </button>
                )
              })
            )}

            <div style={{ height: 1, background: 'rgba(22,163,68,.1)', margin: '4px 0' }} />
            <div style={{ padding: '4px 10px 2px', display: 'flex', gap: 6 }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createAndSave()}
                placeholder="Thư mục mới…"
                style={{ flex: 1, border: '1.5px solid rgba(22,163,68,.2)', borderRadius: 8, padding: '5px 8px', fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#192e1e' }}
              />
              <button
                onClick={createAndSave}
                disabled={!newName.trim() || creating}
                style={{ background: '#16a344', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 800, cursor: newName.trim() && !creating ? 'pointer' : 'not-allowed', opacity: (!newName.trim() || creating) ? .5 : 1, fontFamily: 'inherit', flexShrink: 0 }}
              >
                {creating ? '…' : 'Tạo'}
              </button>
            </div>
        </div>,
        document.body,
      )}
    </>
  )
}

// ─── Tag helpers ──────────────────────────────────────────────────────────────

function BandPill({ band }: { band: BandLevel }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: 'rgba(22,163,68,.08)', color: '#0f7a33' }}>
      Band {band}
    </span>
  )
}

function TopicPill({ topic }: { topic: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: 'rgba(22,163,68,.06)', color: '#5a7864', border: '1.5px solid rgba(22,163,68,.13)' }}>
      {topic}
    </span>
  )
}

function TaskPill({ task }: { task: WritingTask }) {
  const label = task === 'both' ? 'Task 1 & 2' : task === 'task1' ? 'Task 1' : 'Task 2'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: 'rgba(80,80,220,.07)', color: '#4444cc' }}>
      {label}
    </span>
  )
}

function SuitabilityBadge({ s }: { s: VocabularyItem['writingSuitability'] }) {
  const info = SUITABILITY_LABELS[s]
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a344', display: 'flex', alignItems: 'center', gap: 2 }}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}

function PriorityPill({ p }: { p: LearningPriority }) {
  const info = PRIORITY_LABELS[p]
  const isMust = p === 'must_learn'
  return (
    <span style={{ fontSize: 11, fontWeight: 800, color: isMust ? '#e05555' : '#5a7864', display: 'flex', alignItems: 'center', gap: 3 }}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}

function TagList({ label, items, tone }: { label: string; items: string[]; tone: 'green' | 'blue' | 'slate' }) {
  if (items.length === 0) return null
  const tagStyle: React.CSSProperties =
    tone === 'green'
      ? { background: 'rgba(22,163,68,.08)', color: '#0f7a33' }
      : tone === 'blue'
      ? { background: 'rgba(80,80,220,.07)', color: '#4444cc' }
      : { background: 'rgba(22,163,68,.06)', color: '#5a7864', border: '1px solid rgba(22,163,68,.13)' }
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {items.map(i => (
          <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50, ...tagStyle }}>{i}</span>
        ))}
      </div>
    </div>
  )
}

function WritingTip({ text }: { text: string }) {
  return (
    <div style={{ background: 'rgba(245,170,0,.08)', border: '1.5px solid rgba(245,170,0,.25)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#8a6100', lineHeight: 1.5 }}>
      <span style={{ fontWeight: 800, color: '#b87d00' }}>Writing Tip: </span>
      {text}
    </div>
  )
}

// ─── Practice Modal ───────────────────────────────────────────────────────────

function PracticeModal({ item, onClose }: { item: StudyItem; onClose: () => void }) {
  const [sentence, setSentence] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = useCallback(async () => {
    if (!sentence.trim()) return
    setLoading(true)
    setFeedback('')
    try {
      const res  = await fetch('/api/vocabulary/practice', {
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.4)' }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,.18)', width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(22,163,68,.1)' }}>
          <h2 style={{ fontWeight: 900, color: '#192e1e', fontSize: 15 }}>
            Practice: <span style={{ color: '#16a344' }}>{item.term}</span>
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a7864', lineHeight: 0, padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, color: '#5a7864', fontWeight: 600 }}>
            Write an IELTS-style sentence using <strong style={{ color: '#192e1e' }}>&ldquo;{item.term}&rdquo;</strong>.
          </p>
          <div style={{ background: 'rgba(22,163,68,.04)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#3a5540', borderLeft: '2px solid rgba(22,163,68,.25)' }}>
            <span style={{ fontWeight: 700, color: '#5a7864' }}>Definition: </span>{item.definition}
          </div>
          <textarea
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            placeholder="Write your sentence here..."
            rows={3}
            style={{ width: '100%', border: '1.5px solid rgba(22,163,68,.2)', borderRadius: 12, padding: 12, fontSize: 14, fontFamily: 'inherit', color: '#192e1e', outline: 'none', resize: 'none' }}
          />
          <button
            onClick={submit}
            disabled={loading || !sentence.trim()}
            style={{ width: '100%', background: '#16a344', color: '#fff', border: 'none', borderRadius: 12, padding: 12, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: loading || !sentence.trim() ? 'not-allowed' : 'pointer', opacity: (loading || !sentence.trim()) ? .5 : 1 }}
          >
            {loading ? 'Getting feedback...' : 'Get AI Feedback'}
          </button>
          {feedback && (
            <div style={{ background: 'rgba(22,163,68,.06)', border: '1.5px solid rgba(22,163,68,.2)', borderRadius: 12, padding: 16, fontSize: 13, color: '#3a5540', lineHeight: 1.6 }}>
              <p style={{ fontWeight: 800, color: '#16a344', marginBottom: 4 }}>Feedback</p>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Study card ───────────────────────────────────────────────────────────────

function StudyCard({
  item, saved, status, onToggleSave, onSetStatus, onPractice, userId, initialFolderSaved,
}: {
  item: StudyItem
  saved: boolean
  status: 'learning' | 'learned' | undefined
  onToggleSave: (id: string) => void
  onSetStatus: (id: string, s: 'learning' | 'learned') => void
  onPractice: (item: StudyItem) => void
  userId: string
  initialFolderSaved: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const isVocab   = item.type === 'vocabulary'
  const isColl    = item.type === 'collocation'
  const isPhrasal = item.type === 'phrasal_verb'

  const vocab   = isVocab   ? (item as VocabularyItem)  : null
  const coll    = isColl    ? (item as CollocationItem)  : null
  const phrasal = isPhrasal ? (item as PhrasalVerbItem)  : null

  const pronunciation = vocab?.pronunciation
  const partOfSpeech  = vocab?.partOfSpeech ?? phrasal?.partOfSpeech
  const suitability   = vocab?.writingSuitability ?? phrasal?.writingSuitability

  const collocationTags = vocab?.collocations ?? phrasal?.collocations ?? []
  const alternativeTags = vocab?.alternatives ?? phrasal?.academicAlternatives ?? (coll?.alternative ? [coll.alternative] : [])
  const alternativesLabel = phrasal ? 'Academic alternatives' : 'Alternatives'
  const writingTip = vocab?.writingTip ?? coll?.writingTip

  const speakTerm = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(item.term)
        utt.lang = 'en-GB'
        window.speechSynthesis.speak(utt)
      }
    } catch { /* ignore */ }
  }, [item.term])

  const hasExtra =
    collocationTags.length > 0 || alternativeTags.length > 0 ||
    (vocab?.wordFamily?.length ?? 0) > 0 || Boolean(vocab?.antonym) ||
    Boolean(phrasal?.formalAlternative) || Boolean(phrasal?.usageWarning) || Boolean(writingTip)

  const isMustLearn = LEARN_FIRST_IDS.has(item.id)

  return (
    <div className="wv-card" style={{ ...CARD, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#192e1e' }}>{item.term}</div>
          {(pronunciation || partOfSpeech || vocab?.cefrLevel || coll?.collocationType) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
              {pronunciation && (
                <button onClick={speakTerm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a7864', lineHeight: 0, padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                  <span style={{ fontSize: 11, color: '#5a7864', fontWeight: 600 }}>{pronunciation}</span>
                </button>
              )}
              {partOfSpeech && <span style={{ fontSize: 11, fontStyle: 'italic', color: '#5a7864', fontWeight: 600 }}>{partOfSpeech}</span>}
              {coll?.collocationType && <span style={{ fontSize: 11, fontStyle: 'italic', color: '#5a7864', fontWeight: 600 }}>{coll.collocationType}</span>}
              {vocab?.cefrLevel && (
                <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 50, background: 'rgba(22,163,68,.1)', color: '#0f7a33' }}>
                  {vocab.cefrLevel}
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <FolderSaveButton term={item.term} definition={item.definition} example={item.example} userId={userId} initialSaved={initialFolderSaved} />
          <button
            onClick={() => onToggleSave(item.id)}
            title={saved ? 'Unsave' : 'Save'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2, flexShrink: 0, color: saved ? '#e05555' : '#b0c4b8', transition: 'color .15s' }}
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {/* Tag row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        <BandPill band={item.bandLevel} />
        <TopicPill topic={item.topic} />
        <TaskPill task={item.task} />
        {suitability && <SuitabilityBadge s={suitability} />}
        <PriorityPill p={item.priority} />
        {isMustLearn && (
          <span style={{ fontSize: 11, fontWeight: 800, color: '#e05555', display: 'flex', alignItems: 'center', gap: 2 }}>🔥 Must Learn</span>
        )}
      </div>

      {/* Definition */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#3a5540', lineHeight: 1.5 }}>{item.definition}</div>
      <div style={{ fontSize: 12, fontStyle: 'italic', color: '#5a7864', lineHeight: 1.4 }}>{item.vietnameseMeaning}</div>

      {/* Example */}
      <div style={{ fontSize: 13, color: '#3a5540', background: 'rgba(22,163,68,.04)', borderRadius: 10, padding: '10px 14px', borderLeft: '2px solid rgba(22,163,68,.25)', lineHeight: 1.5 }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', display: 'block', marginBottom: 3 }}>Example</span>
        {item.example}
      </div>

      {/* Expandable extras */}
      {hasExtra && (
        <>
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TagList label="Collocations" items={collocationTags} tone="green" />
              <TagList label={alternativesLabel} items={alternativeTags} tone="blue" />
              {vocab?.wordFamily && <TagList label="Word family" items={vocab.wordFamily} tone="slate" />}
              {vocab?.antonym && (
                <p style={{ fontSize: 13, color: '#5a7864' }}>
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 4 }}>Opposite:</span>
                  {vocab.antonym}
                </p>
              )}
              {phrasal?.formalAlternative && (
                <p style={{ fontSize: 13, color: '#5a7864' }}>
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 4 }}>Formal alternative:</span>
                  {phrasal.formalAlternative}
                </p>
              )}
              {phrasal?.usageWarning && (
                <div style={{ background: 'rgba(220,60,60,.06)', border: '1.5px solid rgba(220,60,60,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#8b1a1a' }}>
                  <span style={{ fontWeight: 800, color: '#cc3333' }}>Usage warning: </span>
                  {phrasal.usageWarning}
                </div>
              )}
              {writingTip && <WritingTip text={writingTip} />}
            </div>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ fontSize: 12, color: '#16a344', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}
          >
            {expanded ? '▲ Show less' : '▼ See more'}
          </button>
        </>
      )}

      {/* Divider + actions */}
      <div style={{ height: 1, background: 'rgba(22,163,68,.1)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onSetStatus(item.id, status === 'learning' ? 'learned' : 'learning')}
          style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 50, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer', border: '1.5px solid',
            ...(status === 'learned'
              ? { background: '#16a344', color: '#fff', borderColor: '#16a344' }
              : status === 'learning'
              ? { background: 'rgba(245,170,0,.1)', color: '#b87d00', borderColor: 'rgba(245,170,0,.3)' }
              : { background: 'transparent', color: '#5a7864', borderColor: 'rgba(22,163,68,.2)' }),
          }}
        >
          {status === 'learned' ? '✓ Learned' : status === 'learning' ? '⟳ Learning' : 'Mark as Learning'}
        </button>
        <button
          onClick={() => onPractice(item)}
          style={{ fontSize: 11, padding: '5px 12px', borderRadius: 50, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer', background: 'rgba(22,163,68,.08)', color: '#16a344', border: '1.5px solid rgba(22,163,68,.2)' }}
        >
          Practice ✏️
        </button>
      </div>
    </div>
  )
}

// ─── Writing phrase card ──────────────────────────────────────────────────────

function PhraseCard({
  item, saved, onToggleSave, userId, initialFolderSaved,
}: {
  item: WritingPhraseItem
  saved: boolean
  onToggleSave: (id: string) => void
  userId: string
  initialFolderSaved: boolean
}) {
  return (
    <div className="wv-card" style={{ ...CARD, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#192e1e', lineHeight: 1.4, flex: 1 }}>{item.term}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <FolderSaveButton term={item.term} definition={item.vietnameseMeaning} example={item.example} userId={userId} initialSaved={initialFolderSaved} />
          <button
            onClick={() => onToggleSave(item.id)}
            title={saved ? 'Unsave' : 'Save'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2, flexShrink: 0, color: saved ? '#e05555' : '#b0c4b8', transition: 'color .15s' }}
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: 'rgba(80,80,200,.07)', color: '#5050c8' }}>{item.function}</span>
        <BandPill band={item.bandLevel} />
        <TopicPill topic={item.topic} />
        <TaskPill task={item.task} />
        <PriorityPill p={item.priority} />
      </div>

      <div style={{ fontSize: 12, fontStyle: 'italic', color: '#5a7864' }}>{item.vietnameseMeaning}</div>

      <div style={{ fontSize: 13, color: '#3a5540', background: 'rgba(80,80,200,.04)', borderRadius: 10, padding: '10px 14px', borderLeft: '2px solid rgba(80,80,200,.2)', lineHeight: 1.5 }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', display: 'block', marginBottom: 3 }}>In an essay</span>
        {item.example}
      </div>
    </div>
  )
}

// ─── Common mistake card ──────────────────────────────────────────────────────

function MistakeCard({ item, userId, initialFolderSaved }: { item: CommonMistakeItem; userId: string; initialFolderSaved: boolean }) {
  return (
    <div className="wv-card" style={{ ...CARD, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <TopicPill topic={item.topic} />
          <PriorityPill p={item.priority} />
        </div>
        <FolderSaveButton term={item.correct} definition={item.explanation} example={null} userId={userId} initialSaved={initialFolderSaved} />
      </div>

      <div style={{ background: 'rgba(220,60,60,.06)', border: '1.5px solid rgba(220,60,60,.2)', borderRadius: 10, padding: '10px 14px' }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#cc3333', display: 'block', marginBottom: 3 }}>✗ Incorrect</span>
        <p style={{ fontSize: 13, color: '#8b1a1a', textDecoration: 'line-through', textDecorationColor: 'rgba(220,60,60,.4)' }}>{item.incorrect}</p>
      </div>

      <div style={{ background: 'rgba(22,163,68,.06)', border: '1.5px solid rgba(22,163,68,.2)', borderRadius: 10, padding: '10px 14px' }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0f7a33', display: 'block', marginBottom: 3 }}>✓ Correct</span>
        <p style={{ fontSize: 13, color: '#1a5c2e' }}>{item.correct}</p>
      </div>

      <div style={{ fontSize: 13, color: '#5a7864', lineHeight: 1.5, fontWeight: 600 }}>{item.explanation}</div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const FREE_TOPICS = ['Environment', 'Education', 'Health']

export default function WritingVocabClient({
  userId, planSlug, hasWritingVocabFull,
}: {
  userId: string
  planSlug: string
  hasWritingVocabFull: boolean
}) {
  const isFree = !hasWritingVocabFull
  const isTopicLocked = (topic: string) => isFree && topic !== 'All Topics' && !FREE_TOPICS.includes(topic)

  const [activeTab,       setActiveTab]       = useState<TabKey>('vocabulary')
  const [search,          setSearch]           = useState('')
  const [topicFilter,     setTopicFilter]      = useState('All Topics')
  const [bandFilter,      setBandFilter]        = useState<BandLevel | 'all'>('all')
  const [taskFilter,      setTaskFilter]        = useState<WritingTask | 'all'>('all')
  const [functionFilter,  setFunctionFilter]   = useState<string>('All Functions')
  const [savedIds,        setSavedIds]         = useState<Set<string>>(new Set())
  const [statusMap,       setStatusMap]        = useState<StatusMap>({})
  const [practiceItem,    setPracticeItem]     = useState<StudyItem | null>(null)
  const [hydrated,        setHydrated]         = useState(false)
  const [savedWordSet,    setSavedWordSet]     = useState<Set<string>>(new Set())

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

  useEffect(() => {
    async function fetchSavedWords() {
      const supabase = createClient()
      const { data } = await supabase
        .from('vocab_words').select('word').eq('user_id', userId)
      if (data) setSavedWordSet(new Set(data.map((w: { word: string }) => w.word)))
    }
    fetchSavedWords()
  }, [userId])

  const persistSaved  = useCallback((next: Set<string>) => {
    try { localStorage.setItem(LS_SAVED, JSON.stringify([...next])) } catch { /* ignore */ }
  }, [])
  const persistStatus = useCallback((next: StatusMap) => {
    try { localStorage.setItem(LS_STATUS, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const toggleSave = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      persistSaved(next)
      return next
    })
  }, [persistSaved])

  const setStatus = useCallback((id: string, s: 'learning' | 'learned') => {
    setStatusMap(prev => {
      const next = { ...prev }
      if (prev[id] === s) delete next[id]; else next[id] = s
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
    [isFree, topicFilter, bandFilter, taskFilter],
  )

  const filteredStudy = useMemo(() => {
    const source: StudyItem[] =
      activeTab === 'vocabulary'   ? ALL_VOCABULARY
        : activeTab === 'collocation' ? ALL_COLLOCATIONS
        : ALL_PHRASAL_VERBS
    return source.filter(item => {
      if (!matchesShared(item.topic, item.bandLevel, item.task)) return false
      if (!q) return true
      const extras =
        item.type === 'vocabulary'   ? [...(item.collocations ?? []), ...(item.alternatives ?? []), ...(item.wordFamily ?? [])]
          : item.type === 'phrasal_verb' ? [...(item.collocations ?? []), ...(item.academicAlternatives ?? [])]
          : item.alternative ? [item.alternative] : []
      return [item.term, item.definition, item.vietnameseMeaning, item.topic, item.example, ...extras].join(' ').toLowerCase().includes(q)
    })
  }, [activeTab, matchesShared, q])

  const filteredPhrases = useMemo(() => {
    return ALL_WRITING_PHRASES.filter(item => {
      if (!matchesShared(item.topic, item.bandLevel, item.task)) return false
      if (functionFilter !== 'All Functions' && item.function !== functionFilter) return false
      if (!q) return true
      return [item.term, item.function, item.vietnameseMeaning, item.topic, item.example].join(' ').toLowerCase().includes(q)
    })
  }, [matchesShared, functionFilter, q])

  const filteredMistakes = useMemo(() => {
    return ALL_MISTAKES.filter(item => {
      if (isFree && !FREE_TOPICS.includes(item.topic)) return false
      if (topicFilter !== 'All Topics' && item.topic !== topicFilter) return false
      if (!q) return true
      return [item.incorrect, item.correct, item.explanation, item.topic].join(' ').toLowerCase().includes(q)
    })
  }, [isFree, topicFilter, q])

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'vocabulary',     label: 'Vocabulary',      count: ALL_VOCABULARY.length },
    { key: 'collocation',    label: 'Collocations',    count: ALL_COLLOCATIONS.length },
    { key: 'phrasal_verb',   label: 'Phrasal Verbs',   count: ALL_PHRASAL_VERBS.length },
    { key: 'writing_phrase', label: 'Writing Phrases', count: ALL_WRITING_PHRASES.length },
    { key: 'common_mistake', label: 'Common Mistakes', count: ALL_MISTAKES.length },
  ]

  const bands: (BandLevel | 'all')[]              = ['all', '5-6', '6-7', '7+']
  const taskOptions: { v: WritingTask | 'all'; label: string }[] = [
    { v: 'all',   label: 'All Tasks' },
    { v: 'task1', label: 'Task 1' },
    { v: 'task2', label: 'Task 2' },
  ]

  const isStudyTab   = activeTab === 'vocabulary' || activeTab === 'collocation' || activeTab === 'phrasal_verb'
  const isPhraseTab  = activeTab === 'writing_phrase'
  const isMistakeTab = activeTab === 'common_mistake'

  const resultCount = isStudyTab ? filteredStudy.length : isPhraseTab ? filteredPhrases.length : filteredMistakes.length

  const clearFilters = () => {
    setSearch(''); setTopicFilter('All Topics'); setBandFilter('all'); setTaskFilter('all'); setFunctionFilter('All Functions')
  }

  if (!hydrated) return null

  const chipBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '5px 12px', borderRadius: 50,
    fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
    border: '1.5px solid rgba(22,163,68,.13)',
    background: '#fff', color: '#5a7864',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    transition: 'all .12s',
  }
  const chipActive: React.CSSProperties = { background: '#16a344', borderColor: '#16a344', color: '#fff' }

  return (
    <>
      <style>{`
        .wv-card { transition: transform .18s, box-shadow .18s; }
        .wv-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(22,163,68,.14); }
      `}</style>

      {practiceItem && <PracticeModal item={practiceItem} onClose={() => setPracticeItem(null)} />}

      <div style={{ paddingBottom: 48 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#16a344', marginBottom: 6 }}>✦ Kho từ vựng</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#192e1e', letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 4 }}>Writing Vocabulary</h1>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#5a7864' }}>18 chủ đề IELTS: từ vựng, collocations, phrasal verbs, writing phrases và common mistakes.</p>
          </div>
          <Link
            href="/vocabulary/writing/saved"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 50, padding: '9px 18px', fontSize: 13, fontWeight: 800, color: '#192e1e', textDecoration: 'none', flexShrink: 0 }}
          >
            <span style={{ color: '#e05555', fontSize: 14 }}>♥</span>
            Saved ({savedIds.size})
          </Link>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: 12, marginBottom: 20 }}>
          {tabs.map(t => (
            <div key={t.key} style={STAT_CARD}>
              <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 5 }}>{t.label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: '#192e1e', fontVariantNumeric: 'tabular-nums' }}>{t.count}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 20, padding: 6, display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flexShrink: 0, padding: '8px 18px', borderRadius: 14, border: 'none',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
                ...(activeTab === t.key
                  ? { background: '#16a344', color: '#fff', boxShadow: '0 2px 8px rgba(22,163,68,.3)' }
                  : { background: 'transparent', color: '#5a7864' }),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters card */}
        <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 20, padding: '14px 16px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Topic row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', flexShrink: 0, minWidth: 48 }}>Topic</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
              {TOPICS.map(t => {
                const locked = isTopicLocked(t)
                const active = topicFilter === t && !locked
                return (
                  <button
                    key={t}
                    onClick={() => setTopicFilter(t)}
                    style={{ ...chipBase, ...(active ? chipActive : {}), ...(locked ? { opacity: .5 } : {}) }}
                  >
                    {locked && <span style={{ fontSize: 10 }}>🔒</span>}
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Function filter — writing phrases only */}
          {isPhraseTab && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', flexShrink: 0, minWidth: 48 }}>Function</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {PHRASE_FUNCTIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFunctionFilter(f)}
                    style={{ ...chipBase, ...(functionFilter === f ? { background: 'rgba(80,80,200,.1)', borderColor: 'rgba(80,80,200,.25)', color: '#5050c8' } : {}) }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Band + Task row */}
          {!isMistakeTab && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', minWidth: 48 }}>Band</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {bands.map(b => (
                  <button key={b} onClick={() => setBandFilter(b)} style={{ ...chipBase, ...(bandFilter === b ? chipActive : {}) }}>
                    {b === 'all' ? 'All Bands' : `Band ${b}`}
                  </button>
                ))}
              </div>
              <div style={{ width: 1, height: 20, background: 'rgba(22,163,68,.13)', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864' }}>Task</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {taskOptions.map(t => (
                  <button key={t.v} onClick={() => setTaskFilter(t.v)} style={{ ...chipBase, ...(taskFilter === t.v ? chipActive : {}) }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#5a7864', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search term, definition, Vietnamese meaning, example..."
            style={{ width: '100%', background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 14, padding: '12px 44px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#192e1e', outline: 'none' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5a7864', lineHeight: 0, padding: 4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Result count */}
        <p style={{ fontSize: 12, fontWeight: 700, color: '#5a7864', marginBottom: 14 }}>
          {resultCount} item{resultCount !== 1 ? 's' : ''} found{q ? ` for "${search}"` : ''}
        </p>

        {/* Upgrade banner */}
        {isFree && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(245,170,0,.08)', border: '1.5px solid rgba(245,170,0,.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#8a6100' }}>
              Upgrade to unlock <strong style={{ color: '#b87d00' }}>15 more topics</strong> and get full access to all vocabulary.
            </p>
            <Link
              href="/subscription"
              style={{ padding: '9px 20px', borderRadius: 50, background: '#f5aa00', color: '#5a3d00', fontFamily: 'inherit', fontSize: 12, fontWeight: 900, textDecoration: 'none', flexShrink: 0 }}
            >
              Upgrade now
            </Link>
          </div>
        )}

        {/* Card grid / locked / empty states */}
        {isTopicLocked(topicFilter) ? (
          <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(22,163,68,.06)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🔒</div>
            <p style={{ fontWeight: 900, color: '#192e1e', fontSize: 17, marginBottom: 6 }}>{topicFilter} is locked</p>
            <p style={{ fontSize: 13, color: '#5a7864', fontWeight: 600, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Upgrade to unlock all 18 IELTS topics and get full access to vocabulary, collocations, phrasal verbs, writing phrases, and common mistakes.
            </p>
            <Link
              href="/subscription"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a344', color: '#fff', textDecoration: 'none', padding: '11px 24px', borderRadius: 50, fontWeight: 800, fontSize: 13 }}
            >
              Upgrade to unlock all topics
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ) : resultCount === 0 ? (
          <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
            <p style={{ fontWeight: 900, color: '#192e1e', fontSize: 15, marginBottom: 4 }}>No items found</p>
            <p style={{ fontSize: 13, color: '#5a7864', fontWeight: 600, marginBottom: 16 }}>Try adjusting your filters or search query.</p>
            <button
              onClick={clearFilters}
              style={{ fontSize: 13, color: '#16a344', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 14 }}>
            {isStudyTab && filteredStudy.map(item => (
              <StudyCard
                key={item.id} item={item}
                saved={savedIds.has(item.id)} status={statusMap[item.id]}
                onToggleSave={toggleSave} onSetStatus={setStatus} onPractice={setPracticeItem}
                userId={userId} initialFolderSaved={savedWordSet.has(item.term)}
              />
            ))}
            {isPhraseTab && filteredPhrases.map(item => (
              <PhraseCard key={item.id} item={item} saved={savedIds.has(item.id)} onToggleSave={toggleSave} userId={userId} initialFolderSaved={savedWordSet.has(item.term)} />
            ))}
            {isMistakeTab && filteredMistakes.map(item => <MistakeCard key={item.id} item={item} userId={userId} initialFolderSaved={savedWordSet.has(item.correct)} />)}
          </div>
        )}
      </div>

      <span data-user={userId} className="hidden" />
    </>
  )
}
