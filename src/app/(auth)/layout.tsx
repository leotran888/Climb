import type { Metadata } from 'next'
import Link from 'next/link'
import ClimbLogo from '@/components/ClimbLogo'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="py-5 px-6">
        <Link href="/"><ClimbLogo /></Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
