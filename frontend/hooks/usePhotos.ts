'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Album, ApiResponse } from '@/types'

export function usePhotos() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<ApiResponse<Album[]>>('/albums')
      .then(res => setAlbums(res.data ?? []))
      .catch(err => setError((err as Error).message))
      .finally(() => setIsLoading(false))
  }, [])

  return { albums, isLoading, error }
}
