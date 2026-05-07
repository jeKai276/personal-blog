import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50 to-white px-8 py-16 sm:py-20">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
        {/* Text */}
        <div className="space-y-5">
          <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-widest text-blue-500">
            Backend Developer
          </p>
          <h1 className="animate-fade-in-up text-4xl font-bold leading-tight text-gray-900 [animation-delay:100ms] sm:text-5xl">
            Xin chào,<br />tôi là Yen
          </h1>
          <p className="animate-fade-in-up max-w-md text-lg leading-relaxed text-gray-600 [animation-delay:200ms]">
            Backend developer, đang học frontend. Tôi viết về code, chia sẻ ảnh đi chơi và cuộc sống hàng ngày.
          </p>
          <div className="animate-fade-in-up flex flex-wrap gap-3 [animation-delay:300ms]">
            <Link href="/about">
              <Button variant="brand" size="lg">Về tôi</Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline-brand" size="lg">Đọc blog</Button>
            </Link>
          </div>
        </div>

        {/* Avatar placeholder */}
        <div className="hidden justify-center md:flex">
          <div className="relative h-64 w-64">
            <div className="absolute inset-0 rounded-2xl bg-blue-300 opacity-20 blur-2xl" />
            <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-300 to-blue-500 text-6xl font-bold text-white shadow-lg">
              YD
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
