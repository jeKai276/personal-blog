'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/about', label: 'Về tôi' },
  { href: '/blog', label: 'Blog' },
  { href: '/photos', label: 'Ảnh' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-800" onClick={() => setOpen(false)}>
          yendp
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-6 sm:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm transition-colors ${pathname === link.href ? 'font-medium text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-1.5 text-gray-500 hover:text-blue-500 sm:hidden"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-blue-100 bg-white/95 sm:hidden">
          <ul className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2.5 text-sm transition-colors ${pathname === link.href ? 'font-medium text-blue-500' : 'text-gray-500'}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
