import type { Metadata } from 'next'
import Link from 'next/link'
import BlogCard from '@/components/blog/BlogCard'
import type { ApiResponse, Post, PostsListData } from '@/types'

export const metadata: Metadata = {
  title: 'Yen | Backend Developer',
  description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  openGraph: {
    title: 'Yen | Backend Developer',
    description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  },
}

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

async function fetchRecentPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BASE_URL}/posts?limit=3&page=1`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<PostsListData> = await res.json()
    return json.data?.posts ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const recentPosts = await fetchRecentPosts()

  return (
    <div className="space-y-16">
      <section className="space-y-4 py-8">
        <h1 className="text-4xl font-bold">Xin chào, tôi là Yen</h1>
        <p className="text-lg text-gray-600">
          Backend developer, đang học frontend. Tôi viết về code, chia sẻ ảnh đi chơi và cuộc sống hàng ngày.
        </p>
        <div className="flex gap-4">
          <Link href="/about" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
            Về tôi
          </Link>
          <Link href="/blog" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Đọc blog
          </Link>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bài viết gần đây</h2>
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </section>
      )}
    </div>
  )
}
