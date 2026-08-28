import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createAdminClient()
  const now = new Date()
  const currentPeriod = now.toISOString().slice(0, 7)
  const lastPeriod = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)

  const [
    { count: totalUsers },
    { count: suspendedUsers },
    { data: currentUsageRows },
    { data: lastUsageRows },
    { data: subscriptions },
    { data: bonusRows },
    { data: recentLogs },
    { data: onlineData },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    db.from('usage_records').select('feature').eq('billing_period', currentPeriod),
    db.from('usage_records').select('feature').eq('billing_period', lastPeriod),
    db.from('subscriptions').select('status, user_id, plans(slug, name, price)').eq('status', 'active'),
    db.from('bonus_credits').select('remaining').gt('remaining', 0),
    db.from('audit_logs')
      .select('id, action, reason, created_at, admin_user_id, target_user_id')
      .order('created_at', { ascending: false })
      .limit(10),
    db.rpc('count_online_users', { minutes_ago: 15 }),
  ])

  // Usage breakdown
  const writingThisMonth = currentUsageRows?.filter(r => r.feature === 'writing_grading').length ?? 0
  const speakingThisMonth = currentUsageRows?.filter(r => r.feature === 'speaking_grading').length ?? 0
  const writingLastMonth = lastUsageRows?.filter(r => r.feature === 'writing_grading').length ?? 0
  const speakingLastMonth = lastUsageRows?.filter(r => r.feature === 'speaking_grading').length ?? 0

  // Plan distribution + revenue
  const planCounts: Record<string, { name: string; count: number; price: number }> = {}
  let estimatedMRR = 0
  let paidSubscribers = 0

  for (const row of subscriptions ?? []) {
    const plan = row.plans as unknown as { slug: string; name: string; price: number } | null
    if (!plan) continue
    if (!planCounts[plan.slug]) planCounts[plan.slug] = { name: plan.name, count: 0, price: plan.price }
    planCounts[plan.slug].count++
    if (plan.slug !== 'free' && plan.price > 0) {
      estimatedMRR += plan.price
      paidSubscribers++
    }
  }

  // Bonus credits total
  const totalBonusCreditsRemaining = bonusRows?.reduce((sum, r) => sum + (r.remaining ?? 0), 0) ?? 0

  // Recent audit logs — resolve admin names
  const adminIds = [...new Set((recentLogs ?? []).map(l => l.admin_user_id).filter(Boolean))]
  const adminNames: Record<string, string> = {}
  if (adminIds.length > 0) {
    const { data: adminProfiles } = await db
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', adminIds)
    for (const p of adminProfiles ?? []) adminNames[p.user_id] = p.full_name
  }

  const recentActivity = (recentLogs ?? []).map(l => ({
    id: l.id,
    action: l.action,
    reason: l.reason,
    created_at: l.created_at,
    admin_name: adminNames[l.admin_user_id] ?? 'System',
    target_user_id: l.target_user_id,
  }))

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    suspendedUsers: suspendedUsers ?? 0,
    onlineUsers: (onlineData as unknown as number) ?? 0,
    paidSubscribers,
    writingThisMonth,
    speakingThisMonth,
    writingLastMonth,
    speakingLastMonth,
    totalBonusCreditsRemaining,
    estimatedMRR,
    planDistribution: planCounts,
    recentActivity,
  })
}
