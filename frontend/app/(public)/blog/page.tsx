import type { Metadata } from 'next'
import BlogList from '@/components/blog/BlogList'
import type { ApiResponse, PostsListData, Post } from '@/types'

export const metadata: Metadata = { title: 'Blog' }
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

export default async function BlogListPage() {
  let posts: Post[] = []
  let error: string | null = null

  try {
    const res = await fetch(`${BASE_URL}/posts`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: ApiResponse<PostsListData> = await res.json()
    posts = json.data?.posts ?? []
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load posts'
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <BlogList posts={posts} error={error} />
    </div>
  )
}
