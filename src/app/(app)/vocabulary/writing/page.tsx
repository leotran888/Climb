import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WritingVocabClient from './WritingVocabClient'

export default async function WritingVocabPage({
  searchParams,
}: {
  searchParams: Promise<{ highlight?: string }>
}) {
  const { highlight } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plans(slug, features)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const plan = sub?.plans as unknown as { slug: string; features: Record<string, boolean> } | null
  const planSlug: string = plan?.slug ?? 'free'
  const hasWritingVocabFull: boolean = plan?.features?.writing_vocab_full ?? false

  return <WritingVocabClient userId={user.id} planSlug={planSlug} hasWritingVocabFull={hasWritingVocabFull} highlight={highlight} />
}
