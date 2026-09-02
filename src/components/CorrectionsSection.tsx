'use client'

import { useState } from 'react'
import { Correction } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  spelling: 'Spelling',
  collocation: 'Collocation',
  punctuation: 'Punctuation',
  articles: 'Articles',
  article: 'Articles',
  prepositions: 'Prepositions',
  preposition: 'Prepositions',
  word_choice: 'Word Choice',
  tense: 'Tense',
  subject_verb_agreement: 'Subject-Verb',
}

const CATEGORY_COLORS: Record<string, string> = {
  grammar: 'bg-red-100 text-red-700',
  vocabulary: 'bg-purple-100 text-purple-700',
  spelling: 'bg-orange-100 text-orange-700',
  collocation: 'bg-blue-100 text-blue-700',
  punctuation: 'bg-slate-100 text-slate-700',
  articles: 'bg-amber-100 text-amber-700',
  article: 'bg-amber-100 text-amber-700',
  prepositions: 'bg-teal-100 text-teal-700',
  preposition: 'bg-teal-100 text-teal-700',
  word_choice: 'bg-indigo-100 text-indigo-700',
  tense: 'bg-rose-100 text-rose-700',
  subject_verb_agreement: 'bg-cyan-100 text-cyan-700',
}

function getCat(c: Correction): string {
  return (c.category ?? c.type ?? 'other').toLowerCase()
}

export default function CorrectionsSection({ corrections }: { corrections: Correction[] }) {
  const [active, setActive] = useState('all')

  const categories = Array.from(new Set(corrections.map(getCat)))

  const filtered = active === 'all'
    ? corrections
    : corrections.filter(c => getCat(c) === active)

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setActive('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            active === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({corrections.length})
        </button>
        {categories.map(cat => {
          const count = corrections.filter(c => getCat(c) === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-400 text-sm py-4">No corrections in this category.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const cat = getCat(c)
            return (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border-2 border-emerald-600">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full mb-3 inline-block ${CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-600'}`}>
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-2 mb-2">
                  <span className="text-red-600 text-sm bg-red-50 px-2 py-0.5 rounded line-through">
                    {c.original}
                  </span>
                  <span className="text-slate-400 text-sm">→</span>
                  <span className="text-emerald-700 text-sm font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    {c.correction}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.explanation}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
