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
    <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 space-y-10">
      <div className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--muted)' }}>
          ✦ — Writing
        </p>
        <h1
          className="font-serif font-light tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--ink)' }}
        >
          Letters from the desk.
        </h1>
        <p className="text-[15px] max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
          Notes on code, backend engineering, and slow life.
        </p>
      </div>

      {allTags.length > 0 && (
        <TagFilter tags={allTags} selected={selectedTag ?? null} />
      )}

      <BlogList posts={filteredPosts} error={error} />
    </div>
  )
}
