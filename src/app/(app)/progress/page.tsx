import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BandChart, { ChartPoint } from '@/components/BandChart'

// ── Types ──────────────────────────────────────────────────────────────────

type CriterionKey = 'task_achievement' | 'coherence_cohesion' | 'lexical_resource' | 'grammatical_range'

interface GradedItem {
  submissionId: string
  resultId: string
  submittedAt: string
  question: string | null
  taskType: string | null
  completionTimeSecs: number | null
  overall: number
  tr: number
  cc: number
  lr: number
  gr: number
  corrections: Array<{ type?: string; category?: string }>
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function avg(nums: number[]) {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function formatShort(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatStartMonth(iso: string) {
  const d = new Date(iso)
  return `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`
}

function bandColorStr(b: number): string {
  if (b >= 7.0) return '#16a344'
  if (b >= 6.0) return '#3d5a47'
  return '#d97706'
}

function pillStyle(b: number): { bg: string; color: string } {
  if (b >= 6.0) return { bg: 'rgba(22,163,68,.12)', color: '#0f7a33' }
  return { bg: 'rgba(245,170,0,.15)', color: '#8a6100' }
}

interface Trend {
  delta: number
  label: string
  color: string
  arrow: string
}

function calcTrend(values: number[]): Trend | null {
  if (values.length < 4) return null
  const n = Math.min(3, Math.floor(values.length / 2))
  const recent = values.slice(-n)
  const previous = values.slice(-(n * 2), -n)
  if (!previous.length) return null
  const delta = avg(recent) - avg(previous)
  if (delta > 0.25)  return { delta, label: 'Cải thiện',  color: '#16a344', arrow: '↑' }
  if (delta < -0.25) return { delta, label: 'Cần chú ý',  color: '#d97706', arrow: '↓' }
  return              { delta, label: 'Ổn định',    color: '#7a9e87', arrow: '→' }
}

// ── Static config ──────────────────────────────────────────────────────────

const CRITERION_CONFIG: { key: CriterionKey; label: string; short: string }[] = [
  { key: 'task_achievement', label: 'Task Response',          short: 'TR' },
  { key: 'coherence_cohesion', label: 'Coherence & Cohesion',  short: 'CC' },
  { key: 'lexical_resource',   label: 'Lexical Resource',       short: 'LR' },
  { key: 'grammatical_range',  label: 'Grammatical Accuracy',   short: 'GR' },
]

const ERROR_LABELS: Record<string, string> = {
  article:                'Mạo từ (a/an/the)',
  subject_verb_agreement: 'Chủ-vị (SVA)',
  collocation:            'Collocation',
  preposition:            'Giới từ',
  word_choice:            'Chọn từ',
  grammar:                'Ngữ pháp',
  tense:                  'Thì động từ',
  sentence_structure:     'Cấu trúc câu',
  unnatural_english:      'Diễn đạt không tự nhiên',
  spelling:               'Chính tả',
  punctuation:            'Dấu câu',
  vocabulary:             'Từ vựng',
}

const CRITERION_ADVICE: Record<CriterionKey, { action: string }> = {
  task_achievement: {
    action: 'Lập dàn ý trước khi viết với 2 luận điểm chính, mỗi điểm kèm ví dụ cụ thể. Đọc lại đề bài sau khi viết để đảm bảo trả lời đủ yêu cầu.',
  },
  coherence_cohesion: {
    action: 'Mỗi đoạn cần câu chủ đề rõ ràng. Dùng từ liên kết đa dạng (however, therefore, in addition) và tránh lặp lại "and" hay "but".',
  },
  lexical_resource: {
    action: 'Học từ vựng theo cụm (collocations) thay vì từng từ đơn. Sau mỗi bài, xem lại lỗi từ vựng và ghi nhớ dạng đúng.',
  },
  grammatical_range: {
    action: 'Tập trung sửa SVA (chủ-vị), mạo từ a/an/the và thì động từ. Đọc lại bài viết một lần trước khi nộp để bắt lỗi cơ bản.',
  },
}

const ERROR_ADVICE: Record<string, string> = {
  subject_verb_agreement: 'Khi viết câu, kiểm tra: chủ ngữ số ít/nhiều → động từ phải phù hợp. Đặc biệt chú ý "social media has" (không phải "have").',
  article:                'Ôn quy tắc: "the" cho danh từ đã xác định; "a/an" cho danh từ đếm được chưa xác định; danh từ không đếm được không cần mạo từ.',
  collocation:            'Học theo cụm: "significant increase IN", "have a negative EFFECT ON", "result IN". Dùng từ điển collocation để kiểm tra.',
  preposition:            'Ghi nhớ cụm giới từ cố định: "interested IN", "responsible FOR", "depend ON", "a fall IN rates".',
  word_choice:            'Dùng từ điển học thuật (OALD/Macmillan) để kiểm tra nghĩa chính xác và cách dùng trước khi viết.',
  grammar:                'Xem lại từng loại lỗi ngữ pháp trong assessment. Tập trung sửa lỗi phổ biến nhất trước, rồi mới đến lỗi ít hơn.',
  tense:                  'Trong IELTS Writing Task 2, dùng thì hiện tại đơn cho sự thật/ý kiến. Task 1 dùng thì theo thời gian của biểu đồ/hình.',
  sentence_structure:     'Luyện viết câu phức (complex sentences) với mệnh đề quan hệ và câu ghép (compound) với dấu phẩy và liên từ.',
  unnatural_english:      'Đọc các bài mẫu IELTS Band 7+ hàng ngày để làm quen với cách diễn đạt tự nhiên. Chú ý cụm từ bị chấm trong assessment.',
  spelling:               'Kiểm tra lại bài viết trước khi nộp, đặc biệt với từ học thuật phổ biến: government, environment, necessary, successful.',
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [submissionsRes, profileRes] = await Promise.all([
    supabase
      .from('writing_submissions')
      .select('id, submitted_at, question, task_type, completion_time_seconds')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('target_band, target_writing')
      .eq('user_id', user.id)
      .single(),
  ])

  const allSubmissions = submissionsRes.data ?? []
  const profile = profileRes.data
  const totalSubmitted = allSubmissions.length

  const submissionIds = allSubmissions.map(s => s.id)
  const { data: rawResults } = submissionIds.length > 0
    ? await supabase
        .from('writing_results')
        .select('id, submission_id, overall_band, task_achievement, coherence_cohesion, lexical_resource, grammatical_range, corrections')
        .in('submission_id', submissionIds)
    : { data: [] }

  const resultMap = new Map(
    (rawResults ?? []).map(r => [r.submission_id as string, r])
  )

  const graded: GradedItem[] = []
  for (const s of allSubmissions) {
    const r = resultMap.get(s.id)
    if (!r || typeof r.overall_band !== 'number') continue
    graded.push({
      submissionId:       s.id,
      resultId:           r.id,
      submittedAt:        s.submitted_at,
      question:           s.question ?? null,
      taskType:           s.task_type ?? null,
      completionTimeSecs: (s as Record<string, unknown>).completion_time_seconds as number | null ?? null,
      overall:            r.overall_band,
      tr:                 r.task_achievement,
      cc:                 r.coherence_cohesion,
      lr:                 r.lexical_resource,
      gr:                 r.grammatical_range,
      corrections:        Array.isArray(r.corrections) ? r.corrections : [],
    })
  }

  const totalChecked = graded.length
  const targetBand: number | null = (profile?.target_writing ?? profile?.target_band) ?? null

  // ── Empty state ──────────────────────────────────────────────────────────
  if (totalChecked === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
        <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 20, padding: '48px 36px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(22,163,68,.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a344" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#192e1e', marginBottom: 8 }}>Chưa có dữ liệu tiến độ</h2>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7a9e87', marginBottom: 24, lineHeight: 1.6 }}>
            {totalSubmitted > 0
              ? `Bạn đã nộp ${totalSubmitted} bài, nhưng chưa có bài nào được chấm.`
              : 'Hãy nộp và chấm bài viết đầu tiên để theo dõi tiến độ của bạn.'}
          </p>
          <Link href="/writing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#16a344', color: '#fff', borderRadius: 50, padding: '10px 24px', fontWeight: 900, fontSize: 13, textDecoration: 'none' }}>
            Viết bài ngay
          </Link>
        </div>
      </div>
    )
  }

  // ── Aggregations ─────────────────────────────────────────────────────────
  const overallBands = graded.map(g => g.overall)
  const currentBand  = graded[graded.length - 1].overall
  const highestBand  = Math.max(...overallBands)
  const averageBand  = Math.round(avg(overallBands) * 10) / 10

  const chartData: ChartPoint[] = graded.map(g => ({
    date:           g.submittedAt,
    band:           g.overall,
    label:          formatShort(g.submittedAt),
    completionTime: g.completionTimeSecs,
    taskType:       g.taskType,
  }))

  const CRIT_PROP: Record<CriterionKey, 'tr' | 'cc' | 'lr' | 'gr'> = {
    task_achievement:   'tr',
    coherence_cohesion: 'cc',
    lexical_resource:   'lr',
    grammatical_range:  'gr',
  }
  const criterionStats = CRITERION_CONFIG.map(({ key, label, short }) => {
    const vals = graded.map(g => g[CRIT_PROP[key]])
    const current = vals[vals.length - 1]
    const highest = Math.max(...vals)
    const mean    = Math.round(avg(vals) * 10) / 10
    const trend   = calcTrend(vals)
    return { key, label, short, current, highest, average: mean, trend }
  })

  const overallTrend = calcTrend(overallBands)

  // Best submission (for subtitle of "Band cao nhất")
  const bestItem = graded.reduce((best, g) => g.overall > best.overall ? g : best, graded[0])
  function taskShort(taskType: string | null): string {
    if (taskType === 'task2') return 'Task 2'
    if (taskType === 'academic_task1' || taskType === 'general_task1') return 'Task 1'
    return ''
  }

  const seenIds = new Set<string>()
  const typeCounts = new Map<string, number>()
  for (const g of graded) {
    if (seenIds.has(g.resultId)) continue
    seenIds.add(g.resultId)
    for (const c of g.corrections) {
      const t = c.type ?? c.category ?? 'other'
      typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1)
    }
  }
  const totalErrors = [...typeCounts.values()].reduce((a, b) => a + b, 0)
  const topErrors = [...typeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([type, count]) => ({
      type,
      label: ERROR_LABELS[type] ?? type,
      count,
      pct: totalErrors > 0 ? Math.round((count / Math.max(...typeCounts.values())) * 100) : 0,
    }))

  const bests = {
    overall: highestBand,
    tr: Math.max(...graded.map(g => g.tr)),
    cc: Math.max(...graded.map(g => g.cc)),
    lr: Math.max(...graded.map(g => g.lr)),
    gr: Math.max(...graded.map(g => g.gr)),
  }

  const weakestCrit = [...criterionStats].sort((a, b) => a.average - b.average)[0]
  const topErrorType = topErrors[0]?.type ?? null

  interface Priority { num: number; title: string; subtitle: string; action: string }
  const priorities: Priority[] = []

  priorities.push({
    num: 1,
    title: `Cải thiện ${weakestCrit.label}`,
    subtitle: `Điểm TB: ${weakestCrit.average} — tiêu chí yếu nhất của bạn`,
    action: CRITERION_ADVICE[weakestCrit.key].action,
  })

  if (topErrorType && ERROR_ADVICE[topErrorType]) {
    priorities.push({
      num: 2,
      title: `Giảm lỗi ${topErrors[0].label}`,
      subtitle: `${topErrors[0].count} lần xuất hiện — lỗi phổ biến nhất`,
      action: ERROR_ADVICE[topErrorType],
    })
  } else {
    priorities.push({
      num: 2,
      title: 'Mở rộng từ vựng học thuật',
      subtitle: 'Tăng tốc độ cải thiện LR score',
      action: 'Học 10 collocations IELTS mỗi ngày theo chủ đề: environment, technology, society. Dùng chúng trong bài viết tiếp theo.',
    })
  }

  if (overallTrend?.label === 'Cần chú ý') {
    priorities.push({
      num: 3,
      title: 'Duy trì tính ổn định',
      subtitle: `Điểm giảm ${Math.abs(overallTrend.delta).toFixed(2)} trong 3 bài gần nhất`,
      action: 'Viết bài đều đặn hơn và xem lại kết quả chấm điểm kỹ trước khi nộp bài tiếp theo.',
    })
  } else if (targetBand && currentBand < targetBand) {
    priorities.push({
      num: 3,
      title: `Hướng tới Band ${targetBand}`,
      subtitle: `Còn cách mục tiêu ${(targetBand - currentBand).toFixed(1)} band`,
      action: `Để đạt Band ${targetBand}, tập trung tăng điểm ${weakestCrit.label} trước — đây là tiêu chí ảnh hưởng nhiều nhất đến điểm tổng.`,
    })
  } else {
    priorities.push({
      num: 3,
      title: 'Duy trì đà cải thiện',
      subtitle: overallTrend?.label === 'Cải thiện' ? 'Bạn đang tiến bộ tốt!' : 'Giữ vững phong độ',
      action: 'Nộp thêm bài mỗi tuần để giữ đà. Thử đặt mục tiêu cao hơn 0.5 band so với điểm hiện tại.',
    })
  }

  const recent = [...graded].reverse().slice(0, 10)

  const progressPct = targetBand && targetBand > 4
    ? Math.min(100, Math.max(0, ((currentBand - 4) / (targetBand - 4)) * 100))
    : null

  const currentBandColor = (targetBand && currentBand < targetBand) ? '#d97706' : '#16a344'

  const CARD: React.CSSProperties = {
    background: '#fff',
    border: '1.5px solid rgba(22,163,68,.13)',
    borderRadius: 16,
    padding: '20px 20px',
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: 20, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ marginBottom: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#16a344', marginBottom: 6 }}>
          ✦ Theo dõi tiến độ
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#192e1e', letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 4 }}>
          Tiến độ của bạn
        </h1>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#3d5a47' }}>
          {totalChecked} bài đã chấm · Bắt đầu từ {formatStartMonth(graded[0].submittedAt)}
        </p>
      </div>

      {/* 4 Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {/* Band hiện tại */}
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7a9e87', marginBottom: 8 }}>Band hiện tại</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: currentBandColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
            {Number(currentBand).toFixed(1)}
          </p>
          {overallTrend ? (
            <p style={{ fontSize: 11, fontWeight: 700, color: overallTrend.color }}>
              {overallTrend.arrow} {overallTrend.delta > 0 ? '+' : ''}{overallTrend.delta.toFixed(1)} tháng này
            </p>
          ) : (
            <p style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>{totalChecked} bài đã chấm</p>
          )}
        </div>

        {/* Band cao nhất */}
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7a9e87', marginBottom: 8 }}>Band cao nhất</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#16a344', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
            {Number(highestBand).toFixed(1)}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>
            {[taskShort(bestItem.taskType), formatShort(bestItem.submittedAt)].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Trung bình */}
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7a9e87', marginBottom: 8 }}>Trung bình</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#192e1e', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
            {Number(averageBand).toFixed(1)}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>Từ {totalChecked} bài</p>
        </div>

        {/* Mục tiêu */}
        <div style={CARD}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7a9e87', marginBottom: 8 }}>Mục tiêu</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#d97706', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
            {targetBand ? Number(targetBand).toFixed(1) : '—'}
          </p>
          {targetBand ? (
            <p style={{ fontSize: 11, fontWeight: 700, color: currentBand >= targetBand ? '#16a344' : '#d97706' }}>
              {currentBand >= targetBand ? '🎉 Đã đạt!' : `Còn ${(targetBand - currentBand).toFixed(1)} band`}
            </p>
          ) : (
            <Link href="/profile" style={{ fontSize: 11, fontWeight: 700, color: '#16a344', textDecoration: 'none' }}>Đặt mục tiêu →</Link>
          )}
        </div>
      </div>

      {/* Band chart */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 900, color: '#192e1e', marginBottom: 14 }}>Band score theo thời gian</p>
        <BandChart data={chartData} targetBand={targetBand} />
      </div>

      {/* Criteria cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {criterionStats.map(({ key, label, short, current, highest, average, trend }) => (
          <div key={key} style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7a9e87' }}>{short}</span>
              {trend ? (
                <span style={{ fontSize: 11, fontWeight: 800, color: trend.color }}>
                  {trend.arrow} {trend.delta > 0 ? '+' : ''}{trend.delta.toFixed(1)}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: '#b0c4b8' }}>—</span>
              )}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: bandColorStr(current), lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
              {Number(current).toFixed(1)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3d5a47', marginBottom: 12 }}>{label}</div>
            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(22,163,68,.1)', paddingTop: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>
                Cao nhất: <b style={{ color: '#192e1e', fontWeight: 800 }}>{Number(highest).toFixed(1)}</b>
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>
                TB: <b style={{ color: '#192e1e', fontWeight: 800 }}>{Number(average).toFixed(1)}</b>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Errors + Priorities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Common errors */}
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 900, color: '#192e1e', marginBottom: 16 }}>Lỗi thường gặp</p>
          {topErrors.length === 0 ? (
            <p style={{ fontSize: 13, color: '#7a9e87', fontWeight: 600 }}>Chưa đủ dữ liệu.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topErrors.map(({ type, label, count, pct }, i) => (
                <div key={type}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#192e1e' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7a9e87', marginRight: 6 }}>#{i + 1}</span>{label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#3d5a47', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(22,163,68,.08)', borderRadius: 50, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(245,170,0,.6)', borderRadius: 50 }} />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87', paddingTop: 4 }}>
                Tổng {totalErrors} lỗi trong {totalChecked} bài đã chấm.
              </p>
            </div>
          )}
        </div>

        {/* Priorities */}
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 900, color: '#192e1e', marginBottom: 16 }}>Ưu tiên cải thiện</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {priorities.map(p => (
              <div key={p.num} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 50, background: '#16a344', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 11, fontWeight: 900 }}>
                  {p.num}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#192e1e', marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87', marginBottom: 4 }}>{p.subtitle}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#3d5a47', lineHeight: 1.5 }}>{p.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent table */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 900, color: '#192e1e', marginBottom: 16 }}>Kết quả gần đây</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Ngày', 'Chủ đề', 'Overall', 'TR', 'CC', 'LR', 'GR', ''].map(h => (
                  <th key={h} style={{ textAlign: h === 'Overall' || h === 'TR' || h === 'CC' || h === 'LR' || h === 'GR' ? 'center' : h === '' ? 'right' : 'left', paddingBottom: 10, paddingRight: h !== '' ? 12 : 0, fontSize: 10, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7a9e87', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((g, idx) => {
                const bp = pillStyle(g.overall)
                return (
                  <tr key={g.resultId} style={{ borderTop: idx === 0 ? '1px solid rgba(22,163,68,.1)' : '1px solid rgba(22,163,68,.07)' }}>
                    <td style={{ padding: '10px 12px 10px 0', color: '#7a9e87', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600 }}>
                      {formatFull(g.submittedAt)}
                    </td>
                    <td style={{ padding: '10px 12px 10px 0', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#192e1e', fontWeight: 600 }}>
                        {g.question?.slice(0, 55) ?? 'Không có đề bài'}
                        {(g.question?.length ?? 0) > 55 ? '…' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ background: bp.bg, color: bp.color, fontWeight: 800, fontSize: 12, padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {Number(g.overall).toFixed(1)}
                      </span>
                    </td>
                    {[g.tr, g.cc, g.lr, g.gr].map((v, i) => (
                      <td key={i} style={{ padding: '10px 12px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 700, color: '#3d5a47' }}>
                        {Number(v).toFixed(1)}
                      </td>
                    ))}
                    <td style={{ padding: '10px 0 10px 12px', textAlign: 'right' }}>
                      <Link href={`/writing/result/${g.submissionId}`} style={{ fontSize: 12, fontWeight: 800, color: '#16a344', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Xem →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personal best + Target */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Personal best */}
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 900, color: '#192e1e', marginBottom: 14 }}>Kỷ lục cá nhân</p>
          {/* Overall */}
          <div style={{ background: 'rgba(22,163,68,.08)', border: '1.5px solid rgba(22,163,68,.18)', borderRadius: 12, padding: '16px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3d5a47', marginBottom: 4 }}>Overall</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#16a344', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{Number(bests.overall).toFixed(1)}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#3d5a47', textAlign: 'right' }}>Kỷ lục<br/>cao nhất</div>
          </div>
          {/* 2x2 criteria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { short: 'TR', label: 'Task Response',         val: bests.tr },
              { short: 'CC', label: 'Coherence & Cohesion',  val: bests.cc },
              { short: 'LR', label: 'Lexical Resource',       val: bests.lr },
              { short: 'GR', label: 'Grammatical Accuracy',   val: bests.gr },
            ].map(({ short, label, val }) => (
              <div key={short} style={{ background: '#f3f8f4', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7a9e87', marginBottom: 4 }}>{short}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: bandColorStr(val), lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 2 }}>{Number(val).toFixed(1)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#7a9e87' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Target */}
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 900, color: '#192e1e', marginBottom: 14 }}>Mục tiêu IELTS</p>
          {targetBand ? (
            <>
              {/* Amber target box */}
              <div style={{ background: 'rgba(245,170,0,.08)', border: '1.5px solid rgba(245,170,0,.25)', borderRadius: 14, padding: '18px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#d97706', lineHeight: 1, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {Number(targetBand).toFixed(1)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#3d5a47', marginBottom: 6 }}>
                    {currentBand >= targetBand ? '🎉 Bạn đã đạt mục tiêu!' : `Còn cách ${(targetBand - currentBand).toFixed(1)} band`}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87', lineHeight: 1.5 }}>
                    Tiêu chí yếu nhất: <b style={{ color: '#3d5a47' }}>{weakestCrit.label}</b> ({Number(weakestCrit.average).toFixed(1)})
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              {progressPct !== null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#7a9e87', marginBottom: 6 }}>
                    <span>Band {Number(currentBand).toFixed(1)}</span>
                    <span>Band {Number(targetBand).toFixed(1)}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(22,163,68,.1)', borderRadius: 50, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? '#16a344' : '#d97706', borderRadius: 50, transition: 'width .5s' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#7a9e87' }}>
                    {progressPct >= 100 ? '🎉 Đã hoàn thành mục tiêu!' : `${Math.round(progressPct)}% đã đạt được`}
                  </div>
                </>
              )}
              <Link href="/profile" style={{ display: 'inline-block', marginTop: 14, fontSize: 12, fontWeight: 700, color: '#16a344', textDecoration: 'none' }}>
                Thay đổi mục tiêu →
              </Link>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#7a9e87', marginBottom: 14 }}>Chưa đặt mục tiêu band.</p>
              <Link href="/profile" style={{ fontSize: 13, fontWeight: 800, color: '#16a344', textDecoration: 'none' }}>
                Đặt mục tiêu trong Profile →
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
