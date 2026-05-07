'use client'
import { useEffect, useCallback } from 'react'
import type { Photo } from '@/types'

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onChange: (index: number) => void
}

export default function Lightbox({ photos, currentIndex, onClose, onChange }: LightboxProps) {
  const photo = photos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const handlePrev = useCallback(() => {
    if (hasPrev) onChange(currentIndex - 1)
  }, [hasPrev, currentIndex, onChange])

  const handleNext = useCallback(() => {
    if (hasNext) onChange(currentIndex + 1)
  }, [hasNext, currentIndex, onChange])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, handlePrev, handleNext])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 rounded-full p-1 text-white/70 hover:text-white"
        onClick={onClose}
        aria-label="Đóng"
      >
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 hover:text-white"
          onClick={e => { e.stopPropagation(); handlePrev() }}
          aria-label="Ảnh trước"
        >
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || 'Photo'}
          className="max-h-[85vh] max-w-[85vw] object-contain"
        />
        {photo.caption && (
          <p className="mt-3 text-sm text-white/70">{photo.caption}</p>
        )}
      </div>

      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 hover:text-white"
          onClick={e => { e.stopPropagation(); handleNext() }}
          aria-label="Ảnh tiếp"
        >
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/50">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  )
}
