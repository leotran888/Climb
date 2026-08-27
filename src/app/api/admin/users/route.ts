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

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createAdminClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const search = searchParams.get('search') ?? ''
  const planFilter = searchParams.get('plan') ?? ''
  const statusFilter = searchParams.get('status') ?? ''

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = db
    .from('profiles')
    .select(`
      id, user_id, full_name, role, status, created_at,
      subscriptions(status, started_at, expires_at, plans(slug, name))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }
  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/users] query error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}
