import Link from 'next/link'
import type { Post } from '@/types'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface BlogCardProps {
  post: Post
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="space-y-2 border-b pb-6">
      <div className="flex flex-wrap gap-1">
        {post.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
      </div>
      <h2 className="text-xl font-semibold">
        <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
      </h2>
      {post.excerpt && <p className="text-gray-500">{post.excerpt}</p>}
      <p className="text-sm text-gray-400">{formatDate(post.created_at)}</p>
    </article>
  )
}
