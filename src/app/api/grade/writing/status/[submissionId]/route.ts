import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership before revealing status
  const { data: submission } = await supabase
    .from('writing_submissions')
    .select('id')
    .eq('id', submissionId)
    .eq('user_id', user.id)
    .single()

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: result } = await supabase
    .from('writing_results')
    .select('id')
    .eq('submission_id', submissionId)
    .single()

  const done = !!result
  return NextResponse.json({
    done,
    status: done ? 'completed' : 'processing',
    submissionId,
  })
}
