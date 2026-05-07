'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Album, ApiResponse } from '@/types'

export default function AdminPhotosPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newTakenAt, setNewTakenAt] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function load() {
    try {
      const res = await api.get<ApiResponse<Album[]>>('/albums')
      setAlbums(res.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải albums')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setIsCreating(true)
    try {
      const res = await api.post<ApiResponse<Album>>('/admin/albums', {
        title: newTitle,
        location: newLocation,
        taken_at: newTakenAt,
      })
      setAlbums(prev => [res.data, ...prev])
      setShowCreate(false)
      setNewTitle('')
      setNewLocation('')
      setNewTakenAt('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Tạo album thất bại')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Xóa album này? Ảnh trong album sẽ bị xóa khỏi database.')) return
    try {
      await api.delete(`/admin/albums/${id}`)
      setAlbums(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Xóa thất bại')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Albums</h1>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          {showCreate ? 'Hủy' : 'Tạo album'}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-lg border bg-white p-4"
        >
          <h2 className="font-medium">Album mới</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Tên album *</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Địa điểm</label>
              <input
                type="text"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ngày chụp</label>
              <input
                type="date"
                value={newTakenAt}
                onChange={e => setNewTakenAt(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {isCreating ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Đang tải...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : albums.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có album nào.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map(album => (
            <div
              key={album.id}
              className="rounded-lg border bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/admin/photos/${album.id}`}
                    className="font-medium hover:underline"
                  >
                    {album.title}
                  </Link>
                  {album.location && (
                    <p className="mt-0.5 text-xs text-gray-500">{album.location}</p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">{formatDate(album.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(album.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
              <div className="mt-3">
                <Link
                  href={`/admin/photos/${album.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Quản lý ảnh →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
