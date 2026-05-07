import EditPostForm from '@/components/admin/EditPostForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  return <EditPostForm postId={Number(id)} />
}
