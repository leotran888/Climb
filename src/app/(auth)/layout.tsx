import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="py-5 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="20" height="23" viewBox="0 0 36 42" fill="none">
            <path d="M2 40 L2 32.5 Q2 29 5.5 29 L8.5 29 Q12 29 12 25.5 L12 21.5 Q12 18 15.5 18 L18.5 18 Q22 18 22 14.5 L22 11.5 Q22 8 25.5 8 L34 8"
              stroke="#16a344" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex flex-col gap-0">
            <span className="font-bold text-slate-900 text-lg leading-none tracking-tight">Climb</span>
            <span className="text-[8px] font-semibold tracking-[0.15em] text-emerald-600 leading-none">IELTS</span>
          </div>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
