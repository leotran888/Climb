'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import ClimbLogo from './ClimbLogo'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/writing',
    label: 'Writing',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Lịch sử',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    href: '/vocabulary',
    label: 'Từ vựng',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Tiến độ',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: '/subscription',
    label: 'Gói của tôi',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

export default function Sidebar({ name }: { name: string }) {
  const path = usePathname()
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 mb-7">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <ClimbLogo size="sm" darkMode />
        </Link>
        <button
          className="md:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Đóng menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {NAV.map(item => {
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                active
                  ? 'bg-[#16a344] text-white'
                  : 'text-white/55 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pt-4 mt-2 border-t border-white/10 space-y-1">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors duration-150 ${
            path === '/profile' ? 'bg-[#16a344]' : 'hover:bg-white/10'
          }`}
        >
          <div className="w-7 h-7 bg-[#16a344] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs">{initial}</span>
          </div>
          <span className="text-sm text-white/70 truncate font-semibold">{name}</span>
        </Link>
        <div className="px-1">
          <LogoutButton />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/10"
        style={{ background: '#1b3621' }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu"
          className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link href="/dashboard">
          <ClimbLogo size="sm" darkMode />
        </Link>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          w-56 shrink-0 flex flex-col py-5
          transition-transform duration-300 ease-in-out md:transition-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-full md:h-screen md:sticky md:top-0
          overflow-hidden
        `}
        style={{ background: '#1b3621' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
