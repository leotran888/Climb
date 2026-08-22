'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const TASKS = [
  { value: 'task2',         label: 'Task 2 – Essay',          desc: 'Opinion, discussion, or problem-solution. Min 250 words.', icon: '📄' },
  { value: 'academic_task1', label: 'Academic Task 1 – Report', desc: 'Describe a graph, chart, table, or process. Min 150 words.', icon: '📊' },
  { value: 'general_task1', label: 'General Task 1 – Letter',  desc: 'Formal, semi-formal, or informal letter. Min 150 words.',  icon: '✉️' },
]

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function WritingCheckerForm() {
  const router = useRouter()
  const [taskType, setTaskType] = useState('task2')
  const [question, setQuestion] = useState('')
  const [questionImage, setQuestionImage] = useState<string | null>(null)   // data URL
  const [questionImageType, setQuestionImageType] = useState<string>('image/png')
  const [essay, setEssay] = useState('')
  const [completionTime, setCompletionTime] = useState('')
  const [timeError, setTimeError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAcademic = taskType === 'academic_task1'
  const wordCount = countWords(essay)
  const charCount = essay.length
  const minWords = taskType === 'task2' ? 250 : 150

  function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => {
      setQuestionImage(ev.target?.result as string)
      setQuestionImageType(file.type)
    }
    reader.readAsDataURL(file)
  }

  function handleQuestionPaste(e: React.ClipboardEvent) {
    if (!isAcademic) return
    const items = Array.from(e.clipboardData?.items ?? [])
    const imageItem = items.find(i => i.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (file) handleImageFile(file)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }

  function clearImage() {
    setQuestionImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleTaskChange(value: string) {
    setTaskType(value)
    if (value !== 'academic_task1') clearImage()
  }

  function parseCompletionTime(value: string): number | null {
    if (!value.trim()) return null
    const match = value.match(/^(\d{1,3}):([0-5]\d)$/)
    if (!match) return null
    return parseInt(match[1]) * 60 + parseInt(match[2])
  }

  function validateCompletionTime(value: string): string {
    if (!value.trim()) return ''
    if (!/^\d{1,3}:[0-5]\d$/.test(value)) return 'Định dạng không hợp lệ. Ví dụ: 42:35'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!essay.trim()) return

    const tErr = validateCompletionTime(completionTime)
    if (tErr) { setTimeError(tErr); return }

    setLoading(true)
    setError('')

    try {
      const completionTimeSeconds = parseCompletionTime(completionTime)

      // Step 1: save submission (fast, ~200ms)
      const res = await fetch('/api/grade/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, essay, taskType, wordCount, completionTimeSeconds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')

      const { submissionId } = data

      // Step 2: store image in sessionStorage so result page can send it to process API
      if (questionImage) {
        try {
          sessionStorage.setItem(`pending_img_${submissionId}`, JSON.stringify({
            imageBase64: questionImage.replace(/^data:[^;]+;base64,/, ''),
            imageMediaType: questionImageType ?? 'image/png',
          }))
        } catch {
          // sessionStorage quota exceeded — proceed without image
        }
      }

      // Step 3: navigate immediately to result page (grading starts there)
      router.push(`/writing/result/${submissionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const questionPlaceholder =
    taskType === 'task2'
      ? 'Paste the IELTS question here...\n\nExample: Some people believe that universities should focus on teaching practical skills for employment rather than academic knowledge. To what extent do you agree or disagree?'
      : taskType === 'academic_task1'
      ? 'Paste the Task 1 question text here...\n\nExample: The graph below shows the percentage of households owning different devices in the UK from 2000 to 2020. Summarise the information by selecting and reporting the main features.'
      : 'Paste the letter task here...\n\nExample: You recently bought a product from an online shop. Write a letter to the company. In your letter: describe what you bought, explain the problem, say what you would like them to do.'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
      {/* Task type */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Choose your task type</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TASKS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTaskChange(t.value)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                taskType === t.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-400 hover:border-slate-400 bg-white'
              }`}
            >
              <span className="text-base mb-1 block">{t.icon}</span>
              <p className={`font-semibold text-sm mb-0.5 ${taskType === t.value ? 'text-emerald-700' : 'text-slate-800'}`}>
                {t.label}
              </p>
              <p className="text-xs text-slate-500 leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2-column inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">

        {/* Question / Image area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <label className="text-sm font-semibold text-slate-700">IELTS Writing Question</label>
            <span className="text-xs text-slate-400">Optional but recommended</span>
          </div>

          {/* Academic Task 1: image paste zone */}
          {isAcademic && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`rounded-xl border-2 border-dashed transition-colors ${
                questionImage ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-400 hover:border-emerald-300'
              }`}
            >
              {questionImage ? (
                <div className="relative">
                  <Image
                    src={questionImage}
                    alt="Chart / diagram"
                    width={600}
                    height={400}
                    className="w-full rounded-xl object-contain max-h-64"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 shadow-md transition-colors"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onPaste={handleQuestionPaste}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <span className="text-3xl">📊</span>
                  <p className="text-sm font-medium text-slate-700">Paste chart image here</p>
                  <p className="text-xs text-slate-400">
                    <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">Ctrl+V</kbd>
                    {' '}to paste · drag &amp; drop · or{' '}
                    <span className="text-emerald-600 underline underline-offset-2">browse</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Text question textarea */}
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onPaste={handleQuestionPaste}
            disabled={loading}
            placeholder={questionPlaceholder}
            className={`w-full border-2 border-emerald-600 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none leading-relaxed ${
              isAcademic ? 'min-h-[60px]' : 'min-h-[160px] flex-1'
            }`}
          />

          <p className="text-xs text-slate-400">
            {isAcademic
              ? 'Paste the chart image above + add the question text. AI reads both.'
              : 'With the question, AI can fully evaluate Task Response.'}
          </p>
        </div>

        {/* Essay */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Your Essay</label>
            <div className="flex items-center gap-3 text-xs">
              <span className={`font-semibold ${wordCount < minWords ? 'text-amber-600' : 'text-emerald-600'}`}>
                {wordCount} words
              </span>
              <span className="text-slate-400">{charCount} chars</span>
              {essay && (
                <button type="button" onClick={() => setEssay('')} className="text-slate-400 hover:text-red-500 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            value={essay}
            onChange={e => setEssay(e.target.value)}
            disabled={loading}
            required
            placeholder="Write or paste your essay here..."
            className="flex-1 min-h-[160px] w-full border-2 border-emerald-600 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none leading-relaxed"
          />
          <p className="text-xs text-slate-400">
            Minimum {minWords} words for {taskType === 'task2' ? 'Task 2' : 'Task 1'}.
            {wordCount > 0 && wordCount < minWords && (
              <span className="text-amber-500"> {minWords - wordCount} more words needed.</span>
            )}
          </p>
        </div>
      </div>

      {/* Completion time */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-700 shrink-0">Thời gian hoàn thành bài</label>
        <input
          type="text"
          value={completionTime}
          onChange={e => { setCompletionTime(e.target.value); setTimeError('') }}
          disabled={loading}
          placeholder="42:35"
          maxLength={7}
          className={`w-24 border-2 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            timeError ? 'border-red-400' : 'border-slate-300'
          }`}
        />
        <span className="text-xs text-slate-400">phút:giây · để trống nếu không ghi lại</span>
        {timeError && <span className="text-xs text-red-500">{timeError}</span>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-400 max-w-sm">
          AI band scores are estimates for practice only — not official IELTS results.
        </p>
        <button
          type="submit"
          disabled={loading || !essay.trim()}
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 shadow-lg shadow-emerald-100 shrink-0"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analysing your essay…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Check My Writing
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-sm text-emerald-800 text-center">
          <p className="font-medium mb-1">AI is analysing your essay…</p>
          <p className="text-xs text-emerald-600">Checking grammar, vocabulary, coherence, and task response. This usually takes 20–40 seconds.</p>
        </div>
      )}
    </form>
  )
}
