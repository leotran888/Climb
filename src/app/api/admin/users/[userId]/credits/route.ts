import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { grantBonusCredits } from '@/lib/subscriptions'

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params
  const { feature, amount, reason, expiresAt } = await request.json()

  if (!feature || !amount || amount < 1) {
    return NextResponse.json({ error: 'feature and amount (≥1) are required' }, { status: 400 })
  }
  if (!['writing_grading', 'speaking_grading'].includes(feature)) {
    return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
  }

  await grantBonusCredits(userId, feature, amount, admin.id, { reason, expiresAt })

  return NextResponse.json({ success: true })
}
