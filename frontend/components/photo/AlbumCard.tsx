import Link from 'next/link'
import Image from 'next/image'
import type { Album } from '@/types'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const coverPhoto = album.photos?.find((p) => p.id === album.cover_photo_id) ?? album.photos?.[0]
  const thumb = coverPhoto?.thumbnail_url || coverPhoto?.url
  const photoCount = album.photos?.length

  return (
    <Link href={`/photos/${album.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50">
        {thumb ? (
          <Image
            src={thumb}
            alt={album.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-blue-300">
            {album.title}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Photo count badge */}
        {photoCount !== undefined && (
          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
            {photoCount} ảnh
          </span>
        )}
      </div>

      <div className="mt-3 space-y-0.5">
        <p className="font-semibold text-gray-900 transition-colors group-hover:text-blue-500">
          {album.title}
        </p>
        {album.location && (
          <p className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {album.location}
          </p>
        )}
      </div>
    </Link>
  )
}
