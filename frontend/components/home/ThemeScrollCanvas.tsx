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
  const requestRef = useRef<number | null>(null)

  // Cache canvas dimensions to avoid layout thrashing on scroll
  const canvasSize = useRef({ width: 0, height: 0 })

  // We maintain arrays of HTMLImageElements for caching
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameIndex = useRef(-1) // Track currently requested frame to avoid duplicates

  // Scroll tracking within this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Map scroll progress (0 to 1) to frame index (1 to FRAME_COUNT)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT])

  // Resize handler to cache canvas dimensions
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect()
        // Multiply by devicePixelRatio for sharper images on retina screens if desired,
        // but for performance, matching the CSS pixels is usually best for large image sequences.
        canvasSize.current = { width, height }

        if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
          canvasRef.current.width = width
          canvasRef.current.height = height
          // Redraw current frame after resize
          if (currentFrameIndex.current !== -1) {
            const temp = currentFrameIndex.current
            currentFrameIndex.current = -1 // Force redraw
            drawFrame(temp)
          }
        }
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Preload images whenever the theme changes
  useEffect(() => {
    let isCancelled = false
    let loadedCount = 0
    const newImages: HTMLImageElement[] = new Array(FRAME_COUNT)
    const mode = isDark ? 'dark' : 'light'

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      const paddedIndex = String(i).padStart(3, '0')
      img.src = `/frames/${mode}/${paddedIndex}.webp`

      const handleLoadOrError = () => {
        if (isCancelled) return
        loadedCount++
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = newImages
          // Force redraw of the current frame position once everything loads
          const current = Math.round(frameIndex.get())
          currentFrameIndex.current = -1
          drawFrame(current)
        }
      }

      img.onload = handleLoadOrError
      img.onerror = handleLoadOrError

      newImages[i - 1] = img
    }

    return () => {
      isCancelled = true
    }
  }, [isDark, frameIndex])

  // Function to draw a specific frame onto the canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false }) // Optimize: disable alpha blending if possible
    if (!ctx) return

    // Ensure we don't go out of bounds
    const safeIndex = Math.max(1, Math.min(index, FRAME_COUNT))

    // Skip if we are already drawing this exact frame
    if (safeIndex === currentFrameIndex.current) return
    currentFrameIndex.current = safeIndex

    // Check if images are fully loaded
    if (imagesRef.current.length !== FRAME_COUNT) return

    const image = imagesRef.current[safeIndex - 1]
    if (!image || !image.complete || image.naturalWidth === 0) return

    const { width: canvasWidth, height: canvasHeight } = canvasSize.current
    if (canvasWidth === 0 || canvasHeight === 0) return

    // Object-fit: cover logic
    const scale = Math.max(canvasWidth / image.width, canvasHeight / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale

    // Center the image
    const drawX = (canvasWidth - drawWidth) / 2
    const drawY = (canvasHeight - drawHeight) / 2

    // Cancel any pending paint to prevent out-of-order drawing
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current)
    }

    // Use requestAnimationFrame for smooth painting
    requestRef.current = requestAnimationFrame(() => {
      // ctx.clearRect is not strictly necessary if we overwrite the entire canvas with drawImage,
      // but since the image might not perfectly match the aspect ratio and we might have margins
      // (though object-fit: cover ensures we don't), it's safe to fill.
      // However, with { alpha: false }, the browser treats it as opaque and drawImage is faster.
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
      requestRef.current = null
    })
  }

  // When scroll changes, update the canvas
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    drawFrame(Math.round(latest))
  })

  return (
    // This container height determines how long the user scrolls to scrub through the animation
    <section ref={containerRef} className="relative h-[300vh] w-full">

      {/* Sticky container holds the canvas and overlay content in the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[var(--paper)]">

        {/* ① Canvas — full-bleed, behind everything */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: -1 }}
        />

        {/* ② Theme-adaptive readability overlay */}
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
