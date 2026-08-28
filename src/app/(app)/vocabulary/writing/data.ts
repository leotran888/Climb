import type {
  TopicData,
  VocabularyItem,
  CollocationItem,
  PhrasalVerbItem,
  WritingPhraseItem,
  CommonMistakeItem,
} from './types'

import { ENVIRONMENT } from './topics/environment'
import { EDUCATION } from './topics/education'
import { HEALTH } from './topics/health'
import { TECHNOLOGY } from './topics/technology'
import { WORK } from './topics/work'
import { ECONOMY } from './topics/economy'
import { GOVERNMENT } from './topics/government'
import { SOCIETY } from './topics/society'
import { FAMILY } from './topics/family'
import { CRIME } from './topics/crime'
import { TRANSPORT } from './topics/transport'
import { CITIES } from './topics/cities'
import { GLOBALISATION } from './topics/globalisation'
import { MEDIA } from './topics/media'
import { CULTURE } from './topics/culture'
import { SCIENCE } from './topics/science'
import { FOOD } from './topics/food'
import { ENERGY } from './topics/energy'

export const TOPIC_DATABASE: TopicData[] = [
  ENVIRONMENT,
  EDUCATION,
  HEALTH,
  TECHNOLOGY,
  WORK,
  ECONOMY,
  GOVERNMENT,
  SOCIETY,
  FAMILY,
  CRIME,
  TRANSPORT,
  CITIES,
  GLOBALISATION,
  MEDIA,
  CULTURE,
  SCIENCE,
  FOOD,
  ENERGY,
]

/** Every browsable/saveable item: vocabulary, collocations and phrasal verbs. */
export type StudyItem = VocabularyItem | CollocationItem | PhrasalVerbItem

export const ALL_ITEMS: StudyItem[] = TOPIC_DATABASE.flatMap(t => [
  ...t.vocabulary,
  ...t.collocations,
  ...t.phrasalVerbs,
])

export const ALL_VOCABULARY: VocabularyItem[] = TOPIC_DATABASE.flatMap(t => t.vocabulary)
export const ALL_COLLOCATIONS: CollocationItem[] = TOPIC_DATABASE.flatMap(t => t.collocations)
export const ALL_PHRASAL_VERBS: PhrasalVerbItem[] = TOPIC_DATABASE.flatMap(t => t.phrasalVerbs)

export const ALL_WRITING_PHRASES: WritingPhraseItem[] = TOPIC_DATABASE.flatMap(t => t.writingPhrases)

export const ALL_MISTAKES: CommonMistakeItem[] = TOPIC_DATABASE.flatMap(t => t.commonMistakes)

/** Topic name -> its TopicData, for quick lookup by the UI. */
export const TOPIC_BY_NAME: Record<string, TopicData> = Object.fromEntries(
  TOPIC_DATABASE.map(t => [t.topic, t])
)

/** IDs flagged as "learn first" across every topic, for the priority view. */
export const LEARN_FIRST_IDS: Set<string> = new Set(
  TOPIC_DATABASE.flatMap(t => [
    ...t.learnFirst.vocabulary,
    ...t.learnFirst.collocations,
    ...t.learnFirst.phrasalVerbs,
    ...t.learnFirst.writingPhrases,
  ])
)
