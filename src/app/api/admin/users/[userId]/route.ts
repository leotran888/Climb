import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params
  const db = createAdminClient()
  const billingPeriod = new Date().toISOString().slice(0, 7)

  const [
    { data: profile },
    { data: subscription },
    { data: usageRows },
    { data: bonusCredits },
    { data: auditLogs },
  ] = await Promise.all([
    db.from('profiles').select('*').eq('user_id', userId).single(),
    db.from('subscriptions').select('*, plans(*)').eq('user_id', userId).single(),
    db.from('usage_records').select('feature').eq('user_id', userId).eq('billing_period', billingPeriod),
    db.from('bonus_credits').select('*').eq('user_id', userId).gt('remaining', 0).order('created_at', { ascending: false }),
    db.from('audit_logs').select('*').eq('target_user_id', userId).order('created_at', { ascending: false }).limit(20),
  ])

  const writingUsage = usageRows?.filter(r => r.feature === 'writing_grading').length ?? 0
  const speakingUsage = usageRows?.filter(r => r.feature === 'speaking_grading').length ?? 0

  return NextResponse.json({
    profile,
    subscription,
    currentMonthUsage: { writing: writingUsage, speaking: speakingUsage },
    bonusCredits: bonusCredits ?? [],
    auditLogs: auditLogs ?? [],
  })
}
