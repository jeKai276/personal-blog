'use client'
import { motion } from 'framer-motion'

const ease = [0.22, 0.61, 0.36, 1] as const

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-10">
      <div className="max-w-[1180px] mx-auto w-full">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--muted)' }}>
            ✻ &nbsp; a quiet notebook
          </span>
          <span className="h-px w-12" style={{ background: 'var(--line)' }} />
          <span className="text-[12.5px]" style={{ color: 'var(--ink-2)' }}>
            kept in public, since 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease }}
          className="font-serif font-light tracking-tight leading-[0.98]"
          style={{ fontSize: 'clamp(56px, 10vw, 144px)', color: 'var(--ink)' }}
        >
          Work fast.<br />
          <span style={{ fontFamily: 'Caveat, cursive', fontStyle: 'normal', color: 'var(--accent-strong)' }}>
            Live slow.
          </span>
        </motion.h1>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease }}
          className="mt-10 max-w-[58ch] text-[17px] leading-[1.75]"
          style={{ color: 'var(--ink-2)' }}
        >
          Hi, I&rsquo;m <em style={{ color: 'var(--accent-strong)', fontStyle: 'italic' }}>Kai</em> — a backend
          engineer based in Hanoi, learning frontend one page at a time. I write about clean APIs in the
          morning and share life&rsquo;s quiet moments in the afternoon. New letters land roughly once a fortnight.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <a
            href="#posts"
            className="group inline-flex items-center gap-2 pl-6 pr-2 rounded-full font-medium text-[14px] transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--ink)', color: 'var(--paper)', height: 52 }}
          >
            Read my letters
            <span
              className="grid place-items-center w-10 h-10 rounded-full transition-transform group-hover:translate-x-0.5"
              style={{ background: 'var(--accent)', color: 'var(--ink)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 px-6 rounded-full font-medium text-[14px]"
            style={{
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              height: 52,
              background: 'color-mix(in oklch, var(--paper-2) 60%, transparent)',
              backdropFilter: 'blur(8px)',
            }}
          >
            About me
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10.5px] tracking-[0.22em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          <span>scroll &mdash; the doors open</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="block w-px h-10"
            style={{ background: 'linear-gradient(to bottom, var(--muted), transparent)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
