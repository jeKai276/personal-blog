'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Album } from '@/types'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const [hover, setHover] = useState(false)
  const coverPhoto = album.photos?.find((p) => p.id === album.cover_photo_id) ?? album.photos?.[0]
  const thumb = coverPhoto?.thumbnail_url || coverPhoto?.url
  const photoCount = album.photos?.length ?? 0

  return (
    <Link
      href={`/photos/${album.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative block rounded-2xl overflow-hidden"
      style={{
        background: 'var(--paper-2)',
        border: `1px solid ${hover ? 'color-mix(in oklch, var(--accent-strong) 30%, var(--line))' : 'var(--line)'}`,
        boxShadow: hover
          ? '0 22px 44px -22px rgba(14,19,26,.22)'
          : '0 1px 0 rgba(255,255,255,.5) inset',
        transition: 'box-shadow .4s, border-color .4s',
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-700"
          style={{ transform: hover ? 'scale(1.04)' : 'scale(1)' }}
        >
          {thumb ? (
            <Image
              src={thumb}
              alt={album.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <AlbumPlaceholder title={album.title} />
          )}
        </div>

        {/* Photo count chip */}
        {photoCount > 0 && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10.5px] font-mono tracking-wider"
            style={{
              background: 'color-mix(in oklch, var(--paper-2) 70%, transparent)',
              backdropFilter: 'blur(8px)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
            }}
          >
            {photoCount} photos
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 pt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-[18px] leading-snug truncate" style={{ color: 'var(--ink)' }}>
            {album.title}
          </h3>
          {album.location && (
            <div className="mt-1 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
              {album.location}
              {album.taken_at && <> &middot; {new Date(album.taken_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>}
            </div>
          )}
        </div>
        <span
          className="shrink-0 grid place-items-center w-9 h-9 rounded-full transition-all"
          style={{
            background: hover ? 'var(--accent)' : 'transparent',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

function AlbumPlaceholder({ title }: { title: string }) {
  return (
    <div
      className="w-full h-full flex items-end p-4"
      style={{
        background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--paper-2) 100%)',
      }}
    >
      <span className="font-mono text-[11px] tracking-wider" style={{ color: 'var(--muted)' }}>
        // {title}
      </span>
    </div>
  )
}
