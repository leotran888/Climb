'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import ClimbLogo from './ClimbLogo'

const PRACTICE_NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/writing',
    label: 'Writing AI',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Lịch sử',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    href: '/vocabulary',
    label: 'Từ vựng',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
]

const TRACKING_NAV = [
  {
    href: '/progress',
    label: 'Tiến độ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: '/subscription',
    label: 'Gói của tôi',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

function SbSection({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,.28)',
      padding: '0 18px', marginTop: 20, marginBottom: 4,
    }}>
      {label}
    </p>
  )
}

function SbLink({ href, label, icon, active, onClick }: {
  href: string; label: string; icon: React.ReactNode; active: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', margin: '1px 10px',
        borderRadius: 12,
        fontSize: 13, fontWeight: 700,
        color: active ? '#fff' : 'rgba(255,255,255,.55)',
        background: active ? '#16a344' : 'transparent',
        textDecoration: 'none',
        transition: 'all .15s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.09)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{icon}</span>
      {label}
    </Link>
  )
}

export default function Sidebar({ name }: { name: string }) {
  const path = usePathname()
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/dashboard'
      ? path === href
      : path === href || path.startsWith(href + '/')

  const close = () => setMobileOpen(false)

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 24px' }}>
        <Link href="/dashboard" onClick={close}>
          <ClimbLogo size="sm" darkMode />
        </Link>
        <button
          className="md:hidden"
          onClick={close}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 6, borderRadius: 8 }}
          aria-label="Đóng menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <SbSection label="Luyện tập" />
        {PRACTICE_NAV.map(item => (
          <SbLink key={item.href} {...item} active={isActive(item.href)} onClick={close} />
        ))}

        <SbSection label="Theo dõi" />
        {TRACKING_NAV.map(item => (
          <SbLink key={item.href} {...item} active={isActive(item.href)} onClick={close} />
        ))}

        <SbSection label="Tài khoản" />
        <SbLink
          href="/profile" label="Hồ sơ" active={isActive('/profile')} onClick={close}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="9" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
            </svg>
          }
        />
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px 10px 0', marginTop: 8, borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <Link
          href="/profile"
          onClick={close}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 8px', borderRadius: 12,
            textDecoration: 'none',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#16a344', color: '#fff',
            fontSize: 13, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{initial}</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        </Link>
        <div style={{ padding: '0 8px' }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: '#1b3621', borderBottom: '1px solid rgba(255,255,255,.08)' }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', padding: 6, borderRadius: 8 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link href="/dashboard"><ClimbLogo size="sm" darkMode /></Link>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          w-56 shrink-0
          transition-transform duration-300 ease-in-out md:transition-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-full md:h-screen md:sticky md:top-0
          overflow-hidden
        `}
        style={{ background: '#1b3621', padding: '24px 0' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
