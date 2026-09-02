'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import ClimbLogo from './ClimbLogo'

const SECTIONS = [
  {
    label: 'LUYỆN TẬP',
    items: [
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
        label: 'Writing AI',
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
    ],
  },
  {
    label: 'THEO DÕI',
    items: [
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
    ],
  },
]

const PROFILE_ITEM = {
  href: '/profile',
  label: 'Hồ sơ',
  icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export default function Sidebar({
  name,
  plan,
  band,
}: {
  name: string
  plan?: string
  band?: number | null
}) {
  const path = usePathname()
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    return path === href || (href !== '/dashboard' && path.startsWith(href))
  }

  function navLink(item: { href: string; label: string; icon: React.ReactNode }, onClick: () => void) {
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
          active
            ? 'text-white'
            : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
        style={active ? {
          background: '#16a344',
          boxShadow: '0 2px 8px rgba(22,163,68,0.35)',
        } : undefined}
      >
        <span className="shrink-0">{item.icon}</span>
        {item.label}
      </Link>
    )
  }

  const subtitle = [plan, band != null ? `Band ${band}` : null].filter(Boolean).join(' · ')

  const sidebarContent = (
    <>
      {/* Logo + mobile close */}
      <div className="flex items-center justify-between px-3 mb-8">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <ClimbLogo size="sm" dark />
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

      {/* Navigation with sections */}
      <nav className="flex-1 overflow-y-auto space-y-6">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => navLink(item, () => setMobileOpen(false)))}
            </div>
          </div>
        ))}

        {/* TÀI KHOẢN */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            TÀI KHOẢN
          </p>
          <div className="space-y-0.5">
            {navLink(PROFILE_ITEM, () => setMobileOpen(false))}
          </div>
        </div>
      </nav>

      {/* User info + logout */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
            style={{ background: '#16a344' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{name}</p>
            {subtitle && (
              <p className="text-[10px] font-medium truncate leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="px-2 mt-1">
          <div className="[&_button]:text-white/40 [&_button]:hover:text-white/70 [&_button]:text-xs [&_button]:transition-colors">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: '#1b3621', borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
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
        <ClimbLogo size="sm" dark />
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
          w-56 shrink-0 flex flex-col py-5 px-3
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
