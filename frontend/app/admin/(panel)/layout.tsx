import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()
  if (!authed) redirect('/admin/login')
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  )
}
