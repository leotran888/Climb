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
  if (delta > 0.25)  return { delta, label: 'Cải thiện',  color: 'text-emerald-600', arrow: '↑' }
  if (delta < -0.25) return { delta, label: 'Cần chú ý',  color: 'text-red-500',     arrow: '↓' }
  return              { delta, label: 'Ổn định',    color: 'text-slate-500',   arrow: '→' }
}

function bandColor(b: number) {
  if (b >= 7.5) return 'text-emerald-600'
  if (b >= 6.5) return 'text-blue-600'
  if (b >= 5.5) return 'text-amber-500'
  return 'text-red-500'
}

function bandBg(b: number) {
  if (b >= 7.5) return 'bg-emerald-50 border-emerald-100'
  if (b >= 6.5) return 'bg-blue-50 border-blue-100'
  if (b >= 5.5) return 'bg-amber-50 border-amber-100'
  return 'bg-red-50 border-red-100'
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

  // ── Fetch ────────────────────────────────────────────────────────────────
  // Two separate queries avoids embedded-join RLS issues
  const [submissionsRes, profileRes] = await Promise.all([
    supabase
      .from('writing_submissions')
      .select('id, submitted_at, question, task_type')
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

  // Fetch writing_results for these submissions
  const submissionIds = allSubmissions.map(s => s.id)
  const { data: rawResults } = submissionIds.length > 0
    ? await supabase
        .from('writing_results')
        .select('id, submission_id, overall_band, task_achievement, coherence_cohesion, lexical_resource, grammatical_range, corrections')
        .in('submission_id', submissionIds)
    : { data: [] }

  // Map resultId by submission_id
  const resultMap = new Map(
    (rawResults ?? []).map(r => [r.submission_id as string, r])
  )

  // Build graded list (ordered by submitted_at from submissions query)
  const graded: GradedItem[] = []
  for (const s of allSubmissions) {
    const r = resultMap.get(s.id)
    if (!r || typeof r.overall_band !== 'number') continue
    graded.push({
      submissionId: s.id,
      resultId:     r.id,
      submittedAt:  s.submitted_at,
      question:     s.question ?? null,
      taskType:     s.task_type ?? null,
      overall:      r.overall_band,
      tr:           r.task_achievement,
      cc:           r.coherence_cohesion,
      lr:           r.lexical_resource,
      gr:           r.grammatical_range,
      corrections:  Array.isArray(r.corrections) ? r.corrections : [],
    })
  }

  const totalChecked = graded.length
  const targetBand: number | null = (profile?.target_writing ?? profile?.target_band) ?? null

  // ── Empty state ──────────────────────────────────────────────────────────
  if (totalChecked === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-600 p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có dữ liệu tiến độ</h2>
          <p className="text-slate-500 text-sm mb-6">
            {totalSubmitted > 0
              ? `Bạn đã nộp ${totalSubmitted} bài, nhưng chưa có bài nào được chấm. Hãy chờ kết quả chấm điểm.`
              : 'Hãy nộp và chấm bài viết đầu tiên để theo dõi tiến độ của bạn.'}
          </p>
          <Link
            href="/writing"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
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
  const lastUpdated  = graded[graded.length - 1].submittedAt

  // Chart data
  const chartData: ChartPoint[] = graded.map(g => ({
    date:  g.submittedAt,
    band:  g.overall,
    label: formatShort(g.submittedAt),
  }))

  // Criterion stats
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
    return { key, label, short, current, highest, average: mean, trend, values: vals }
  })

  // Overall trend
  const overallTrend = calcTrend(overallBands)

  // Corrections aggregation (deduplicated by resultId)
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

  // Personal bests
  const bests = {
    overall: highestBand,
    tr: Math.max(...graded.map(g => g.tr)),
    cc: Math.max(...graded.map(g => g.cc)),
    lr: Math.max(...graded.map(g => g.lr)),
    gr: Math.max(...graded.map(g => g.gr)),
  }

  // Priority improvements (algorithmic)
  const weakestCrit = [...criterionStats].sort((a, b) => a.average - b.average)[0]
  const topErrorType = topErrors[0]?.type ?? null

  interface Priority { num: number; icon: string; title: string; subtitle: string; action: string }
  const priorities: Priority[] = []

  // Priority 1: weakest criterion
  priorities.push({
    num: 1,
    icon: '🎯',
    title: `Cải thiện ${weakestCrit.label}`,
    subtitle: `Điểm TB: ${weakestCrit.average} — tiêu chí yếu nhất của bạn`,
    action: CRITERION_ADVICE[weakestCrit.key].action,
  })

  // Priority 2: most common error
  if (topErrorType && ERROR_ADVICE[topErrorType]) {
    priorities.push({
      num: 2,
      icon: '📝',
      title: `Giảm lỗi ${topErrors[0].label}`,
      subtitle: `${topErrors[0].count} lần xuất hiện — lỗi phổ biến nhất`,
      action: ERROR_ADVICE[topErrorType],
    })
  } else {
    priorities.push({
      num: 2,
      icon: '📖',
      title: 'Mở rộng từ vựng học thuật',
      subtitle: 'Tăng tốc độ cải thiện LR score',
      action: 'Học 10 collocations IELTS mỗi ngày theo chủ đề: environment, technology, society. Dùng chúng trong bài viết tiếp theo.',
    })
  }

  // Priority 3: trend or target
  if (overallTrend?.label === 'Cần chú ý') {
    priorities.push({
      num: 3,
      icon: '⚠️',
      title: 'Duy trì tính ổn định',
      subtitle: `Điểm giảm ${Math.abs(overallTrend.delta).toFixed(2)} trong 3 bài gần nhất`,
      action: 'Viết bài đều đặn hơn và xem lại kết quả chấm điểm kỹ trước khi nộp bài tiếp theo. Đừng vội — chất lượng hơn số lượng.',
    })
  } else if (targetBand && currentBand < targetBand) {
    const gap = targetBand - currentBand
    priorities.push({
      num: 3,
      icon: '🏆',
      title: `Hướng tới Band ${targetBand}`,
      subtitle: `Còn cách mục tiêu ${gap.toFixed(1)} band`,
      action: `Để đạt Band ${targetBand}, tập trung tăng điểm ${weakestCrit.label} trước — đây là tiêu chí ảnh hưởng nhiều nhất đến điểm tổng của bạn.`,
    })
  } else {
    priorities.push({
      num: 3,
      icon: '✨',
      title: 'Duy trì đà cải thiện',
      subtitle: overallTrend?.label === 'Cải thiện' ? 'Bạn đang tiến bộ tốt!' : 'Giữ vững phong độ',
      action: 'Nộp thêm bài mỗi tuần để giữ đà. Thử đặt mục tiêu cao hơn 0.5 band so với điểm hiện tại để có thêm động lực.',
    })
  }

  // Recent 10 (newest first)
  const recent = [...graded].reverse().slice(0, 10)

  // Progress toward target
  const progressPct = targetBand && targetBand > 4
    ? Math.min(100, Math.max(0, ((currentBand - 4) / (targetBand - 4)) * 100))
    : null

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tiến độ của bạn</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalChecked} bài đã chấm · Cập nhật: {formatFull(lastUpdated)}
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Điểm hiện tại', value: currentBand,  highlight: true },
            { label: 'Điểm cao nhất', value: highestBand,  highlight: false },
            { label: 'Điểm trung bình', value: averageBand, highlight: false },
            { label: 'Bài đã chấm',   value: totalChecked, highlight: false, unit: 'bài' },
            { label: 'Tổng bài nộp',  value: totalSubmitted, highlight: false, unit: 'bài' },
            { label: 'Mục tiêu',      value: targetBand ?? '—', highlight: false, isTarget: true },
          ].map(card => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border-2 border-emerald-600 p-4 flex flex-col gap-1 shadow-2xl"
            >
              <span className="text-xs text-slate-500 font-medium leading-tight">{card.label}</span>
              <span className={`text-2xl font-black leading-none ${
                card.isTarget ? 'text-amber-500' :
                card.highlight ? 'text-emerald-600' :
                typeof card.value === 'number' ? bandColor(card.value as number) :
                'text-slate-700'
              }`}>
                {card.value}
                {card.unit && <span className="text-xs font-normal text-slate-400 ml-1">{card.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Target progress bar */}
        {progressPct !== null && targetBand && (
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="font-semibold text-slate-700">Tiến độ đến mục tiêu Band {targetBand}</span>
              <span className="text-slate-500">
                Hiện tại <span className={`font-bold ${bandColor(currentBand)}`}>{currentBand}</span>
                {' → '}
                Mục tiêu <span className="font-bold text-amber-500">{targetBand}</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {progressPct >= 100
                ? '🎉 Bạn đã đạt mục tiêu!'
                : `Còn ${(targetBand - currentBand).toFixed(1)} band — ${Math.round(100 - progressPct)}% còn lại`}
            </p>
          </div>
        )}

        {/* Band Chart */}
        <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
          <h2 className="text-base font-bold text-slate-800 mb-4">Biểu đồ tiến độ điểm IELTS</h2>
          <BandChart data={chartData} targetBand={targetBand} />
        </div>

        {/* Criterion Progress */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Tiến độ theo tiêu chí</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {criterionStats.map(({ key, label, short, current, highest, average, trend }) => (
              <div key={key} className="bg-white rounded-2xl border-2 border-emerald-600 p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{short}</span>
                  {trend ? (
                    <span className={`text-xs font-semibold ${trend.color}`}>
                      {trend.arrow} {trend.label}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>
                <div className={`text-3xl font-black ${bandColor(current)} mb-1`}>{current}</div>
                <div className="text-xs text-slate-400 font-medium leading-tight mb-2">{label}</div>
                <div className="flex gap-3 text-xs text-slate-500 border-t border-slate-50 pt-2">
                  <span>TB <span className="font-semibold text-slate-700">{average}</span></span>
                  <span>Best <span className={`font-semibold ${bandColor(highest)}`}>{highest}</span></span>
                </div>
                {trend && (
                  <div className="text-xs text-slate-400 mt-1.5">
                    {trend.delta > 0 ? '+' : ''}{trend.delta.toFixed(2)} (3 bài gần nhất)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses + Priorities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Common errors */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
            <h2 className="text-base font-bold text-slate-800 mb-4">Lỗi thường gặp</h2>
            {topErrors.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa đủ dữ liệu.</p>
            ) : (
              <div className="space-y-2.5">
                {topErrors.map(({ type, label, count, pct }, i) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 font-medium">
                        <span className="text-slate-400 mr-1.5">#{i + 1}</span>{label}
                      </span>
                      <span className="text-xs font-bold text-slate-500 tabular-nums">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-400 pt-1">Tổng {totalErrors} lỗi trong {totalChecked} bài đã chấm.</p>
              </div>
            )}
          </div>

          {/* Priorities */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
            <h2 className="text-base font-bold text-slate-800 mb-4">Ưu tiên cải thiện</h2>
            <div className="space-y-4">
              {priorities.map(p => (
                <div key={p.num} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm">{p.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{p.title}</div>
                    <div className="text-xs text-slate-400 mb-1">{p.subtitle}</div>
                    <div className="text-xs text-slate-600 leading-relaxed">{p.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
          <h2 className="text-base font-bold text-slate-800 mb-4">Kết quả gần đây</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4 font-semibold">Ngày</th>
                  <th className="text-left pb-3 pr-4 font-semibold">Chủ đề</th>
                  <th className="text-center pb-3 pr-3 font-semibold">Overall</th>
                  <th className="text-center pb-3 pr-3 font-semibold">TR</th>
                  <th className="text-center pb-3 pr-3 font-semibold">CC</th>
                  <th className="text-center pb-3 pr-3 font-semibold">LR</th>
                  <th className="text-center pb-3 pr-3 font-semibold">GR</th>
                  <th className="text-right pb-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map(g => (
                  <tr key={g.resultId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap tabular-nums text-xs">
                      {formatFull(g.submittedAt)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700 max-w-[180px]">
                      <span className="line-clamp-1 block">
                        {g.question?.slice(0, 60) ?? 'Không có đề bài'}
                        {(g.question?.length ?? 0) > 60 ? '…' : ''}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-center">
                      <span className={`font-bold tabular-nums ${bandColor(g.overall)}`}>{g.overall}</span>
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600 tabular-nums text-xs font-medium">{g.tr}</td>
                    <td className="py-3 pr-3 text-center text-slate-600 tabular-nums text-xs font-medium">{g.cc}</td>
                    <td className="py-3 pr-3 text-center text-slate-600 tabular-nums text-xs font-medium">{g.lr}</td>
                    <td className="py-3 pr-3 text-center text-slate-600 tabular-nums text-xs font-medium">{g.gr}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/writing/result/${g.submissionId}`}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold whitespace-nowrap"
                      >
                        Xem →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Personal Best + Target */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Personal Best */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
            <h2 className="text-base font-bold text-slate-800 mb-4">Kỷ lục cá nhân</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border p-4 shadow-2xl ${bandBg(bests.overall)}`}>
                <div className="text-xs text-slate-500 mb-1">Overall</div>
                <div className={`text-3xl font-black ${bandColor(bests.overall)}`}>{bests.overall}</div>
              </div>
              {[
                { label: 'Task Response',          val: bests.tr },
                { label: 'Coherence & Cohesion',   val: bests.cc },
                { label: 'Lexical Resource',        val: bests.lr },
                { label: 'Grammatical Accuracy',    val: bests.gr },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-xl border-2 border-emerald-600 bg-slate-50/70 p-3">
                  <div className="text-xs text-slate-500 mb-1 leading-tight">{label}</div>
                  <div className={`text-xl font-black ${bandColor(val)}`}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Target band info */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-2xl">
            <h2 className="text-base font-bold text-slate-800 mb-4">Mục tiêu IELTS</h2>
            {targetBand ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-amber-600 font-semibold">Mục tiêu</span>
                    <span className="text-3xl font-black text-amber-500">{targetBand}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">
                      {currentBand >= targetBand ? (
                        <span className="text-emerald-600 font-semibold">🎉 Bạn đã đạt mục tiêu!</span>
                      ) : (
                        <>
                          Cần tăng thêm{' '}
                          <span className="font-bold text-slate-800">
                            {(targetBand - currentBand).toFixed(1)} band
                          </span>{' '}
                          từ điểm hiện tại.
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Tiêu chí yếu nhất hiện tại là{' '}
                      <span className="font-semibold text-slate-600">{weakestCrit.label}</span>{' '}
                      ({weakestCrit.average}). Cải thiện tiêu chí này sẽ có tác động lớn nhất đến điểm tổng.
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Thay đổi mục tiêu →
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 mb-3">Bạn chưa đặt mục tiêu band.</p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Đặt mục tiêu trong Profile →
                </Link>
              </div>
            )}
          </div>
        </div>

    </div>
  )
}
