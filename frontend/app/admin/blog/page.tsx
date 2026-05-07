import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Quản lý bài viết' }

export default function AdminBlogPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài viết</h1>
        <Link href="/admin/blog/new" className="rounded bg-gray-900 px-4 py-2 text-sm text-white">
          Viết bài mới
        </Link>
      </div>
      <p className="text-gray-500">Danh sách bài viết sẽ được load từ API.</p>
    </div>
  )
}
