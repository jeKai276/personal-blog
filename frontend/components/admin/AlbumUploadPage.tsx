'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import type { Album, Photo, ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

interface Props {
  albumId: number
}

interface UploadStatus {
  name: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function AlbumUploadPage({ albumId }: Props) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploads, setUploads] = useState<UploadStatus[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    try {
      const res = await api.get<ApiResponse<Album>>(`/albums/${albumId}`)
      const data = res.data
      setAlbum(data)
      setPhotos(data.photos ?? [])
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [albumId])

  async function handleFiles(files: FileList) {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return

    const statuses: UploadStatus[] = arr.map(f => ({ name: f.name, status: 'pending' }))
    setUploads(statuses)

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      setUploads(prev => prev.map((u, j) => j === i ? { ...u, status: 'uploading' } : u))

      try {
        // 1. Get R2 presigned URL
        const presignRes = await api.post<ApiResponse<{ upload_url: string; key: string }>>(
          '/admin/upload/presigned-r2-url',
          { filename: file.name, content_type: file.type }
        )
        const { upload_url, key } = presignRes.data

        // 2. Upload directly to R2 via presigned URL
        const uploadRes = await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })
        if (!uploadRes.ok) throw new Error(`R2 upload failed: ${uploadRes.status}`)

        // 3. Get dimensions
        const { width, height } = await getImageDimensions(file).catch(() => ({ width: 0, height: 0 }))

        // 4. Save metadata
        const photoRes = await api.post<ApiResponse<Photo>>(
          `/admin/albums/${albumId}/photos`,
          { url: key, width, height, size_bytes: file.size }
        )

        setPhotos(prev => [...prev, photoRes.data])
        setUploads(prev => prev.map((u, j) => j === i ? { ...u, status: 'done' } : u))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload thất bại'
        setUploads(prev => prev.map((u, j) => j === i ? { ...u, status: 'error', error: msg } : u))
      }
    }
  }

  async function handleDeletePhoto(photoId: number) {
    if (!confirm('Xóa ảnh này?')) return
    try {
      await api.delete(`/admin/photos/${photoId}`)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch {
      alert('Xóa thất bại')
    }
  }

  if (isLoading) return <p className="text-sm text-gray-400">Đang tải...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/photos" className="text-sm text-gray-500 hover:text-gray-900">
          ← Albums
        </Link>
        <h1 className="text-2xl font-bold">{album?.title ?? `Album #${albumId}`}</h1>
      </div>

      {album?.location && <p className="text-sm text-gray-500">{album.location}</p>}

      {/* Upload zone */}
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
        }}
      >
        <p className="text-sm text-gray-500">Kéo ảnh vào đây hoặc click để chọn</p>
        <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP, GIF</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="space-y-1">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={
                u.status === 'done' ? 'text-green-600' :
                u.status === 'error' ? 'text-red-600' :
                u.status === 'uploading' ? 'text-blue-600' :
                'text-gray-400'
              }>
                {u.status === 'done' ? '✓' :
                 u.status === 'error' ? '✗' :
                 u.status === 'uploading' ? '↑' : '…'}
              </span>
              <span className="text-gray-700">{u.name}</span>
              {u.error && <span className="text-xs text-red-500">{u.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có ảnh nào.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {photos.map(photo => (
            <div key={photo.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={photo.thumbnail_url || photo.url}
                  alt={photo.caption || 'Photo'}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute right-1 top-1 hidden rounded bg-red-500 px-1 py-0.5 text-xs text-white group-hover:block"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
