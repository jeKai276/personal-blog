import type { Metadata } from 'next'

interface Props {
  params: Promise<{ albumId: string }>
}

export const metadata: Metadata = { title: 'Quản lý album' }

export default async function AdminAlbumPage({ params }: Props) {
  const { albumId } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold">Album #{albumId}</h1>
      <p className="mt-2 text-gray-500">Upload ảnh sẽ được implement ở Phase 4.</p>
    </div>
  )
}
