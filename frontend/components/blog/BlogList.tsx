import type { Post } from '@/types'
import BlogCard from './BlogCard'

interface BlogListProps {
  posts: Post[]
  isLoading?: boolean
  error?: string | null
}

export default function BlogList({ posts, isLoading = false, error = null }: BlogListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="font-mono text-[13px]" style={{ color: 'var(--muted)' }}>Loading…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-4 text-[13px] font-mono"
        style={{ background: 'oklch(0.94 0.05 25)', color: 'oklch(0.45 0.15 25)' }}
      >
        Could not load posts: {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
        style={{ border: '1px dashed var(--line)' }}
      >
        <svg className="h-10 w-10" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <p className="font-mono text-[13px]" style={{ color: 'var(--muted)' }}>No posts yet. Come back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <BlogCard key={post.id} post={post} idx={i} />
      ))}
    </div>
  )
}
