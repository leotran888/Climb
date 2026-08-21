'use client'

import { useState } from 'react'

interface Props {
  submissionId: string
  existingEssay: string | null
  targetBand: number
  sectionN: number
}

export default function UpgradedEssaySection({ submissionId, existingEssay, targetBand, sectionN }: Props) {
  const [essay, setEssay] = useState<string | null>(existingEssay)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/grade/writing/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setEssay(data.upgradedEssay)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-2xl">
      <div className="pb-3 border-b border-slate-400 mb-5">
        <h2 className="text-[15px] font-bold text-slate-900">
          <span className="text-slate-400 mr-1">{sectionN}.</span>
          Upgraded Version — Targeting Band {targetBand}+
        </h2>
      </div>

      {essay ? (
        <>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-3">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
              Rewritten essay · Aim: Band {targetBand}+
            </p>
            <div className="text-slate-800 leading-8 whitespace-pre-wrap text-[15px]">
              {essay}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            This version applies all corrections, upgraded vocabulary, varied sentence structures, and improved cohesion — while preserving your original argument.
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center py-8 gap-4">
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Get a complete Band {targetBand}+ rewrite of your essay with all corrections applied and vocabulary upgraded.
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={generate}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating…
              </>
            ) : (
              <>✦ Generate Band {targetBand}+ rewrite</>
            )}
          </button>
          <p className="text-xs text-slate-400">Takes about 15–20 seconds</p>
        </div>
      )}
    </section>
  )
}
