import Image from 'next/image'
import type { Photo } from '@/types'

interface PhotoGridProps {
  photos: Photo[]
  isLoading?: boolean
  error?: string | null
  onPhotoClick?: (index: number) => void
}

export default function PhotoGrid({ photos, isLoading = false, error = null, onPhotoClick }: PhotoGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-gray-500">Đang tải ảnh...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        Không thể tải ảnh: {error}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">Chưa có ảnh nào trong album này.</div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`group relative overflow-hidden rounded-lg bg-gray-100 ${onPhotoClick ? 'cursor-pointer' : ''}`}
          onClick={() => onPhotoClick?.(index)}
        >
          <div className="relative aspect-square">
            <Image
              src={photo.thumbnail_url || photo.url}
              alt={photo.caption || 'Photo'}
              fill
              className="object-cover transition duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          </div>
          {photo.caption && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-1.5 text-xs text-white transition-transform group-hover:translate-y-0">
              {photo.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
