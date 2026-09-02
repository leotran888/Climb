import WritingCheckerForm from '@/components/WritingCheckerForm'

export default function WritingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#16a344', marginBottom: 3 }}>
          ✦ Writing AI
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#192e1e', letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 3 }}>
          Nộp bài viết để chấm điểm
        </h1>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#3d5a47' }}>
          AI phân tích 4 tiêu chí IELTS và viết lại bài đạt band mục tiêu
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '1.5px solid rgba(22,163,68,.13)',
        borderRadius: 20,
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
        <WritingCheckerForm />
      </div>
    </div>
  )
}
