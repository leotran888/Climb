import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { CheckUsageResult, Entitlement, GradingFeature } from '@/lib/types'

/**
 * Check if a user is entitled to use a feature, and record usage atomically.
 * Uses Postgres advisory lock to prevent race conditions.
 * Call this BEFORE performing the AI grading operation.
 */
export async function checkAndRecordUsage(
  userId: string,
  feature: GradingFeature,
  submissionId?: string
): Promise<CheckUsageResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('check_and_record_usage', {
    p_user_id: userId,
    p_feature: feature,
    p_submission_id: submissionId ?? null,
  })

  if (error) {
    console.error('[entitlement] check_and_record_usage error:', error)
    // Fail open to avoid blocking legitimate users on DB errors
    return { allowed: true }
  }

  return data as CheckUsageResult
}

/**
 * Get a user's current entitlement status without recording usage.
 * Use for displaying quota info in the UI.
 */
export async function getUserEntitlements(userId: string): Promise<{
  writing: Entitlement
  speaking: Entitlement
}> {
  const supabase = await createClient()
  const billingPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM

  // Fetch subscription + plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at, plans(slug, name, limits)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  const plan = sub?.plans as unknown as { slug: string; name: string; limits: Record<string, number> } | null

  const writingLimit = plan?.limits?.writing_grading_monthly ?? 0
  const speakingLimit = plan?.limits?.speaking_grading_monthly ?? 0

  // Fetch usage for current period
  const { data: usageRows } = await supabase
    .from('usage_records')
    .select('feature')
    .eq('user_id', userId)
    .eq('billing_period', billingPeriod)

  const writingUsage = usageRows?.filter(r => r.feature === 'writing_grading').length ?? 0
  const speakingUsage = usageRows?.filter(r => r.feature === 'speaking_grading').length ?? 0

  // Fetch active bonus credits
  const { data: bonusRows } = await supabase
    .from('bonus_credits')
    .select('feature, remaining')
    .eq('user_id', userId)
    .gt('remaining', 0)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

  const writingBonus = bonusRows
    ?.filter(b => b.feature === 'writing_grading')
    .reduce((sum, b) => sum + b.remaining, 0) ?? 0

  const speakingBonus = bonusRows
    ?.filter(b => b.feature === 'speaking_grading')
    .reduce((sum, b) => sum + b.remaining, 0) ?? 0

  const planSlug = plan?.slug ?? 'free'
  const planName = plan?.name ?? 'Free'

  return {
    writing: {
      allowed: writingUsage < writingLimit || writingBonus > 0,
      remaining: Math.max(0, writingLimit - writingUsage) + writingBonus,
      monthlyLimit: writingLimit,
      currentUsage: writingUsage,
      bonusRemaining: writingBonus,
      planSlug,
      planName,
    },
    speaking: {
      allowed: speakingUsage < speakingLimit || speakingBonus > 0,
      remaining: Math.max(0, speakingLimit - speakingUsage) + speakingBonus,
      monthlyLimit: speakingLimit,
      currentUsage: speakingUsage,
      bonusRemaining: speakingBonus,
      planSlug,
      planName,
    },
  }
}
