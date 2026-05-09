import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { ApiResponse, Post } from '@/types'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import PostNavigation from '@/components/blog/PostNavigation'

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
      <div
        className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 rounded-xl text-[13px] font-mono"
        style={{ background: 'oklch(0.94 0.05 25)', color: 'oklch(0.45 0.15 25)' }}
      >
        Could not load post: {fetchError}
      </div>
    )
  }

  if (!post) notFound()

  const readingTime = estimateReadingTime(post.content)

  return (
    <article className="max-w-[720px] mx-auto px-6 md:px-10 py-16">
      {post.cover_image_url && (
        <div className="mb-10 aspect-video overflow-hidden rounded-2xl sm:aspect-[21/9]">
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

      <header className="mb-10 space-y-5 pb-10" style={{ borderBottom: '1px solid var(--line)' }}>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
                style={{ color: 'var(--accent-strong)', background: 'var(--accent-soft)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1
          className="font-serif font-light tracking-tight leading-[1.08]"
          style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', color: 'var(--ink)' }}
        >
          {post.title}
        </h1>
        <p className="font-mono text-[12px]" style={{ color: 'var(--muted)' }}>
          {formatDate(post.created_at)} &middot; {readingTime} min read
        </p>
      </header>

      <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <PostNavigation currentSlug={post.slug} />
    </article>
  )
}
