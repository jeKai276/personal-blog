import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/about', label: 'Về tôi' },
  { href: '/blog', label: 'Blog' },
  { href: '/photos', label: 'Ảnh' },
]

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">yendp</Link>
        <ul className="flex gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
