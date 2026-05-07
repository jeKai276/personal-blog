import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()
  if (!authed) redirect('/admin/login')
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-3 font-semibold">Admin Panel</header>
      <main className="p-6">{children}</main>
    </div>
  )
}
