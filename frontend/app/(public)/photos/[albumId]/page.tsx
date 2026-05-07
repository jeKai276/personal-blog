import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AlbumGallery from '@/components/photo/AlbumGallery'
import type { ApiResponse, Album } from '@/types'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

interface Props {
  params: Promise<{ albumId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { albumId } = await params
  try {
    const res = await fetch(`${BASE_URL}/albums/${albumId}`, { cache: 'no-store' })
    if (!res.ok) return { title: 'Album' }
    const json: ApiResponse<Album> = await res.json()
    return { title: json.data?.title ?? 'Album' }
  } catch {
    return { title: 'Album' }
  }
}

export default async function AlbumDetailPage({ params }: Props) {
  const { albumId } = await params

  let album: Album | null = null
  let fetchError: string | null = null

  try {
    const res = await fetch(`${BASE_URL}/albums/${albumId}`, { cache: 'no-store' })
    if (res.status === 404) notFound()
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: ApiResponse<Album> = await res.json()
    album = json.data
  } catch (err) {
    // Re-throw Next.js internal navigation errors (notFound, redirect)
    if (err && typeof err === 'object' && 'digest' in err) throw err
    fetchError = err instanceof Error ? err.message : 'Failed to load album'
  }

  if (fetchError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        Không thể tải album: {fetchError}
      </div>
    )
  }

  if (!album) notFound()

  const photos = album.photos ?? []

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{album.title}</h1>
        {album.location && <p className="text-gray-500">{album.location}</p>}
        {album.description && <p className="text-gray-600">{album.description}</p>}
        {album.taken_at && (
          <p className="text-sm text-gray-400">{formatDate(album.taken_at)}</p>
        )}
      </header>
      <AlbumGallery photos={photos} />
    </div>
  )
}
