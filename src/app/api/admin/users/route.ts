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
  const currentPeriod = new Date().toISOString().slice(0, 7)
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Fetch auth users for email lookup
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users ?? []
  const emailMap: Record<string, string> = {}
  for (const u of authUsers) emailMap[u.id] = u.email ?? ''

  // Email search: filter by matching auth users
  let emailMatchIds: string[] | null = null
  if (search && search.includes('@')) {
    emailMatchIds = authUsers
      .filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
      .map(u => u.id)
    if (emailMatchIds.length === 0) {
      return NextResponse.json({ users: [], total: 0, page, limit })
    }
  }

  // Plan filter: resolve to user_ids via subscriptions
  let planMatchIds: string[] | null = null
  if (planFilter) {
    const { data: planRow } = await db.from('plans').select('id').eq('slug', planFilter).single()
    if (planRow) {
      const { data: subs } = await db
        .from('subscriptions')
        .select('user_id')
        .eq('plan_id', planRow.id)
        .eq('status', 'active')
      planMatchIds = (subs ?? []).map(s => s.user_id)
      if (planMatchIds.length === 0) {
        return NextResponse.json({ users: [], total: 0, page, limit })
      }
    }
  }

  let query = db
    .from('profiles')
    .select(
      `id, user_id, full_name, role, status, created_at,
       subscriptions(status, started_at, expires_at, plans(id, slug, name, price, limits))`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search && !search.includes('@')) query = query.ilike('full_name', `%${search}%`)
  if (emailMatchIds) query = query.in('user_id', emailMatchIds)
  if (statusFilter) query = query.eq('status', statusFilter)
  if (planMatchIds) query = query.in('user_id', planMatchIds)

  const { data, count, error } = await query
  if (error) {
    console.error('[admin/users] query error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  // Fetch current month usage for these users
  const userIds = (data ?? []).map(u => u.user_id)
  const usageMap: Record<string, { writing: number; speaking: number }> = {}
  if (userIds.length > 0) {
    const { data: usageRows } = await db
      .from('usage_records')
      .select('user_id, feature')
      .in('user_id', userIds)
      .eq('billing_period', currentPeriod)
    for (const row of usageRows ?? []) {
      if (!usageMap[row.user_id]) usageMap[row.user_id] = { writing: 0, speaking: 0 }
      if (row.feature === 'writing_grading') usageMap[row.user_id].writing++
      else if (row.feature === 'speaking_grading') usageMap[row.user_id].speaking++
    }
  }

  const users = (data ?? []).map(u => ({
    ...u,
    email: emailMap[u.user_id] ?? '',
    usage: usageMap[u.user_id] ?? { writing: 0, speaking: 0 },
  }))

  return NextResponse.json({ users, total: count ?? 0, page, limit })
}
