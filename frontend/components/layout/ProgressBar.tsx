'use client'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ProgressBar() {
  const { scrollYProgress } = useScroll()
  const scale = useSpring(scrollYProgress, { stiffness: 100, damping: 24, mass: 0.5 })

  return (
    <motion.div
      style={{ scaleX: scale, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none"
    >
      <div className="h-full w-full" style={{ background: 'var(--accent-strong)' }} />
    </motion.div>
  )
}
