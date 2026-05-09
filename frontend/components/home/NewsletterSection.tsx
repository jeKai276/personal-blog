'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="max-w-[1180px] mx-auto px-6 md:px-10 pt-24 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9 }}
        className="relative overflow-hidden rounded-3xl px-8 md:px-14 py-14 md:py-16"
        style={{
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--paper-2) 70%)',
          border: '1px solid var(--line)',
        }}
      >
        {/* Corner glow */}
        <div
          aria-hidden
          className="absolute -right-20 -top-20 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(closest-side, var(--accent), transparent 70%)',
            opacity: 0.5,
          }}
        />

        <div className="relative max-w-[640px]">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--muted)' }}>
            ⌁ — fortnightly letter
          </div>
          <h3
            className="font-serif font-light tracking-tight leading-[1.1]"
            style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', color: 'var(--ink)' }}
          >
            A short note in your inbox, every other Sunday.
          </h3>
          <p className="mt-4 text-[15px] leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
            One essay, two photos, one thing I&rsquo;m reading. No tracking, no analytics &mdash;
            just an email, the way they used to be.
          </p>

          {submitted ? (
            <div className="mt-7 font-mono text-[13px]" style={{ color: 'var(--accent-strong)' }}>
              ✓ You&rsquo;re on the list. Talk soon.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-7 flex flex-col sm:flex-row items-stretch gap-2 max-w-[480px]"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@somewhere.com"
                required
                className="flex-1 px-4 h-12 rounded-full text-[14px] outline-none transition-colors"
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-strong)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              />
              <button
                type="submit"
                className="px-5 h-12 rounded-full font-medium text-[14px] transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--ink)', color: 'var(--paper)' }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}
