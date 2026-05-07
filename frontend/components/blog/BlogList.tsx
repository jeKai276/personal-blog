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
        <span className="text-sm text-gray-500">Loading posts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        Failed to load posts: {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">
        No posts yet. Check back soon!
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  )
}
