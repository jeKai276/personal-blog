import Link from 'next/link'
import type { Album } from '@/types'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/photos/${album.id}`} className="group block space-y-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        <div className="flex h-full items-center justify-center text-gray-400 text-sm">
          {album.title}
        </div>
      </div>
      <p className="font-medium group-hover:underline">{album.title}</p>
      {album.location && <p className="text-sm text-gray-400">{album.location}</p>}
    </Link>
  )
}
