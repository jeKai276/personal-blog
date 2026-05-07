'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import PostEditor from '@/components/blog/PostEditor'
import type { ApiResponse, Post } from '@/types'

interface Props {
  postId: number
}

export default function EditPostForm({ postId }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<ApiResponse<Post>>(`/admin/posts/${postId}`)
      .then(res => {
        const post = res.data
        setTitle(post.title)
        setContent(post.content)
        setTagsInput(post.tags.join(', '))
        setStatus(post.status)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Không thể tải bài viết'))
      .finally(() => setIsLoading(false))
  }, [postId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Tiêu đề không được để trống'); return }
    setError(null)
    setIsSubmitting(true)
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      await api.put<ApiResponse<Post>>(`/admin/posts/${postId}`, { title, content, tags, status })
      router.push('/admin/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-400">Đang tải...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="text-sm text-gray-500 hover:text-gray-900">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tiêu đề *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Tags (cách nhau bằng dấu phẩy)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="go, backend, typescript"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Trạng thái</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'published')}
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nội dung</label>
          <PostEditor value={content} onChange={setContent} />
        </div>

        <div className="flex justify-end gap-2">
          <Link
            href="/admin/blog"
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}
