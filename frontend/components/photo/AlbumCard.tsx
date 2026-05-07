import Link from 'next/link'
import Image from 'next/image'
import type { Album } from '@/types'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const coverPhoto = album.photos?.find(p => p.id === album.cover_photo_id) ?? album.photos?.[0]
  const thumb = coverPhoto?.thumbnail_url || coverPhoto?.url

  return (
    <Link href={`/photos/${album.id}`} className="group block space-y-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        {thumb ? (
          <Image
            src={thumb}
            alt={album.title}
            width={400}
            height={400}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {album.title}
          </div>
        )}
      </div>
      <p className="font-medium group-hover:underline">{album.title}</p>
      {album.location && <p className="text-sm text-gray-400">{album.location}</p>}
    </Link>
  )
}
