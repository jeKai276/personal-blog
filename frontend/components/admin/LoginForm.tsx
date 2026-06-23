'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await api.post('/auth/login', { username, password })
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20"
      style={{ background: 'var(--paper)' }}
    >
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-[13px] font-mono tracking-wide"
        style={{ color: 'var(--muted)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        back to the blog
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative w-full max-w-[420px] rounded-[26px] p-9 overflow-hidden"
        style={{
          background: 'color-mix(in oklch, var(--paper-2) 78%, transparent)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          border: '1px solid var(--line)',
          boxShadow: '0 30px 60px -25px rgba(20,15,30,.35), 0 1px 0 rgba(255,255,255,.55) inset',
        }}
      >
        {/* Corner glow */}
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(closest-side, var(--accent), transparent 70%)',
            opacity: 0.55,
          }}
        />

        <div className="relative">
          <div className="font-mono text-[10.5px] tracking-[0.24em] uppercase mb-2.5" style={{ color: 'var(--muted)' }}>
            ✦ &nbsp; private door
          </div>
          <h1
            className="font-serif font-light tracking-tight leading-[1.05]"
            style={{ fontSize: '36px', color: 'var(--ink)' }}
          >
            Welcome back,{' '}
            <span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>Kai.</span>
          </h1>
          <p className="mt-2.5 text-[13.5px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>
            Admin access only &mdash; for drafting, editing &amp; publishing.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            {/* Username */}
            <label className="block">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
                username
              </span>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 h-12 rounded-xl text-[14px] outline-none transition-colors"
                style={{
                  background: 'color-mix(in oklch, var(--paper-2) 80%, transparent)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-strong)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              />
            </label>

            {/* Password */}
            <label className="block">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
                password
              </span>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 pr-12 h-12 rounded-xl text-[14px] outline-none transition-colors"
                  style={{
                    background: 'color-mix(in oklch, var(--paper-2) 80%, transparent)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-strong)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full"
                  style={{ color: 'var(--muted)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 22 12c-1.2 2-3 3.8-5.2 5.1M6.1 6.1C3.6 7.7 2 10 1 12c2 4 6 7 11 7 1.7 0 3.3-.4 4.7-1" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {/* Error */}
            {error && (
              <div
                className="text-[12.5px] px-3 py-2 rounded-lg"
                style={{ background: 'oklch(0.94 0.05 25)', color: 'oklch(0.45 0.15 25)' }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl font-medium text-[14px] disabled:opacity-60 transition-opacity"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
              {!isLoading && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </form>

          <div
            className="mt-7 pt-6 text-center text-[11.5px] font-mono tracking-wide"
            style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)' }}
          >
            Not you?&nbsp;
            <Link href="/" className="cursor-pointer" style={{ color: 'var(--accent-strong)' }}>
              ← return to the front porch
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
