/**
 * Extended Benchmark — Current vs Hybrid (Sonnet scoring ‖ Haiku corrections)
 * 5 essays: varying length (160–310w), band (5.0–6.5+), error types
 * Run: npx tsx benchmark.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import {
  SYSTEM_PROMPT,
  SCORING_SYSTEM_PROMPT,
  CORRECTIONS_SYSTEM_PROMPT,
  buildUserPrompt,
  buildScoringUserPrompt,
  buildCorrectionsUserPrompt,
  TASK_LABELS,
  computeOverallBand,
} from './src/lib/grading'

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }
const client = new Anthropic({ apiKey: API_KEY })

// ── Anthropic pricing (approximate, USD per million tokens) ───────────────
const PRICE = {
  sonnet: { input: 3.00, output: 15.00, cache_write: 3.75, cache_read: 0.30 },
  haiku:  { input: 0.80, output: 4.00 },
}

function calcCostSonnet(u: { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number }) {
  const base = (u.input_tokens  / 1e6) * PRICE.sonnet.input
  const out  = (u.output_tokens / 1e6) * PRICE.sonnet.output
  const cw   = ((u.cache_creation_input_tokens ?? 0) / 1e6) * PRICE.sonnet.cache_write
  const cr   = ((u.cache_read_input_tokens     ?? 0) / 1e6) * PRICE.sonnet.cache_read
  return base + out + cw + cr
}
function calcCostHaiku(u: { input_tokens: number; output_tokens: number }) {
  return (u.input_tokens / 1e6) * PRICE.haiku.input + (u.output_tokens / 1e6) * PRICE.haiku.output
}

// ── Test essay dataset ────────────────────────────────────────────────────
const ESSAYS = [

  // 1. 250w · Task 2 · ~Band 5.5 · mixed grammar errors (~12 errors)
  {
    id: 1, name: '250w · B5.5 · grammar-mixed', taskType: 'task2',
    question: 'Some people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better alternative ways. Discuss both views and give your own opinion.',
    essay: `Nowadays, crime is a major problem in many societies. Some people argue that imprisoning criminals for longer period is the most effective solution, while others believe that alternative approaches may works better. In my opinion, a combination of both methods would be the most appropriate.

Those who support longer prison sentences argue that it act as a deterrent for potential criminals. When people know that they will spend many years in jail, they will think twice before committing a crime. Furthermore, keeping criminals behind bars for longer time protect society from further harm, as they cannot commit more crimes while they are imprisoned.

However, there are those who believe that rehabilitation and community-based programs is more effective at reducing crime in the long run. Prison can sometimes make criminals more hardened and difficult to reintegrate into society. Instead, programs which focus on education, job training and mental health support can address the root cause of criminal behavior. For example, many countries which have invested in rehabilitation have seen a significant fall on recidivism rates.

In my view, the most effective approach would be combining longer sentences for violent and dangerous criminals with rehabilitation programs for those who commit less serious offences. This would both protect society and address the underlying reasons why people turn to crime.

In conclusion, while longer prison sentences has its place in the justice system, a more holistic approach that includes rehabilitation and social programs is likely to be most effective for reducing crime in overall.`,
    knownErrors: 12,
  },

  // 2. 160w · Task 2 · ~Band 5.0 · very heavy grammar, underdeveloped (~18 errors)
  {
    id: 2, name: '160w · B5.0 · heavy-grammar', taskType: 'task2',
    question: 'Many people believe that social media has a negative effect on society. Do you agree or disagree?',
    essay: `In nowadays society, social media have become very popular among all age of people. I am totally agree with the statement that social media effect negatively on society.

First of all, social media makes people to spend too much time on internet. Many young peoples are addicted to scroll through their phones for many hours in a day. This is waste their precious time which could use for study or exercise.

Moreover, social media spread a lot of false informations which is dangerous for society. Peoples easily believe what they see on internet without checking if it are true. Because of this, many conflicts has been happened in real world.

In addition, social medias make people feel lonely even when they are surrounded by friend. They prefer to talk online rather than have real conversation. This situation hurt the mental health of many people.

In conclusion, I strongly believe that social medias have many negatives effects on our society and government should take actions to control it.`,
    knownErrors: 18,
  },

  // 3. 220w · Task 2 · ~Band 5.0 · vocabulary/collocation errors (~9 errors, fewer grammar)
  {
    id: 3, name: '220w · B5.0 · vocab-collocation', taskType: 'task2',
    question: 'Some people think that working from home has more advantages than disadvantages. Do you agree or disagree?',
    essay: `In recent years, working from home has made a big rise due to the development of technology. In my personal opinion, I partially agree that it has more pros than cons, but there are also some drawbacks that cannot be ignored.

On the positive side, working from home allows people to do savings on transportation costs and time. Employees do not need to waste time on commuting every morning, which can be very stressful. Also, they can create a flexible schedule that suits their personal needs, which makes a positive contribution to their work-life balance. Additionally, companies can make reductions on office expenses by having less workers in the office.

However, there are also certain challenges when it comes to work from home. First, some people may face difficulties to concentrate at home due to family interruptions or household distractions. Second, the lack of face-to-face communication can do negative impacts on teamwork and creativity. When employees do not meet each other physically, it is harder to build strong professional relationships and share ideas effectively.

Furthermore, not all types of jobs are suitable to do at home. Jobs that need physical presence, such as construction or medical work, simply cannot be done remotely.

In conclusion, working from home certainly brings advantages, but also poses some challenges. Both employees and employers should carefully evaluate whether this arrangement makes sense for their specific situation.`,
    knownErrors: 9,
  },

  // 4. 310w · Task 2 · ~Band 6.5 · few errors, coherent, good vocab (~2 errors)
  {
    id: 4, name: '310w · B6.5 · few-errors', taskType: 'task2',
    question: 'Some people argue that economic development is more important than protecting the environment. To what extent do you agree or disagree?',
    essay: `The tension between economic growth and environmental protection is one of the defining challenges of our time. While some argue that financial prosperity must take precedence, I firmly believe that sustainable development requires safeguarding the natural world.

Those who prioritise economic development often point to the need to alleviate poverty and improve living standards. In many developing nations, rapid industrialisation has lifted millions out of poverty, funding hospitals, schools, and infrastructure. Proponents of this view argue that addressing immediate human needs must come before long-term environmental concerns.

However, this perspective underestimates the profound costs of environmental degradation. Deforestation, air pollution, and the depletion of natural resources impose enormous economic burdens in the form of healthcare costs, reduced agricultural productivity, and climate-related disasters. The World Bank estimates that environmental damage costs the global economy trillions of dollars annually. Therefore, protecting the environment is not a luxury — it is a prerequisite for sustained economic prosperity.

Furthermore, the notion that economic growth and environmental care are incompatible is increasingly outdated. Renewable energy industries now employs millions of workers worldwide, and green technology represents one of the fastest-growing investment sectors. Countries such as Denmark and Germany have demonstrated that it is possible to achieve strong economic performance while significantly reducing carbon emissions.

In conclusion, while short-term economic gains may occasionally require difficult trade-offs, the evidence overwhelmingly suggests that long-term prosperity depends on environmental sustainability. Governments and businesses must prioritise policies that promote growth without compromising the natural systems on which all life depends.`,
    knownErrors: 2,
  },

  // 5. 290w · Task 2 · ~Band 7.0+ · sophisticated, near-zero errors (~0 errors)
  {
    id: 5, name: '290w · B7.0 · sophisticated', taskType: 'task2',
    question: 'As countries become richer, it becomes increasingly difficult to maintain a sense of national cultural identity. To what extent do you agree or disagree?',
    essay: `Globalisation has unquestionably accelerated the exchange of ideas, goods, and cultural practices across borders. Some commentators contend that this process inevitably erodes national identities as wealthier societies embrace international norms. While I acknowledge that prosperity can dilute certain cultural expressions, I believe that affluence also enables countries to preserve and even reinvigorate their heritage.

Proponents of this view correctly observe that economic development often brings rapid urbanisation and exposure to global media, which can marginalise traditional practices. In South Korea, for instance, the rapid economic ascent of the late twentieth century coincided with a marked decline in interest in traditional music and dress among younger generations. When international brands, streaming platforms, and social media algorithms promote largely homogenised content, local traditions can struggle to compete.

Nevertheless, wealth also furnishes governments and communities with greater resources to invest in cultural preservation. Affluent nations are better positioned to fund museums, heritage programmes, and arts education, ensuring that traditional knowledge is documented and celebrated rather than forgotten. South Korea again provides an instructive counter-example: the same economic growth that initially threatened local culture later enabled the government to subsidise the Korean Wave — a global phenomenon that has made Korean film, music, and cuisine internationally renowned.

Moreover, national identity is not merely a product of material culture but of shared values, language, and historical memory — elements that tend to prove resilient even under the pressures of globalisation.

In conclusion, while prosperity creates pressures on cultural distinctiveness, it equally provides the means to address those pressures. The outcome ultimately depends on political will and public commitment to valuing cultural heritage.`,
    knownErrors: 0,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────
type UsageStats = {
  input_tokens: number; output_tokens: number
  cache_creation_input_tokens?: number; cache_read_input_tokens?: number
}

function parseJson(text: string): unknown {
  const t = text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/,'').trim()
  return JSON.parse(t)
}

type Correction = { original: string; correction: string; type: string; explanation: string }
type BandResult = { TR: number; CC: number; LR: number; GR: number; overall: number }

// ── Single essay: run current + hybrid in PARALLEL ────────────────────────
async function benchmarkEssay(tc: typeof ESSAYS[0]) {
  const taskLabel    = TASK_LABELS[tc.taskType]
  const questionSect = `QUESTION:\n${tc.question}`
  const wordCount    = tc.essay.trim().split(/\s+/).length

  const currentPrompt     = buildUserPrompt({ taskLabel, questionSection: questionSect, wordCount, essay: tc.essay })
  const scoringPrompt     = buildScoringUserPrompt({ taskLabel, questionSection: questionSect, wordCount, essay: tc.essay })
  const correctionsPrompt = buildCorrectionsUserPrompt({ essay: tc.essay })

  let curMs = 0, curUsage!: UsageStats, curBands!: BandResult, curCorrections: Correction[] = []
  let hybWall = 0, sonMs = 0, haikuMs = 0
  let sonUsage!: UsageStats, haikuUsage!: UsageStats
  let hybBands!: BandResult, hybCorrections: Correction[] = []

  await Promise.all([
    // ── Current (1 Sonnet full call) ──
    (async () => {
      const t0 = Date.now()
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 6144,
        system: [{ type: 'text' as const, text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' as const } } as never],
        messages: [{ role: 'user', content: currentPrompt }],
      })
      curMs    = Date.now() - t0
      curUsage = msg.usage as UsageStats
      const d  = parseJson(msg.content[0].type === 'text' ? msg.content[0].text : '') as Record<string, unknown>
      const c  = d.criteria as Record<string, { band: number }>
      curBands = {
        TR: c.task_response?.band, CC: c.coherence_cohesion?.band,
        LR: c.lexical_resource?.band, GR: c.grammatical_range_accuracy?.band,
        overall: computeOverallBand([c.task_response?.band, c.coherence_cohesion?.band, c.lexical_resource?.band, c.grammatical_range_accuracy?.band]),
      }
      curCorrections = (d.corrections as Correction[]) ?? []
    })(),

    // ── Hybrid (Sonnet scoring ‖ Haiku corrections) ──
    (async () => {
      const t0 = Date.now()
      await Promise.all([
        (async () => {
          const s0 = Date.now()
          const msg = await client.messages.create({
            model: 'claude-sonnet-4-6', max_tokens: 5000,
            system: [{ type: 'text' as const, text: SCORING_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' as const } } as never],
            messages: [{ role: 'user', content: scoringPrompt }],
          })
          sonMs    = Date.now() - s0
          sonUsage = msg.usage as UsageStats
          const d  = parseJson(msg.content[0].type === 'text' ? msg.content[0].text : '') as Record<string, unknown>
          const c  = d.criteria as Record<string, { band: number }>
          hybBands = {
            TR: c.task_response?.band, CC: c.coherence_cohesion?.band,
            LR: c.lexical_resource?.band, GR: c.grammatical_range_accuracy?.band,
            overall: computeOverallBand([c.task_response?.band, c.coherence_cohesion?.band, c.lexical_resource?.band, c.grammatical_range_accuracy?.band]),
          }
        })(),
        (async () => {
          const h0 = Date.now()
          const msg = await client.messages.create({
            model: 'claude-haiku-4-5-20251001', max_tokens: 4096,
            system: CORRECTIONS_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: correctionsPrompt }],
          })
          haikuMs    = Date.now() - h0
          haikuUsage = msg.usage as UsageStats
          const d    = parseJson(msg.content[0].type === 'text' ? msg.content[0].text : '') as Record<string, unknown>
          hybCorrections = (d.corrections as Correction[]) ?? []
        })(),
      ])
      hybWall = Date.now() - t0
    })(),
  ])

  const bandMatch =
    curBands.TR === hybBands.TR && curBands.CC === hybBands.CC &&
    curBands.LR === hybBands.LR && curBands.GR === hybBands.GR

  const curCost = calcCostSonnet(curUsage)
  const hybCost = calcCostSonnet(sonUsage) + calcCostHaiku(haikuUsage)

  return { tc, curMs, hybWall, sonMs, haikuMs, curUsage, sonUsage, haikuUsage, curBands, hybBands, bandMatch, curCorrections, hybCorrections, curCost, hybCost }
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`CLIMB Extended Benchmark — ${ESSAYS.length} essays — ${new Date().toLocaleTimeString()}`)
  console.log(`${'═'.repeat(70)}`)

  const results: (Awaited<ReturnType<typeof benchmarkEssay>> | null)[] = []

  for (const tc of ESSAYS) {
    console.log(`\n[${tc.id}/${ESSAYS.length}] ${tc.name}`)
    console.log(`  Running Current + Hybrid in parallel...`)
    try {
      const r = await benchmarkEssay(tc)
      results.push(r)

      console.log(`  Current:  ${(r.curMs/1000).toFixed(1)}s  |  ${r.curUsage.output_tokens} out-tok  |  ${r.curCorrections.length} corrections  |  band=${r.curBands.overall}`)
      console.log(`  Hybrid:   ${(r.hybWall/1000).toFixed(1)}s  (Sonnet ${(r.sonMs/1000).toFixed(1)}s ‖ Haiku ${(r.haikuMs/1000).toFixed(1)}s)  |  ${(r.sonUsage.output_tokens + r.haikuUsage.output_tokens)} out-tok  |  ${r.hybCorrections.length} corrections  |  band=${r.hybBands.overall}`)
      console.log(`  Bands: ${r.bandMatch ? '✅ MATCH' : `⚠️  DIFF  TR(${r.curBands.TR}→${r.hybBands.TR}) CC(${r.curBands.CC}→${r.hybBands.CC}) LR(${r.curBands.LR}→${r.hybBands.LR}) GR(${r.curBands.GR}→${r.hybBands.GR})`}`)
      console.log(`  Cost/1k: Current $${(r.curCost*1000).toFixed(4)}  Hybrid $${(r.hybCost*1000).toFixed(4)}`)
    } catch (e) {
      console.log(`  ERROR: ${e}`)
      results.push(null)
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────
  const valid = results.filter(Boolean) as NonNullable<typeof results[0]>[]

  console.log(`\n${'═'.repeat(70)}`)
  console.log('SUMMARY TABLE')
  console.log(`${'═'.repeat(70)}`)
  console.log(`${'Essay'.padEnd(26)} | Cur(s) | Hyb(s) |Save%| Bands      | C/H/K    | Cur$/1k  Hyb$/1k`)
  console.log('-'.repeat(90))

  let totalCurMs = 0, totalHybMs = 0, totalCurCost = 0, totalHybCost = 0, bandMatches = 0

  for (const r of valid) {
    totalCurMs   += r.curMs
    totalHybMs   += r.hybWall
    totalCurCost += r.curCost
    totalHybCost += r.hybCost
    if (r.bandMatch) bandMatches++

    const save = ((r.curMs - r.hybWall) / r.curMs * 100).toFixed(0)
    const bStr = r.bandMatch ? `✅ ${r.curBands.overall}` : `⚠️${r.curBands.overall}→${r.hybBands.overall}`
    const cor  = `${r.curCorrections.length}/${r.hybCorrections.length}/${r.tc.knownErrors}`
    console.log(`${r.tc.name.padEnd(26)} | ${(r.curMs/1000).toFixed(1).padStart(6)} | ${(r.hybWall/1000).toFixed(1).padStart(6)} | ${save.padStart(4)}| ${bStr.padEnd(10)} | ${cor.padEnd(8)} | $${(r.curCost*1000).toFixed(4).padStart(7)}  $${(r.hybCost*1000).toFixed(4).padStart(7)}`)
  }

  const n = valid.length
  const avgCur  = (totalCurMs / n / 1000).toFixed(1)
  const avgHyb  = (totalHybMs / n / 1000).toFixed(1)
  const avgSave = ((totalCurMs - totalHybMs) / totalCurMs * 100).toFixed(1)
  console.log('-'.repeat(90))
  console.log(`${'AVERAGE'.padEnd(26)} | ${avgCur.padStart(6)} | ${avgHyb.padStart(6)} | ${avgSave.padStart(4)}| ${`${bandMatches}/${n}`.padStart(10)} |          | $${(totalCurCost/n*1000).toFixed(4).padStart(7)}  $${(totalHybCost/n*1000).toFixed(4).padStart(7)}`)

  // ── Haiku correction quality — detail for Essays 1 & 2 ────────────────
  console.log(`\n${'═'.repeat(70)}`)
  console.log('HAIKU CORRECTION DETAIL — Essays 1 and 2')
  console.log(`${'═'.repeat(70)}`)
  for (const r of valid.slice(0, 2)) {
    console.log(`\n[${r.tc.id}] ${r.tc.name}  (known≈${r.tc.knownErrors})`)
    console.log(`  Haiku found ${r.hybCorrections.length} corrections:`)
    r.hybCorrections.forEach((c, i) => {
      console.log(`  [${i+1}] (${c.type}) "${c.original}" → "${c.correction}"`)
      console.log(`       ${c.explanation}`)
    })
    console.log(`  Current found ${r.curCorrections.length} corrections (first 5):`)
    r.curCorrections.slice(0,5).forEach((c, i) => {
      console.log(`  [${i+1}] (${c.type}) "${c.original}" → "${c.correction}"`)
    })
  }

  // ── GO / NO-GO ─────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(70)}`)
  console.log('RECOMMENDATION')
  console.log(`${'═'.repeat(70)}`)
  const matchRate = (bandMatches / n * 100)
  const go = matchRate >= 80 && Number(avgSave) >= 20
  console.log(go ? '✅  GO TO PRODUCTION' : '⛔  DO NOT GO TO PRODUCTION (check criteria below)')
  console.log(`  Band match rate ≥ 80%:     ${matchRate >= 80 ? '✅' : '❌'}  (${matchRate.toFixed(0)}% — ${bandMatches}/${n} essays)`)
  console.log(`  Latency improvement ≥ 20%: ${Number(avgSave) >= 20 ? '✅' : '❌'}  (−${avgSave}%)`)
  console.log(`  Average latency:           Current ${avgCur}s → Hybrid ${avgHyb}s`)
  console.log(`  Average cost per essay:    Current $${(totalCurCost/n*1000).toFixed(4)}/1k → Hybrid $${(totalHybCost/n*1000).toFixed(4)}/1k`)
  console.log(`  (Verify correction quality from detail section above)`)
  console.log(`\n  Done at ${new Date().toLocaleTimeString()}`)
}

main().catch(console.error)
