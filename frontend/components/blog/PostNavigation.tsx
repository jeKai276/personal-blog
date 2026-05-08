import Link from 'next/link'
import type { ApiResponse, Post, PostsListData } from '@/types'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

async function getAllPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BASE_URL}/posts?limit=200`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: ApiResponse<PostsListData> = await res.json()
    return json.data?.posts ?? []
  } catch {
    return []
  }
}

export default async function PostNavigation({ currentSlug }: { currentSlug: string }) {
  const posts = await getAllPosts()
  const idx = posts.findIndex((p) => p.slug === currentSlug)
  if (idx === -1 || posts.length < 2) return null

  const prev = idx < posts.length - 1 ? posts[idx + 1] : null
  const next = idx > 0 ? posts[idx - 1] : null

  return (
    <nav className="mt-12 grid grid-cols-1 gap-3 border-t border-gray-100 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-2xl border border-gray-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            ← Bài trước
          </span>
          <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col gap-1 rounded-2xl border border-gray-200 p-4 text-right transition-colors hover:border-blue-200 hover:bg-blue-50 sm:col-start-2"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Bài sau →
          </span>
          <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
