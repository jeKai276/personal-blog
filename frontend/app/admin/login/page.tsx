import type { Metadata } from 'next'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Admin Login' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <LoginForm />
    </div>
  )
}
