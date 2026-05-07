import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Personal Blog', template: '%s | Personal Blog' },
  description: 'A backend developer learning frontend — sharing code, photos, and life.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
