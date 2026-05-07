import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Xin chào, tôi là Yen 👋</h1>
        <p className="text-lg text-gray-600">
          Backend developer, đang học frontend. Tôi viết về code, chia sẻ ảnh đi chơi và cuộc sống hàng ngày.
        </p>
        <div className="flex gap-4">
          <Link href="/about" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
            Về tôi
          </Link>
          <Link href="/blog" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Đọc blog
          </Link>
        </div>
      </section>
    </div>
  )
}
