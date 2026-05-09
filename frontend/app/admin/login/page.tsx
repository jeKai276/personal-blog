import type { Metadata } from 'next'
import PaintedSky from '@/components/home/PaintedSky'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Admin — Private Door' }

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      <PaintedSky />
      <LoginForm />
    </div>
  )
}
