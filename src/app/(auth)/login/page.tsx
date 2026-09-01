'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      {/* Mascot peeking above the card */}
      <div className="flex justify-center relative z-10 -mb-6">
        <svg width="110" height="100" viewBox="0 0 290 270" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="145" cy="258" rx="115" ry="12" fill="rgba(0,0,0,0.08)"/>
          <path d="M18 242 Q18 90 145 48 Q272 90 272 242 Z" fill="#16a344"/>
          <path d="M18 242 Q18 90 145 48 L145 242Z" fill="rgba(0,0,0,0.07)"/>
          <ellipse cx="145" cy="66" rx="30" ry="18" fill="rgba(255,255,255,0.22)"/>
          <path d="M196 148 L216 148 L216 170 L236 170 L236 193" stroke="rgba(255,255,255,0.38)" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="216" cy="148" r="3" fill="rgba(255,255,255,0.5)"/>
          <circle cx="236" cy="170" r="3" fill="rgba(255,255,255,0.5)"/>
          <ellipse cx="104" cy="185" rx="13" ry="7" fill="rgba(255,255,255,0.12)"/>
          <ellipse cx="186" cy="185" rx="13" ry="7" fill="rgba(255,255,255,0.12)"/>
          <circle cx="118" cy="167" r="14" fill="#0b1e10"/>
          <circle cx="172" cy="167" r="14" fill="#0b1e10"/>
          <circle cx="122" cy="163" r="5" fill="white"/>
          <circle cx="176" cy="163" r="5" fill="white"/>
          <path d="M110 195 Q145 218 180 195" stroke="#0b1e10" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
          <line x1="145" y1="48" x2="145" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M145 26 L162 33 L145 40Z" fill="#f5aa00"/>
        </svg>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 pt-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
        <p className="text-slate-500 mb-8">Log in to continue practising</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-emerald-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-emerald-700 font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
