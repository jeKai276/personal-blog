import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Yen | Personal Blog', template: '%s | Yen' },
  description: 'Backend developer đang học frontend — viết về code, chia sẻ ảnh và cuộc sống.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Yen Blog',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
