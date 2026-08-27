import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-900">
              <svg width="16" height="19" viewBox="0 0 36 42" fill="none">
                <path d="M2 40 L2 32.5 Q2 29 5.5 29 L8.5 29 Q12 29 12 25.5 L12 21.5 Q12 18 15.5 18 L18.5 18 Q22 18 22 14.5 L22 11.5 Q22 8 25.5 8 L34 8"
                  stroke="#16a344" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Climb Admin</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/admin" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Overview
              </Link>
              <Link href="/admin/users" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Users
              </Link>
              <Link href="/admin/plans" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Plans
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{profile?.full_name}</span>
            <Link href="/dashboard" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              ← App
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
