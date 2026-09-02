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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        ),
      },
      {
        href: '/writing',
        label: 'Writing',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        ),
      },
      {
        href: '/history',
        label: 'Lịch sử',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        ),
      },
      {
        href: '/vocabulary',
        label: 'Từ vựng',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        ),
      },
      {
        href: '/subscription',
        label: 'Gói của tôi',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar({ name }: { name: string }) {
  const path = usePathname()
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    return path === href || (href !== '/dashboard' && path.startsWith(href))
  }

  const sidebarContent = (
    <>
      {/* Logo + mobile close */}
      <div className="flex items-center justify-between px-3 mb-8">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <ClimbLogo size="sm" />
        </Link>
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Đóng menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Navigation with sections */}
      <nav className="flex-1 overflow-y-auto space-y-5">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 btn-press ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* TÀI KHOẢN — user + logout */}
      <div className="border-t border-slate-100 pt-4 space-y-1 px-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
          TÀI KHOẢN
        </p>
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors duration-150 ${
            path === '/profile' ? 'bg-emerald-50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-emerald-700 font-bold text-xs">{initial}</span>
          </div>
          <span className="text-sm text-slate-600 truncate font-medium">{name}</span>
        </Link>
        <div className="px-2">
          <LogoutButton />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-slate-200"
        style={{ background: '#f5f6f7', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu"
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg width="16" height="19" viewBox="0 0 36 42" fill="none">
            <path d="M2 40 L2 32.5 Q2 29 5.5 29 L8.5 29 Q12 29 12 25.5 L12 21.5 Q12 18 15.5 18 L18.5 18 Q22 18 22 14.5 L22 11.5 Q22 8 25.5 8 L34 8"
              stroke="#16a344" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold text-slate-900 text-base leading-none">Climb</span>
        </Link>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          w-56 shrink-0 flex flex-col py-5 px-3
          transition-transform duration-300 ease-in-out md:transition-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-full md:h-screen md:sticky md:top-0
          overflow-hidden
        `}
        style={{ background: '#f5f6f7', boxShadow: '6px 0 32px rgba(0,0,0,0.28)' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
