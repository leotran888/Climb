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
    { count: activeSubscriptions },
    { count: currentUsage },
    { count: lastUsage },
    { count: suspendedUsers },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('usage_records').select('*', { count: 'exact', head: true }).eq('billing_period', currentPeriod),
    db.from('usage_records').select('*', { count: 'exact', head: true }).eq('billing_period', lastPeriod),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
  ])

  // Plan distribution
  const { data: planDist } = await db
    .from('subscriptions')
    .select('plan_id, plans(slug, name)')
    .eq('status', 'active')

  const planCounts: Record<string, { name: string; count: number }> = {}
  for (const row of planDist ?? []) {
    const plan = row.plans as unknown as { slug: string; name: string } | null
    if (!plan) continue
    if (!planCounts[plan.slug]) planCounts[plan.slug] = { name: plan.name, count: 0 }
    planCounts[plan.slug].count++
  }

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    currentMonthUsage: currentUsage ?? 0,
    lastMonthUsage: lastUsage ?? 0,
    suspendedUsers: suspendedUsers ?? 0,
    planDistribution: planCounts,
  })
}
