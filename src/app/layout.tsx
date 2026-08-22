import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

export const metadata: Metadata = {
  title: 'CLIMB — IELTS AI Practice',
  description: 'Know your level. Climb higher. AI-powered IELTS Writing and Speaking practice.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${outfit.variable} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
