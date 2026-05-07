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
        <span className="text-sm text-gray-500">Đang tải...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        Không thể tải bài viết: {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
        <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Chưa có bài viết nào</p>
        <p className="text-xs text-gray-400">Quay lại sau nhé!</p>
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
