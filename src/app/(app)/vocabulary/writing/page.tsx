import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WritingVocabClient from './WritingVocabClient'

export default async function WritingVocabPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plans(slug)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const planSlug: string = (sub?.plans as unknown as { slug: string } | null)?.slug ?? 'free'

  return <WritingVocabClient userId={user.id} planSlug={planSlug} />
}
