'use client'

import { useState } from 'react'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(_username: string, _password: string) {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: call api.post('/auth/login', { username, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
