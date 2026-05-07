import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Login' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-gray-500 text-sm">Form đăng nhập sẽ được implement sau.</p>
      </div>
    </div>
  )
}
