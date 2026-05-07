'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Post, ApiResponse, PostsListData } from '@/types'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<ApiResponse<PostsListData>>('/posts')
      .then(res => setPosts(res.data?.posts ?? []))
      .catch(err => setError((err as Error).message))
      .finally(() => setIsLoading(false))
  }, [])

  return { posts, isLoading, error }
}
