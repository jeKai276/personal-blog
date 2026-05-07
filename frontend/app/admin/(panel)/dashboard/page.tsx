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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border bg-white p-4 text-center hover:border-gray-300"
          >
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="mt-1 text-sm text-gray-500">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
