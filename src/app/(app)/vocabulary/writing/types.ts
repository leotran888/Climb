export type BandLevel = '5-6' | '6-7' | '7+'
export type WritingTask = 'task1' | 'task2' | 'both'
export type WritingSuitability = 'highly_suitable' | 'suitable' | 'use_with_caution' | 'avoid'
export type ItemType = 'vocabulary' | 'collocation' | 'phrasal_verb'
export type LearningStatus = 'learning' | 'learned'

export interface VocabularyItem {
  id: string
  type: ItemType
  term: string
  pronunciation?: string
  partOfSpeech?: string
  definition: string
  vietnameseMeaning: string
  example: string
  writingTip?: string
  topic: string
  bandLevel: BandLevel
  task: WritingTask
  writingSuitability: WritingSuitability
  collocations?: string[]
  alternatives?: string[]
  academicAlternatives?: string[]
  collocationType?: string
}

export const TOPICS = [
  'All Topics',
  'Environment',
  'Education',
  'Health',
  'Technology',
  'Work & Employment',
  'Economy',
  'Government',
  'Society',
  'Family',
  'Crime & Law',
  'Transport',
  'Cities & Urbanisation',
  'Globalisation',
  'Media',
  'Culture',
  'Science',
  'Food',
  'Energy',
] as const

export const SUITABILITY_LABELS: Record<WritingSuitability, { label: string; icon: string; color: string }> = {
  highly_suitable: { label: 'Highly suitable', icon: '✅', color: 'text-emerald-700' },
  suitable: { label: 'Suitable', icon: '✅', color: 'text-emerald-600' },
  use_with_caution: { label: 'Use with caution', icon: '⚠️', color: 'text-amber-600' },
  avoid: { label: 'Avoid in formal writing', icon: '❌', color: 'text-red-600' },
}

export const BAND_COLORS: Record<BandLevel, string> = {
  '5-6': 'bg-slate-100 text-slate-600',
  '6-7': 'bg-blue-50 text-blue-700',
  '7+': 'bg-emerald-50 text-emerald-700',
}
