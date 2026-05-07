'use client'
import { useEffect, useCallback, useRef } from 'react'
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
  const touchStartX = useRef<number | null>(null)

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

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (delta > 50) handlePrev()
    else if (delta < -50) handleNext()
  }

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Counter — top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Close button */}
      <button
        className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
        onClick={onClose}
        aria-label="Đóng"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev button */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
          onClick={(e) => { e.stopPropagation(); handlePrev() }}
          aria-label="Ảnh trước"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || 'Photo'}
          className="max-h-[85vh] max-w-[90vw] object-contain"
        />
      </div>

      {/* Next button */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
          onClick={(e) => { e.stopPropagation(); handleNext() }}
          aria-label="Ảnh tiếp"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Caption — bottom gradient */}
      {photo.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-6 text-center text-sm text-white/90">
          {photo.caption}
        </div>
      )}
    </div>
  )
}
