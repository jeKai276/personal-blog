import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Chỉnh sửa bài viết' }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold">Chỉnh sửa bài #{id}</h1>
      <p className="mt-2 text-gray-500">TipTap editor sẽ được implement ở Phase 4.</p>
    </div>
  )
}
