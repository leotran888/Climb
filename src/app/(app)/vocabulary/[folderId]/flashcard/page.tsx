import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FlashcardClient from './FlashcardClient'

export default async function FlashcardPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: folder }, { data: words }] = await Promise.all([
    supabase.from('vocab_folders').select('*').eq('id', folderId).eq('user_id', user!.id).single(),
    supabase.from('vocab_words').select('id, word, definition, example, status').eq('folder_id', folderId).eq('user_id', user!.id).order('created_at', { ascending: true }),
  ])

  if (!folder) notFound()

  return (
    <div className="max-w-2xl mx-auto pt-4">
      <FlashcardClient
        words={words ?? []}
        folderId={folderId}
        folderName={folder.name}
      />
    </div>
  )
}
