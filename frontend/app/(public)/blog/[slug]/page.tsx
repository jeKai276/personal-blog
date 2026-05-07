import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ApiResponse, Post } from '@/types'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(`${BASE_URL}/posts/${slug}`, { cache: 'no-store' })
    if (!res.ok) return { title: 'Bài viết' }
    const json: ApiResponse<Post> = await res.json()
    return { title: json.data?.title ?? 'Bài viết' }
  } catch {
    return { title: 'Bài viết' }
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params

  let post: Post | null = null
  let fetchError: string | null = null

  try {
    const res = await fetch(`${BASE_URL}/posts/${slug}`, { cache: 'no-store' })
    if (res.status === 404) notFound()
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: ApiResponse<Post> = await res.json()
    post = json.data
  } catch (err) {
    // Re-throw Next.js internal navigation errors (notFound, redirect)
    if (err && typeof err === 'object' && 'digest' in err) throw err
    fetchError = err instanceof Error ? err.message : 'Failed to load post'
  }

  if (fetchError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        Không thể tải bài viết: {fetchError}
      </div>
    )
  }

  if (!post) notFound()

  return (
    <article className="space-y-6">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-400">{formatDate(post.created_at)}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
