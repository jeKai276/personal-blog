'use client'

import { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useTheme } from '../layout/ThemeProvider'

const FRAME_COUNT = 120

export default function ThemeScrollCanvas() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLElement>(null)

  // We maintain arrays of HTMLImageElements for caching
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const currentFrameIndex = useRef(1) // Keep track of the currently drawn frame

  // Scroll tracking within this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Map scroll progress (0 to 1) to frame index (1 to FRAME_COUNT)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT])

  // Preload images whenever the theme changes
  useEffect(() => {
    setImagesLoaded(false)
    let loadedCount = 0
    const newImages: HTMLImageElement[] = []
    const mode = isDark ? 'dark' : 'light'

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      // format: 001.webp, 010.webp, 120.webp
      const paddedIndex = String(i).padStart(3, '0')
      img.src = `/frames/${mode}/${paddedIndex}.webp`

      img.onload = () => {
        loadedCount++
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = newImages
          setImagesLoaded(true)
          // As soon as images are loaded, draw the current frame to prevent flash
          drawFrame(currentFrameIndex.current)
        }
      }

      // Also handle error cases so it doesn't hang indefinitely
      img.onerror = () => {
        loadedCount++
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = newImages
          setImagesLoaded(true)
        }
      }

      newImages.push(img)
    }
  }, [isDark])

  // Function to draw a specific frame onto the canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure we don't go out of bounds
    const safeIndex = Math.max(1, Math.min(index, FRAME_COUNT))
    currentFrameIndex.current = safeIndex

    const image = imagesRef.current[safeIndex - 1]
    if (!image || !image.complete || image.naturalWidth === 0) return

    // Sync canvas resolution to CSS size for crisp drawing
    const { width, height } = canvas.getBoundingClientRect()
    // Optimization: only resize if different
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    // Object-fit: cover logic
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale

    // Center the image
    const drawX = (canvas.width - drawWidth) / 2
    const drawY = (canvas.height - drawHeight) / 2

    // Use requestAnimationFrame for smooth painting
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
    })
  }

  // Draw immediately on resize to prevent stretching
  useEffect(() => {
    const handleResize = () => {
      if (imagesLoaded) {
        drawFrame(currentFrameIndex.current)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [imagesLoaded])

  // When scroll changes, update the canvas
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    if (imagesLoaded) {
      // Use Math.round to get an integer frame index
      drawFrame(Math.round(latest))
    }
  })

  return (
    // This container height determines how long the user scrolls to scrub through the animation
    <section ref={containerRef} className="relative h-[300vh] w-full">

      {/* Sticky container holds the canvas and overlay content in the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ① Canvas — full-bleed, behind everything */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: -1 }}
        />

        {/* ② Theme-adaptive readability overlay
             Light: bg-white/30  →  soft white veil, lets canvas show
             Dark:  bg-black/50  →  deeper scrim so light text stays legible */}
        <div
          className={`absolute inset-0 transition-colors duration-700 pointer-events-none ${
            isDark ? 'bg-black/50' : 'bg-white/30'
          }`}
          style={{ zIndex: 0 }}
        />

        {/* ③ Content — above both canvas and overlay */}
        <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-10">
          <div className="max-w-[920px] text-center">
            <div
              className="font-mono text-[11px] tracking-[0.24em] uppercase mb-6"
              style={{ color: 'var(--muted)' }}
            >
              ✿ &nbsp; welcome inside
            </div>
            <h2
              className="font-serif font-light tracking-tight leading-[1.02]"
              style={{ fontSize: 'clamp(40px, 6.5vw, 92px)', color: 'var(--ink)' }}
            >
              Step into a{' '}
              <span style={{ fontFamily: 'Caveat, cursive', color: 'var(--accent-strong)' }}>quieter</span>
              <br />
              corner of the internet.
            </h2>
            <p
              className="mt-8 max-w-[58ch] mx-auto text-[16.5px] leading-[1.75]"
              style={{ color: 'var(--ink-2)' }}
            >
              Below are the things I&rsquo;m thinking about &mdash; a working notebook, half engineering, half
              gardening. Take your time. There&rsquo;s tea on the stove.
            </p>
            <div
              className="mt-10 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.22em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              <span className="inline-block w-8 h-px" style={{ background: 'var(--line)' }} />
              keep scrolling
              <span className="inline-block w-8 h-px" style={{ background: 'var(--line)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
