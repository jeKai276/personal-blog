import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Viết bài mới' }

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Viết bài mới</h1>
      <p className="mt-2 text-gray-500">TipTap editor sẽ được implement ở Phase 4.</p>
    </div>
  )
}
