import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

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
    <div className="flex h-screen bg-[#f3f8f4]">
      <Sidebar name={profile?.full_name ?? ''} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 pt-16 md:pt-6 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
