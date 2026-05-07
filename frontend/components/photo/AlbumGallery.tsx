'use client'
import { useState } from 'react'
import PhotoGrid from '@/components/photo/PhotoGrid'
import Lightbox from '@/components/photo/Lightbox'
import type { Photo } from '@/types'

interface AlbumGalleryProps {
  photos: Photo[]
}

export default function AlbumGallery({ photos }: AlbumGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <PhotoGrid photos={photos} onPhotoClick={setLightboxIndex} />
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </>
  )
}
