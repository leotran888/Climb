import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'CLIMB — IELTS AI Practice',
  description: 'Know your level. Climb higher. AI-powered IELTS Writing and Speaking practice.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
