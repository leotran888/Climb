import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-[#d8dce0]">
      <Sidebar name={profile?.full_name ?? ''} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-5xl w-full mx-auto px-8 py-4 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
