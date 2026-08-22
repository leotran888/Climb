'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const MAX_POLL_ATTEMPTS = 40  // 40 × 5s = 200s max wait

export default function ResultPendingLoader({ submissionId }: { submissionId: string }) {
  const router    = useRouter()
  const triggered = useRef(false)
  const pollCount = useRef(0)
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

  // ── Poll status every 5s ───────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      pollCount.current += 1

      // Stop polling after max attempts (prevents infinite loop)
      if (pollCount.current > MAX_POLL_ATTEMPTS) {
        clearInterval(interval)
        setError('Grading is taking longer than expected. Please refresh the page or try again.')
        return
      }

      try {
        const res  = await fetch(`/api/grade/writing/status/${submissionId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.done || data.status === 'completed') router.refresh()
      } catch { /* ignore transient poll errors */ }
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
      {!error && (
        <div className="relative w-16 h-16">
          <svg className="animate-spin w-16 h-16 text-emerald-200" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6"/>
          </svg>
          <svg className="animate-spin w-16 h-16 text-emerald-600 absolute inset-0" viewBox="0 0 64 64" fill="none" style={{ animationDuration: '1s' }}>
            <path d="M32 4a28 28 0 0 1 28 28" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      {!error && (
        <>
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
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">Something went wrong</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
          <button
            onClick={() => router.refresh()}
            className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            Refresh page
          </button>
        </div>
      )}
    </div>
  )
}
