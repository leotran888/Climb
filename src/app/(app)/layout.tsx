import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-700">CLIMB</Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">Dashboard</Link>
              <Link href="/writing" className="text-slate-600 hover:text-slate-900 transition-colors">Writing</Link>
              <Link href="/history" className="text-slate-600 hover:text-slate-900 transition-colors">History</Link>
              {profile?.role === 'teacher' && (
                <Link href="/teacher" className="text-slate-600 hover:text-slate-900 transition-colors">Teacher</Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:block">{profile?.full_name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
