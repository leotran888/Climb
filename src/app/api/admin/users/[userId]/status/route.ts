import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setUserStatus } from '@/lib/subscriptions'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await params
  const { status, reason } = await request.json()

  if (!['active', 'suspended'].includes(status)) {
    return NextResponse.json({ error: 'status must be active or suspended' }, { status: 400 })
  }

  // Prevent admins from suspending themselves
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Cannot change your own status' }, { status: 400 })
  }

  await setUserStatus(userId, status, admin.id, reason)

  return NextResponse.json({ success: true })
}
