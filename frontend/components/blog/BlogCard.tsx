import Link from 'next/link'
import type { Post } from '@/types'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface BlogCardProps {
  post: Post
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="brand">{tag}</Badge>
          ))}
        </div>
      )}
      <h2 className="text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-500">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.excerpt && (
        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
        <span className="text-xs font-medium text-blue-400">Đọc thêm →</span>
      </div>
    </article>
  )
}
