'use client'
import { useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function Cloud({
  top, left, size, delay, duration, hue, opacity = 0.55,
}: {
  top: string; left: string; size: number; delay: number; duration: number; hue: number; opacity?: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        top, left, width: size, height: size * 0.6,
        background: `radial-gradient(ellipse at center, oklch(0.94 0.04 ${hue}) 0%, oklch(0.90 0.05 ${hue} / 0.6) 40%, transparent 70%)`,
        filter: 'blur(28px)',
        opacity,
        mixBlendMode: 'screen' as const,
      }}
      animate={{ x: [0, 60, 0], y: [0, -14, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function Twinkle({ top, left, size = 2, delay, duration }: {
  top: string; left: string; size?: number; delay: number; duration: number
}) {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{ top, left, width: size, height: size, background: 'currentColor' }}
      animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function PaintedSky() {
  const { scrollYProgress } = useScroll()
  const shiftA = useTransform(scrollYProgress, [0, 0.5, 1], [0, 30, 60])

  const stars = useMemo(() => {
    const arr = []
    for (let i = 0; i < 36; i++) {
      arr.push({
        top: `${(i * 137.5) % 95 + 1}%`,
        left: `${(i * 41.7) % 98 + 1}%`,
        size: 1 + ((i * 7) % 3),
        delay: (i % 9) * 0.4,
        duration: 3 + ((i * 3) % 5),
      })
    }
    return arr
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base breathing gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            var(--sky-1) 0%,
            var(--sky-2) 35%,
            var(--sky-3) 70%,
            var(--sky-4) 100%)`,
        }}
        animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(8deg)', 'hue-rotate(0deg)'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Soft horizon glow */}
      <motion.div
        className="absolute inset-x-0 h-[60vh] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, var(--glow-warm) 0%, transparent 70%)',
          opacity: 0.85,
          y: shiftA,
          top: '20%',
        }}
      />

      {/* Drifting cloud blobs */}
      <Cloud top="6%"  left="10%" size={520} delay={0} duration={22} hue={30}  opacity={0.7} />
      <Cloud top="14%" left="55%" size={640} delay={3} duration={28} hue={320} opacity={0.55} />
      <Cloud top="38%" left="-6%" size={560} delay={6} duration={26} hue={260} opacity={0.5} />
      <Cloud top="52%" left="62%" size={680} delay={2} duration={30} hue={20}  opacity={0.5} />
      <Cloud top="74%" left="20%" size={580} delay={5} duration={24} hue={200} opacity={0.45} />
      <Cloud top="88%" left="68%" size={520} delay={1} duration={26} hue={290} opacity={0.4} />

      {/* Twinkles */}
      <div className="absolute inset-0" style={{ color: 'var(--star)' }}>
        {stars.map((s, i) => <Twinkle key={i} {...s} />)}
      </div>

      {/* Painterly grain */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  )
}
