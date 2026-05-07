import AlbumUploadPage from '@/components/admin/AlbumUploadPage'

interface Props {
  params: Promise<{ albumId: string }>
}

export default async function AdminAlbumPage({ params }: Props) {
  const { albumId } = await params
  return <AlbumUploadPage albumId={Number(albumId)} />
}
