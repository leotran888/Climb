'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function ResultPendingLoader({ submissionId }: { submissionId: string }) {
  const router   = useRouter()
  const triggered = useRef(false)
  const [elapsed, setElapsed] = useState(0)
  const [error,   setError]   = useState<string | null>(null)

  // ── Trigger Edge Function once ──────────────────────────────────────────
  useEffect(() => {
    if (triggered.current) return
    triggered.current = true

    async function triggerGrading() {
      // Read image from sessionStorage if available
      let imageData: { imageBase64: string; imageMediaType: string } | null = null
      try {
        const stored = sessionStorage.getItem(`pending_img_${submissionId}`)
        if (stored) {
          imageData = JSON.parse(stored)
          sessionStorage.removeItem(`pending_img_${submissionId}`)
        }
      } catch { /* ignore */ }

      // Get JWT from Supabase browser session
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        setError('Session expired. Please log in again.')
        return
      }

      // Call Supabase Edge Function directly (150s timeout — no Vercel limit)
      const edgeFnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/grade-writing`

      fetch(edgeFnUrl, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId,
          imageBase64:    imageData?.imageBase64    ?? null,
          imageMediaType: imageData?.imageMediaType ?? null,
        }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.error && d.error !== 'Already graded') setError(d.error)
          else router.refresh()
        })
        .catch(() => setError('Network error. Please refresh.'))
    }

    triggerGrading()
  }, [submissionId, router])

  // ── Poll status every 5s as fallback ───────────────────────────────────
  // Catches cases where Edge Function already ran (page refresh, duplicate trigger)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res  = await fetch(`/api/grade/writing/status/${submissionId}`)
        const data = await res.json()
        if (data.done) router.refresh()
      } catch { /* ignore poll errors */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [submissionId, router])

  // ── Elapsed timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const mins       = Math.floor(elapsed / 60)
  const secs       = elapsed % 60
  const elapsedStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <svg className="animate-spin w-16 h-16 text-emerald-200" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6"/>
        </svg>
        <svg className="animate-spin w-16 h-16 text-emerald-600 absolute inset-0" viewBox="0 0 64 64" fill="none" style={{ animationDuration: '1s' }}>
          <path d="M32 4a28 28 0 0 1 28 28" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="text-center">
        <p className="font-semibold text-slate-900 text-lg">Grading your essay…</p>
        <p className="text-slate-500 text-sm mt-1">AI is analysing all 4 criteria. This takes about 60 seconds.</p>
      </div>

      {/* Progress steps */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {[
          { label: 'Reading essay',         done: elapsed >= 3  },
          { label: 'Scoring criteria',      done: elapsed >= 15 },
          { label: 'Checking over-scoring', done: elapsed >= 30 },
          { label: 'Generating feedback',   done: elapsed >= 45 },
          { label: 'Finalising result',     done: elapsed >= 55 },
        ].map(step => (
          <div key={step.label} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              {step.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span className={`text-sm transition-colors duration-500 ${step.done ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">{elapsedStr} elapsed</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 max-w-sm text-center">
          {error}
          <button onClick={() => router.refresh()} className="block mx-auto mt-2 text-red-600 font-semibold underline">
            Try refreshing
          </button>
        </div>
      )}
    </div>
  )
}
