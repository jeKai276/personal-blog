import type { Metadata } from 'next'
import AlbumCard from '@/components/photo/AlbumCard'
import type { ApiResponse, Album } from '@/types'

export const metadata: Metadata = {
  title: 'Ảnh',
  description: 'Ảnh đi chơi và cuộc sống hàng ngày.',
  openGraph: {
    title: 'Ảnh',
    description: 'Ảnh đi chơi và cuộc sống hàng ngày.',
  },
}
export const dynamic = 'force-dynamic'

const BASE_URL = `${process.env.BACKEND_URL ?? 'http://localhost:8080'}/api/v1`

export default async function PhotosPage() {
  let albums: Album[] = []
  let error: string | null = null

  try {
    const res = await fetch(`${BASE_URL}/albums`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: ApiResponse<Album[]> = await res.json()
    albums = json.data ?? []
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load albums'
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Ảnh</h1>
      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          Không thể tải albums: {error}
        </div>
      ) : albums.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">Chưa có album nào.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {albums.map(album => <AlbumCard key={album.id} album={album} />)}
        </div>
      )}
    </div>
  )
}
