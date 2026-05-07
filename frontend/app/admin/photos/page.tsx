import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Quản lý ảnh' }

export default function AdminPhotosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Albums</h1>
      <p className="mt-2 text-gray-500">Danh sách albums sẽ được load từ API.</p>
    </div>
  )
}
