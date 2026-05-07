import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { ApiResponse, Post } from '@/types'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

function estimateReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(`${BASE_URL}/posts/${slug}`, { cache: 'no-store' })
    if (!res.ok) return { title: 'Bài viết' }
    const json: ApiResponse<Post> = await res.json()
    const post = json.data
    if (!post) return { title: 'Bài viết' }
    return {
      title: post.title,
      description: post.excerpt || undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt || undefined,
        type: 'article',
        publishedTime: post.published_at ?? undefined,
      },
    }
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
    if (err && typeof err === 'object' && 'digest' in err) throw err
    fetchError = err instanceof Error ? err.message : 'Failed to load post'
  }

  if (fetchError) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        Không thể tải bài viết: {fetchError}
      </div>
    )
  }

  if (!post) notFound()

  const readingTime = estimateReadingTime(post.content)

  return (
    <article className="mx-auto max-w-2xl">
      {post.cover_image_url && (
        <div className="mb-8 aspect-video overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={1200}
            height={630}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}

      <header className="mb-8 space-y-4 border-b border-gray-100 pb-8">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="brand">{tag}</Badge>
            ))}
          </div>
        )}
        <h1 className="text-4xl font-bold leading-tight text-gray-900">{post.title}</h1>
        <p className="text-sm text-gray-400">
          {formatDate(post.created_at)} &middot; {readingTime} phút đọc
        </p>
      </header>

      <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
