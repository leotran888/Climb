import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserEntitlements } from '@/lib/entitlement'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [subscription, entitlements] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .single()
      .then(r => r.data),
    getUserEntitlements(user.id),
  ])

  return NextResponse.json({ subscription, entitlements })
}
