import type { Metadata } from 'next'
import BlogList from '@/components/blog/BlogList'
import TagFilter from '@/components/blog/TagFilter'
import type { ApiResponse, PostsListData, Post } from '@/types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Bài viết về code, backend, frontend và cuộc sống hàng ngày.',
  openGraph: {
    title: 'Blog',
    description: 'Bài viết về code, backend, frontend và cuộc sống hàng ngày.',
  },
}
export const dynamic = 'force-dynamic'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

interface Props {
  searchParams: Promise<{ tag?: string }>
}

export default async function BlogListPage({ searchParams }: Props) {
  const { tag: selectedTag } = await searchParams

  let posts: Post[] = []
  let error: string | null = null

  try {
    const res = await fetch(`${BASE_URL}/posts?limit=100`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: ApiResponse<PostsListData> = await res.json()
    posts = json.data?.posts ?? []
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load posts'
  }

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()
  const filteredPosts = selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Viết lách</p>
        <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
        <p className="text-gray-500">Bài viết về code, backend, frontend và cuộc sống hàng ngày.</p>
      </div>

      {allTags.length > 0 && (
        <TagFilter tags={allTags} selected={selectedTag ?? null} />
      )}

      <BlogList posts={filteredPosts} error={error} />
    </div>
  )
}
