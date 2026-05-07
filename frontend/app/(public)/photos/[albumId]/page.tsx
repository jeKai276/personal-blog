import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AlbumGallery from '@/components/photo/AlbumGallery'
import type { ApiResponse, Album } from '@/types'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

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
    if (err && typeof err === 'object' && 'digest' in err) throw err
    fetchError = err instanceof Error ? err.message : 'Failed to load album'
  }

  if (fetchError) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        Không thể tải album: {fetchError}
      </div>
    )
  }

  if (!album) notFound()

  const photos = album.photos ?? []
  const coverPhoto = photos.find((p) => p.id === album!.cover_photo_id) ?? photos[0]
  const coverUrl = coverPhoto?.url || coverPhoto?.thumbnail_url

  return (
    <div className="space-y-6">
      {/* Cover banner */}
      {coverUrl ? (
        <div className="relative aspect-[3/1] overflow-hidden rounded-2xl">
          <Image
            src={coverUrl}
            alt={album.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h1 className="absolute bottom-5 left-6 text-3xl font-bold text-white drop-shadow">
            {album.title}
          </h1>
        </div>
      ) : (
        <div className="relative flex aspect-[3/1] items-end rounded-2xl bg-gradient-to-r from-blue-100 to-blue-50 px-6 pb-5">
          <h1 className="text-3xl font-bold text-blue-800">{album.title}</h1>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        {album.location && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {album.location}
          </span>
        )}
        {album.taken_at && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(album.taken_at)}
          </span>
        )}
        <span>{photos.length} ảnh</span>
      </div>

      {album.description && (
        <p className="text-gray-600">{album.description}</p>
      )}

      <AlbumGallery photos={photos} />
    </div>
  )
}
