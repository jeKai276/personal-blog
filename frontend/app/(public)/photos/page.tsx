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
    <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 space-y-10">
      <div className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--muted)' }}>
          02 — Photo
        </p>
        <h1
          className="font-serif font-light tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--ink)' }}
        >
          Albums &mdash; quiet places.
        </h1>
        <p className="text-[15px] max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
          Photographs from trips and everyday life.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-xl p-4 text-[13px] font-mono"
          style={{ background: 'oklch(0.94 0.05 25)', color: 'oklch(0.45 0.15 25)' }}
        >
          Could not load albums: {error}
        </div>
      ) : albums.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
          style={{ border: '1px dashed var(--line)' }}
        >
          <svg className="h-10 w-10" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-[13px] font-mono" style={{ color: 'var(--muted)' }}>No albums yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  )
}
