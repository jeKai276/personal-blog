import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { ApiResponse } from '@/types'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

interface Stats {
  posts: number
  albums: number
  photos: number
  skills: number
  projects: number
}

const icons: Record<string, React.ReactNode> = {
  'Bài viết': (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Albums: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  'Ảnh': (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Skills: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Projects: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
}

export default async function DashboardPage() {
  let stats: Stats | null = null

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      cache: 'no-store',
      headers: token ? { Cookie: `auth_token=${token}` } : {},
    })
    if (res.ok) {
      const json: ApiResponse<Stats> = await res.json()
      stats = json.data
    }
  } catch {
    // show zeros on error
  }

  const cards = [
    { label: 'Bài viết', value: stats?.posts ?? 0, href: '/admin/blog' },
    { label: 'Albums', value: stats?.albums ?? 0, href: '/admin/photos' },
    { label: 'Ảnh', value: stats?.photos ?? 0, href: '/admin/photos' },
    { label: 'Skills', value: stats?.skills ?? 0, href: '/admin/dashboard' },
    { label: 'Projects', value: stats?.projects ?? 0, href: '/admin/dashboard' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-center transition-[border-color,box-shadow] hover:border-blue-200 hover:shadow-sm"
          >
            <span className="text-gray-400">{icons[card.label]}</span>
            <div className={`text-3xl font-bold ${card.value > 0 ? 'text-blue-500' : 'text-gray-900'}`}>
              {card.value}
            </div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
