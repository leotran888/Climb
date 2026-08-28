export type BandLevel = '5-6' | '6-7' | '7+'
export type WritingTask = 'task1' | 'task2' | 'both'
export type WritingSuitability = 'highly_suitable' | 'suitable' | 'use_with_caution' | 'avoid'
export type ItemType = 'vocabulary' | 'collocation' | 'phrasal_verb' | 'writing_phrase' | 'common_mistake'
export type LearningStatus = 'learning' | 'learned'
export type LearningPriority = 'must_learn' | 'high_value' | 'optional'
export type CEFRLevel = 'B1' | 'B2' | 'C1' | 'C2'

export interface VocabularyItem {
  id: string
  type: 'vocabulary'
  term: string
  pronunciation?: string   // IPA
  partOfSpeech?: string
  cefrLevel?: CEFRLevel
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
  antonym?: string
  wordFamily?: string[]    // e.g. ['deterioration (n)', 'deteriorating (adj)']
  priority: LearningPriority
}

export interface CollocationItem {
  id: string
  type: 'collocation'
  term: string             // the collocation phrase
  collocationType: string  // e.g. 'Verb + Noun', 'Adj + Noun'
  definition: string
  vietnameseMeaning: string
  example: string
  alternative?: string
  topic: string
  bandLevel: BandLevel
  task: WritingTask
  priority: LearningPriority
  writingTip?: string
}

export interface PhrasalVerbItem {
  id: string
  type: 'phrasal_verb'
  term: string
  partOfSpeech?: string
  definition: string
  vietnameseMeaning: string
  example: string
  formalAlternative?: string
  topic: string
  bandLevel: BandLevel
  task: WritingTask
  writingSuitability: WritingSuitability
  priority: LearningPriority
  usageWarning?: string
  collocations?: string[]
  academicAlternatives?: string[]
}

export interface WritingPhraseItem {
  id: string
  type: 'writing_phrase'
  term: string             // the phrase itself
  function: string         // e.g. 'Introducing an argument', 'Explaining a cause'
  vietnameseMeaning: string
  example: string
  topic: string
  bandLevel: BandLevel
  task: WritingTask
  priority: LearningPriority
}

export interface CommonMistakeItem {
  id: string
  type: 'common_mistake'
  incorrect: string
  correct: string
  explanation: string
  topic: string
  priority: LearningPriority
}

export type AnyItem = VocabularyItem | CollocationItem | PhrasalVerbItem | WritingPhraseItem | CommonMistakeItem

export interface TopicData {
  topic: string
  vocabulary: VocabularyItem[]
  collocations: CollocationItem[]
  phrasalVerbs: PhrasalVerbItem[]
  writingPhrases: WritingPhraseItem[]
  commonMistakes: CommonMistakeItem[]
  learnFirst: {
    vocabulary: string[]      // array of item IDs
    collocations: string[]
    phrasalVerbs: string[]
    writingPhrases: string[]
  }
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

export type TopicName = typeof TOPICS[number]

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

export const PRIORITY_LABELS: Record<LearningPriority, { label: string; icon: string; color: string }> = {
  must_learn: { label: 'Must Learn', icon: '🔥', color: 'text-red-600' },
  high_value: { label: 'High Value', icon: '⭐', color: 'text-amber-500' },
  optional: { label: 'Optional', icon: '○', color: 'text-slate-400' },
}

export const PHRASE_FUNCTIONS = [
  'All Functions',
  'Introducing an argument',
  'Giving a reason',
  'Explaining a cause',
  'Explaining an effect',
  'Giving an example',
  'Discussing advantages',
  'Discussing disadvantages',
  'Suggesting a solution',
  'Expressing an opinion',
  'Comparing ideas',
] as const
