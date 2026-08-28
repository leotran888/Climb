import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WritingVocabClient from './WritingVocabClient'

export default async function WritingVocabPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <WritingVocabClient userId={user.id} />
}
