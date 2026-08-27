export type UserRole = 'user' | 'admin'

export type WritingTaskType = 'academic_task1' | 'general_task1' | 'task2'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  target_band: number | null
  target_writing: number | null
  target_speaking: number | null
  exam_date: string | null
  created_at: string
}

export interface WritingPrompt {
  id: string
  task_type: WritingTaskType
  title: string
  prompt_text: string
  image_description: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chart_data: any | null
  time_limit: number
  created_at: string
}

export interface Correction {
  original: string
  correction: string
  explanation: string
  category?: string
  type?: string
}

export interface VocabularyImprovement {
  original: string
  suggested?: string    // legacy
  suggestion?: string   // new
  explanation: string
}

export interface SentenceImprovement {
  original: string
  improved: string
  explanation: string
}

export interface CriterionDetail {
  band?: number
  evidence?: string[]
  strengths: string[]
  weaknesses?: string[]         // old format
  needs_improvement?: string[]  // new format
  justification?: string        // old format
  why_not_higher?: string       // old format
  to_reach?: string             // new format
}

export interface CriteriaDetail {
  task_response: CriterionDetail
  coherence_cohesion: CriterionDetail
  lexical_resource: CriterionDetail
  grammatical_range: CriterionDetail
}

export interface WritingSubmission {
  id: string
  user_id: string
  prompt_id: string | null
  question: string | null
  task_type: string | null
  response_text: string
  word_count: number
  submitted_at: string
  time_taken: number | null
  completion_time_seconds: number | null
  writing_prompts?: WritingPrompt | null
  writing_results?: WritingResult | null
}

export interface WritingResult {
  id: string
  submission_id: string
  task_achievement: number
  coherence_cohesion: number
  lexical_resource: number
  grammatical_range: number
  overall_band: number
  task_feedback: string
  coherence_feedback: string
  lexical_feedback: string
  grammar_feedback: string
  task_errors: string[]
  coherence_errors: string[]
  lexical_errors: string[]
  grammar_errors: string[]
  summary: string
  ai_model: string
  teacher_score: number | null
  teacher_feedback: string | null
  corrections: Correction[]
  vocabulary_improvements: VocabularyImprovement[]
  sentence_improvements: SentenceImprovement[]
  criteria_detail: CriteriaDetail | null
  upgraded_essay: string | null
  target_band: number | null
  priority_improvements: string[] | null
  created_at: string
}

export const TASK_TYPE_LABELS: Record<WritingTaskType, string> = {
  academic_task1: 'Academic Task 1',
  general_task1: 'General Training Task 1',
  task2: 'Writing Task 2',
}

export const CRITERIA_LABELS = {
  task_achievement: 'Task Achievement / Task Response',
  coherence_cohesion: 'Coherence & Cohesion',
  lexical_resource: 'Lexical Resource',
  grammatical_range: 'Grammatical Range & Accuracy',
}

// ─── Subscription system ──────────────────────────────────

export type GradingFeature = 'writing_grading' | 'speaking_grading'

export interface PlanLimits {
  writing_grading_monthly: number
  speaking_grading_monthly: number
}

export interface PlanFeatures {
  writing_grading: boolean
  speaking_grading: boolean
  advanced_correction: boolean
  progress_tracking: boolean
  ai_tutor: boolean
}

export interface Plan {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  currency: string
  billing_interval: 'month' | 'year' | 'lifetime' | 'none'
  limits: PlanLimits
  features: PlanFeatures
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'paused'

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  started_at: string
  expires_at: string | null
  canceled_at: string | null
  provider: 'manual' | 'stripe' | 'payos'
  provider_customer_id: string | null
  provider_subscription_id: string | null
  provider_price_id: string | null
  created_at: string
  updated_at: string
  plan?: Plan
}

export interface UsageRecord {
  id: string
  user_id: string
  feature: GradingFeature
  submission_id: string | null
  billing_period: string
  created_at: string
}

export interface BonusCredit {
  id: string
  user_id: string
  feature: GradingFeature
  amount: number
  remaining: number
  granted_by: string | null
  reason: string | null
  expires_at: string | null
  created_at: string
}

export interface Entitlement {
  allowed: boolean
  remaining: number
  monthlyLimit: number
  currentUsage: number
  bonusRemaining: number
  planSlug: string
  planName: string
}

export interface CheckUsageResult {
  allowed: boolean
  source?: 'plan' | 'bonus'
  reason?: 'no_active_subscription' | 'quota_exceeded'
  plan?: string
  remaining?: number
  monthly_limit?: number
  current_usage?: number
}
