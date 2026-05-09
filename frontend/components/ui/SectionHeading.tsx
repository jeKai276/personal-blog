'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface SectionHeadingProps {
  label?: string
  title: React.ReactNode
  href?: string
  hrefLabel?: string
  id?: string
}

export default function SectionHeading({ label, title, href, hrefLabel = 'View all', id }: SectionHeadingProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex items-end justify-between gap-6 mb-12 pt-4"
    >
      <div>
        {label && (
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--muted)' }}>
            {label}
          </div>
        )}
        <h2
          className="font-serif font-light tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', color: 'var(--ink)' }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden md:inline-flex items-center gap-1.5 text-[13.5px] pb-2 transition-colors flex-shrink-0"
          style={{ color: 'var(--muted)' }}
        >
          <span style={{ borderBottom: '1px solid var(--line)' }} className="pb-0.5">
            {hrefLabel}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </motion.div>
  )
}
