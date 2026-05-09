'use client'
import { motion } from 'framer-motion'

export default function AboutSection() {
  return (
    <section id="about" className="relative max-w-[1180px] mx-auto px-6 md:px-10 pt-28 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9 }}
          className="md:col-span-5"
        >
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--muted)' }}>
            ☼ — about
          </div>
          <h2
            className="font-serif font-light tracking-tight leading-[1.05]"
            style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--ink)' }}
          >
            A small life, <br />
            <span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>well-tended.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="md:col-span-7"
        >
          <p className="text-[17px] leading-[1.8]" style={{ color: 'var(--ink-2)' }}>
            By day I write Go services that handle backend APIs; by evening I explore photography,
            tend a small home setup, and occasionally bake sourdough. I believe in{' '}
            <em>boring infrastructure</em>, long walks without a phone, and the quiet luxury of a
            Saturday with no agenda.
          </p>
          <p className="text-[17px] leading-[1.8] mt-5" style={{ color: 'var(--ink-2)' }}>
            This blog is the seam between those two halves &mdash; engineering notes, life photos,
            and occasionally a recipe. If anything here is useful, that&rsquo;s a happy accident.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 font-mono text-[12px]" style={{ color: 'var(--muted)' }}>
            <span>Hanoi, VN &mdash; (UTC+7)</span>
            <span>
              currently writing &mdash;{' '}
              <em style={{ color: 'var(--ink)', fontStyle: 'normal' }}>Go microservices</em>
            </span>
            <span>
              currently reading &mdash;{' '}
              <em style={{ color: 'var(--ink)', fontStyle: 'normal' }}>The Pragmatic Programmer</em>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
