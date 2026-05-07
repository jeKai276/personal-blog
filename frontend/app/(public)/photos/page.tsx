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
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Khoảnh khắc</p>
        <h1 className="text-4xl font-bold text-gray-900">Ảnh</h1>
        <p className="text-gray-500">Những chuyến đi và cuộc sống hàng ngày.</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Không thể tải albums: {error}
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">Chưa có album nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  )
}
