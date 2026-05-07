import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Không tìm thấy trang này.</p>
      <Link href="/" className="text-blue-600 hover:underline">Về trang chủ</Link>
    </div>
  )
}
