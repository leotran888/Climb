'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { WritingPrompt, TASK_TYPE_LABELS } from '@/lib/types'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function WritingTestClient({ prompt }: { prompt: WritingPrompt }) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState(prompt.time_limit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const startTimeRef = useRef(Date.now())
  const wordCount = countWords(text)
  const minWords = prompt.task_type === 'task2' ? 250 : 150

  const submit = useCallback(async (responseText: string) => {
    if (submitting) return
    setSubmitting(true)
    setError('')

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

    try {
      const res = await fetch('/api/grade/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: prompt.id,
          responseText,
          wordCount: countWords(responseText),
          timeTaken,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Grading failed')

      router.push(`/writing/result/${data.submissionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }, [submitting, prompt.id, router])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      submit(text)
      return
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, text, submit])

  const isLow = timeLeft <= 300 // last 5 minutes

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {TASK_TYPE_LABELS[prompt.task_type]}
          </p>
          <h1 className="font-semibold text-slate-900">{prompt.title}</h1>
        </div>
        <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-xl ${isLow ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row gap-0 max-w-7xl mx-auto w-full">
        {/* Prompt */}
        <div className="md:w-2/5 bg-white border-r border-slate-200 p-6 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Task</h2>
          {prompt.image_description && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-600 italic">
              [{prompt.image_description}]
            </div>
          )}
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
            {prompt.prompt_text}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col p-6 bg-white">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Your Response</h2>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={submitting}
            className="flex-1 w-full resize-none border border-slate-200 rounded-xl p-4 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 min-h-[400px]"
            placeholder="Begin writing your response here..."
          />

          {/* Footer bar */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${wordCount < minWords ? 'text-amber-600' : 'text-emerald-600'}`}>
                {wordCount} words
              </span>
              <span className="text-xs text-slate-400">minimum {minWords}</span>
            </div>
            <div className="flex items-center gap-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={() => submit(text)}
                disabled={submitting || text.trim().length === 0}
                className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Grading your essay...' : 'Submit Essay'}
              </button>
            </div>
          </div>

          {submitting && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 text-center">
              AI is grading your essay. This usually takes 15–30 seconds. Please wait...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
