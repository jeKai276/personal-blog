'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Post, ApiResponse, PostsListData } from '@/types'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const res = await api.get<ApiResponse<PostsListData>>('/admin/posts')
      setPosts(res.data?.posts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: number) {
    if (!confirm('Xóa bài viết này?')) return
    try {
      await api.delete(`/admin/posts/${id}`)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Xóa thất bại')
    }
  }

  async function handleTogglePublish(post: Post) {
    try {
      const publish = post.status !== 'published'
      const res = await api.patch<ApiResponse<Post>>(`/admin/posts/${post.id}/publish`, { publish })
      const updated = res.data
      setPosts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      alert('Thao tác thất bại')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài viết</h1>
        <Link
          href="/admin/blog/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Viết bài mới
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Đang tải...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có bài viết nào.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Tiêu đề</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                <th className="hidden px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    {post.tags.length > 0 && (
                      <div className="mt-0.5 text-xs text-gray-400">{post.tags.join(', ')}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        post.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-xs text-gray-600 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
