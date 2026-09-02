'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const TASKS = [
  { value: 'task2',          label: 'Task 2 – Essay',           desc: 'Bài viết luận — opinion, discussion hoặc problem-solution.', minStr: 'Tối thiểu 250 từ.' },
  { value: 'academic_task1', label: 'Academic Task 1 – Report', desc: 'Mô tả biểu đồ, bảng số liệu hoặc sơ đồ quy trình.',      minStr: 'Tối thiểu 150 từ.' },
  { value: 'general_task1',  label: 'General Task 1 – Letter',  desc: 'Viết thư — formal, semi-formal hoặc informal letter.',      minStr: 'Tối thiểu 150 từ.' },
]

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

const C = {
  green:       '#16a344',
  greenBorder: 'rgba(22,163,68,.13)',
  greenMid:    'rgba(22,163,68,.22)',
  greenBg:     'rgba(22,163,68,.06)',
  text:        '#192e1e',
  muted:       '#3d5a47',
  hint:        '#7a9e87',
  label:       '#3a5a43',
} as const

const LABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 900, letterSpacing: '.12em',
  textTransform: 'uppercase', color: C.label,
}

const TEXTAREA: React.CSSProperties = {
  width: '100%', border: `1.5px solid ${C.greenMid}`, borderRadius: 14,
  padding: '10px 14px', fontSize: 13, fontWeight: 600, color: C.text,
  lineHeight: 1.55, resize: 'none', outline: 'none', background: '#fdfffd',
  fontFamily: 'inherit',
}

export default function WritingCheckerForm() {
  const router = useRouter()
  const [taskType, setTaskType] = useState('task2')
  const [question, setQuestion] = useState('')
  const [questionImage, setQuestionImage] = useState<string | null>(null)
  const [questionImageName, setQuestionImageName] = useState('')
  const [questionImageType, setQuestionImageType] = useState<string>('image/png')
  const [essay, setEssay] = useState('')
  const [completionTime, setCompletionTime] = useState('')
  const [timeError, setTimeError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAcademic = taskType === 'academic_task1'
  const wordCount = countWords(essay)
  const minWords = taskType === 'task2' ? 250 : 150
  const wordCountOk = wordCount >= minWords
  const task = TASKS.find(t => t.value === taskType)!

  function handleImageFile(file: File) {
    const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!supported.includes(file.type)) {
      setError('Định dạng ảnh không hỗ trợ. Vui lòng dùng JPG, PNG, GIF hoặc WebP.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setQuestionImage(ev.target?.result as string)
      setQuestionImageType(file.type)
      setQuestionImageName(file.name)
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
    setQuestionImageName('')
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

      const res = await fetch('/api/grade/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, essay, taskType, wordCount, completionTimeSeconds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')

      const { submissionId } = data

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

      router.push(`/writing/result/${submissionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const questionPlaceholder = isAcademic
    ? 'Mô tả thêm biểu đồ nếu cần (không bắt buộc nếu đã có ảnh)…'
    : taskType === 'task2'
    ? 'Dán đề bài IELTS vào đây…\n\nVí dụ: Some people believe that universities should focus on practical skills rather than academic knowledge. To what extent do you agree or disagree?'
    : 'Dán đề bài IELTS vào đây…\n\nVí dụ: You recently bought a product from an online shop. Write a letter to the company. In your letter: describe what you bought, explain the problem, say what you would like them to do.'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 12, minHeight: 0, overflow: 'hidden' }}>
      <style>{`
        .wc-textarea:focus, .wc-input:focus {
          border-color: #16a344 !important;
          box-shadow: 0 0 0 3px rgba(22,163,68,.08);
        }
        .wc-textarea::placeholder, .wc-input::placeholder { color: #7a9e87; font-weight: 600; }
        .wc-img-btn:hover { background: rgba(22,163,68,.06) !important; }
        .wc-tab:hover { opacity: .85; }
      `}</style>

      {/* Loại bài */}
      <div>
        <span style={{ ...LABEL, marginBottom: 7, display: 'block' }}>Loại bài</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TASKS.map(t => (
            <button
              key={t.value}
              type="button"
              className="wc-tab"
              onClick={() => handleTaskChange(t.value)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 50,
                border: `1.5px solid ${taskType === t.value ? C.green : C.greenMid}`,
                background: taskType === t.value ? C.green : '#fff',
                color: taskType === t.value ? '#fff' : C.muted,
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .15s',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', opacity: taskType === t.value ? 1 : .7, flexShrink: 0, display: 'block' }} />
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 7, padding: '7px 12px', background: C.greenBg, borderRadius: 10, lineHeight: 1.45 }}>
          {task.desc} <span style={{ color: C.green, fontWeight: 800 }}>{task.minStr}</span>
        </div>
      </div>

      <div style={{ height: 1, background: C.greenBorder, flexShrink: 0 }} />

      {/* Đề bài */}
      <div
        style={{ flex: 3, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        onDrop={isAcademic ? handleDrop : undefined}
        onDragOver={isAcademic ? e => e.preventDefault() : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <span style={LABEL}>Đề bài</span>
          {isAcademic && (
            <label
              className="wc-img-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 50, border: `1.5px solid ${C.greenMid}`,
                background: '#fff', color: C.green, fontSize: 11, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              Thêm ảnh
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }}
              />
            </label>
          )}
        </div>

        <textarea
          className="wc-textarea"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onPaste={handleQuestionPaste}
          disabled={loading}
          placeholder={questionPlaceholder}
          style={{ ...TEXTAREA, flex: 1, minHeight: 40 }}
        />

        {questionImage && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
            padding: '4px 6px 4px 4px', borderRadius: 10, border: `1.5px solid ${C.greenMid}`,
            background: '#fdfffd', alignSelf: 'flex-start',
          }}>
            <Image
              src={questionImage}
              alt="chart"
              width={32}
              height={32}
              style={{ borderRadius: 7, objectFit: 'cover', width: 32, height: 32 }}
              unoptimized
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {questionImageName || 'Ảnh đề bài'}
            </span>
            <button
              type="button"
              onClick={clearImage}
              style={{ background: 'none', border: 'none', color: C.hint, fontSize: 13, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        )}

        <p style={{ fontSize: 10, fontWeight: 600, color: C.hint, marginTop: 4 }}>
          Không bắt buộc — nhưng giúp AI chấm Task Response chính xác hơn.
          {isAcademic && ' Có thể dán ảnh (Ctrl+V) hoặc browse.'}
        </p>
      </div>

      {/* Bài viết */}
      <div style={{ flex: 7, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={LABEL}>Bài viết của bạn</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 800,
            background: wordCount > 0 && !wordCountOk ? 'rgba(212,144,10,.1)' : 'rgba(22,163,68,.1)',
            color: wordCount > 0 && !wordCountOk ? '#d4900a' : C.green,
          }}>
            {wordCount} từ
          </span>
        </div>
        <textarea
          className="wc-textarea"
          value={essay}
          onChange={e => setEssay(e.target.value)}
          disabled={loading}
          required
          placeholder="Viết hoặc dán bài viết của bạn vào đây…"
          style={{ ...TEXTAREA, flex: 1, minHeight: 80 }}
        />
        <p style={{ fontSize: 10, fontWeight: 600, color: C.hint, marginTop: 4 }}>
          Tối thiểu {minWords} từ cho {taskType === 'task2' ? 'Task 2' : 'Task 1'}.
          {wordCount > 0 && !wordCountOk && (
            <span style={{ color: '#d4900a' }}> Cần thêm {minWords - wordCount} từ.</span>
          )}
        </p>
      </div>

      <div style={{ height: 1, background: C.greenBorder, flexShrink: 0 }} />

      {/* Thời gian */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
        <span style={LABEL}>Thời gian hoàn thành</span>
        <input
          className="wc-input"
          type="text"
          value={completionTime}
          onChange={e => { setCompletionTime(e.target.value); setTimeError('') }}
          disabled={loading}
          placeholder="42:35"
          maxLength={7}
          style={{
            width: 80, border: `1.5px solid ${timeError ? '#f87171' : C.greenMid}`, borderRadius: 10,
            padding: '5px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            color: C.text, outline: 'none', background: '#fdfffd',
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, color: C.hint }}>phút:giây · để trống nếu không ghi lại</span>
        {timeError && <span style={{ fontSize: 11, color: '#ef4444' }}>{timeError}</span>}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, padding: '10px 14px', borderRadius: 12, flexShrink: 0 }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: C.hint, maxWidth: 320, lineHeight: 1.55 }}>
          Điểm band của AI chỉ mang tính tham khảo luyện tập — không phải kết quả IELTS chính thức.
        </p>
        <button
          type="submit"
          disabled={loading || !essay.trim()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: loading || !essay.trim() ? '#a7d9b8' : C.green,
            color: '#fff', border: 'none', borderRadius: 50,
            padding: '10px 24px', fontSize: 13, fontWeight: 900,
            cursor: loading || !essay.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'opacity .15s',
          }}
        >
          {loading ? (
            <>
              <svg style={{ animation: 'wc-spin 1s linear infinite', width: 15, height: 15 }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity=".25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang phân tích…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
              Chấm bài ngay
            </>
          )}
        </button>
      </div>

      {loading && (
        <div style={{ background: C.greenBg, border: `1px solid rgba(22,163,68,.2)`, borderRadius: 12, padding: '12px 16px', fontSize: 12, color: C.muted, textAlign: 'center', flexShrink: 0 }}>
          <p style={{ fontWeight: 800, marginBottom: 3 }}>AI đang phân tích bài viết…</p>
          <p style={{ color: C.hint }}>Kiểm tra ngữ pháp, từ vựng, coherence, và task response. Thường mất 20–40 giây.</p>
        </div>
      )}

      <style>{`@keyframes wc-spin { to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
