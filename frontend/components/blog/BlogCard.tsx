import Link from 'next/link'
import type { Post } from '@/types'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface BlogCardProps {
  post: Post
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border p-5 hover:border-gray-300 transition-colors">
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      )}
      <h2 className="text-lg font-semibold leading-snug">
        <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
      </h2>
      {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
      <p className="mt-auto pt-1 text-xs text-gray-400">{formatDate(post.created_at)}</p>
    </article>
  )
}
