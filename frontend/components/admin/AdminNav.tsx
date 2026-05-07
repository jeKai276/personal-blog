'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/photos', label: 'Photos' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      await api.post('/auth/logout', {})
    } finally {
      router.push('/admin/login')
    }
  }

  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900">Admin</span>
          <nav className="flex gap-4 text-sm">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname.startsWith(link.href)
                    ? 'font-medium text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
