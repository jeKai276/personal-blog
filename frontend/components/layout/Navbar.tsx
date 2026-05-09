'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About me' },
  { href: '/blog', label: 'Blog' },
  { href: '/photos', label: 'Photo' },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Home">
      <span
        className="relative grid place-items-center w-9 h-9 rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, var(--accent) 0%, var(--accent-strong) 90%)',
          boxShadow: '0 0 0 1px var(--line) inset, 0 6px 14px -6px var(--accent-strong)',
        }}
      >
        <span className="block w-2.5 h-2.5 rounded-full" style={{ background: 'var(--paper-2)', opacity: 0.9 }} />
      </span>
      <span className="font-serif text-[20px] tracking-tight leading-none" style={{ color: 'var(--ink)' }}>
        just<span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>.</span>kai
      </span>
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDark = theme === 'dark'

  const activeLabel = NAV_LINKS.find((l) => l.href === pathname)?.label ?? 'Home'
  const [active, setActive] = useState(activeLabel)

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'color-mix(in oklch, var(--paper) 55%, transparent)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* Scroll progress bar */}
      <div className="h-[72px] max-w-[1180px] mx-auto px-6 md:px-10 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const on = active === item.label
            return (
              <button
                key={item.href}
                onClick={() => { setActive(item.label); router.push(item.href) }}
                className="relative px-3.5 py-2 text-[13.5px] tracking-tight rounded-full transition-colors"
                style={{ color: on ? 'var(--ink)' : 'var(--muted)' }}
                onMouseEnter={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)' }}
                onMouseLeave={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
              >
                {item.label}
                {on && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute left-3.5 right-3.5 -bottom-[1px] h-[2px] rounded-full"
                    style={{ background: 'var(--accent-strong)' }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light' : 'Switch to dark'}
            className="grid place-items-center w-9 h-9 rounded-full"
            style={{
              border: '1px solid var(--line)',
              color: 'var(--ink-2)',
              background: 'color-mix(in oklch, var(--paper-2) 55%, transparent)',
            }}
          >
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>

          {/* Admin button */}
          <Link
            href="/admin/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 h-9 text-[13px] rounded-full font-medium"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden grid place-items-center w-9 h-9 rounded-full"
            style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid var(--line)' }}
          >
            <ul className="flex flex-col px-6 py-3 gap-1">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => { setActive(item.label); setMobileOpen(false) }}
                    className="block py-2.5 text-[14px] transition-colors"
                    style={{
                      color: pathname === item.href ? 'var(--ink)' : 'var(--muted)',
                      fontWeight: pathname === item.href ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
