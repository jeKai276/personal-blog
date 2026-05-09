'use client'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Post } from '@/types'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
  post: Post
  idx?: number
}

export default function BlogCard({ post, idx = 0 }: BlogCardProps) {
  const [hover, setHover] = useState(false)
  const tag = post.tags?.[0] ?? 'article'

  return (
    <motion.article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="relative flex flex-col rounded-[22px] p-7 cursor-pointer overflow-hidden h-full"
      style={{
        background: 'color-mix(in oklch, var(--paper-2) 75%, transparent)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        border: `1px solid ${hover ? 'color-mix(in oklch, var(--accent-strong) 35%, var(--line))' : 'var(--line)'}`,
        boxShadow: hover
          ? '0 24px 48px -22px rgba(20,15,30,.22), 0 1px 0 rgba(255,255,255,.55) inset'
          : '0 1px 0 rgba(255,255,255,.45) inset',
        transition: 'box-shadow .4s, border-color .4s',
      }}
    >
      {/* Index + tag */}
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-[11px] tracking-wider" style={{ color: 'var(--muted)' }}>
          № {String(idx + 1).padStart(2, '0')}
        </span>
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
          style={{ color: 'var(--accent-strong)', background: 'var(--accent-soft)' }}
        >
          {tag}
        </span>
      </div>

      <h3 className="font-serif font-normal tracking-tight leading-[1.18]" style={{ fontSize: '23px', color: 'var(--ink)' }}>
        <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-2">
          {post.title}
        </Link>
      </h3>

      {post.excerpt && (
        <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
          {post.excerpt}
        </p>
      )}

      <div
        className="mt-auto mt-7 pt-5 flex items-center justify-between text-[12px] font-mono"
        style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)' }}
      >
        <span>{formatDate(post.created_at)}</span>
        <span className="flex items-center gap-2">
          <span
            className="grid place-items-center w-7 h-7 rounded-full transition-all"
            style={{
              background: hover ? 'var(--accent)' : 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              transform: hover ? 'translateX(2px)' : 'translateX(0)',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </div>
    </motion.article>
  )
}
