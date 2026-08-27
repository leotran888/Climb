import { createAdminClient } from '@/lib/supabase/server'
import type { Plan, Subscription } from '@/lib/types'

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('user_id', userId)
    .single()
  return data as Subscription | null
}

export async function getActivePlans(): Promise<Plan[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return (data ?? []) as Plan[]
}

export async function assignPlan(
  userId: string,
  planId: string,
  adminUserId: string,
  options: {
    expiresAt?: string | null
    reason?: string
  } = {}
): Promise<void> {
  const supabase = createAdminClient()

  const { data: oldSub } = await supabase
    .from('subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .single()

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: options.expiresAt ?? null,
      provider: 'manual',
    },
    { onConflict: 'user_id' }
  )

  await supabase.from('audit_logs').insert({
    admin_user_id: adminUserId,
    target_user_id: userId,
    action: 'assign_plan',
    old_value: oldSub ? { plan_id: oldSub.plan_id, status: oldSub.status } : null,
    new_value: { plan_id: planId, status: 'active' },
    reason: options.reason ?? null,
  })
}

export async function grantBonusCredits(
  userId: string,
  feature: 'writing_grading' | 'speaking_grading',
  amount: number,
  adminUserId: string,
  options: { reason?: string; expiresAt?: string | null } = {}
): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('bonus_credits').insert({
    user_id: userId,
    feature,
    amount,
    remaining: amount,
    granted_by: adminUserId,
    reason: options.reason ?? null,
    expires_at: options.expiresAt ?? null,
  })

  await supabase.from('audit_logs').insert({
    admin_user_id: adminUserId,
    target_user_id: userId,
    action: 'grant_bonus_credits',
    new_value: { feature, amount },
    reason: options.reason ?? null,
  })
}

export async function setUserStatus(
  userId: string,
  status: 'active' | 'suspended',
  adminUserId: string,
  reason?: string
): Promise<void> {
  const supabase = createAdminClient()

  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('status')
    .eq('user_id', userId)
    .single()

  await supabase.from('profiles').update({ status }).eq('user_id', userId)

  await supabase.from('audit_logs').insert({
    admin_user_id: adminUserId,
    target_user_id: userId,
    action: 'set_user_status',
    old_value: { status: oldProfile?.status },
    new_value: { status },
    reason: reason ?? null,
  })
}
