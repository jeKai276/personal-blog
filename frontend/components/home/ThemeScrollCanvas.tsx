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

  // Cache canvas dimensions to avoid layout thrashing
  const canvasSize = useRef({ width: 0, height: 0 })

  // We maintain arrays of ImageBitmap (or HTMLImageElement fallback) for instant GPU drawing
  const imagesRef = useRef<(ImageBitmap | HTMLImageElement)[]>([])
  const currentFrameIndex = useRef(-1) // Track currently requested frame

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

  // Preload and DECODE images whenever the theme changes
  useEffect(() => {
    let isCancelled = false
    let loadedCount = 0
    const newImages: (ImageBitmap | HTMLImageElement)[] = new Array(FRAME_COUNT)
    const mode = isDark ? 'dark' : 'light'

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      const paddedIndex = String(i).padStart(3, '0')
      img.src = `/frames/${mode}/${paddedIndex}.webp`

      const handleReady = (imageSource: ImageBitmap | HTMLImageElement) => {
        if (isCancelled) {
          // Clean up ImageBitmap if component unmounted before we finished
          if ('close' in imageSource) imageSource.close()
          return
        }
        newImages[i - 1] = imageSource
        loadedCount++

        if (loadedCount === FRAME_COUNT) {
          // Clean up old bitmaps from memory
          imagesRef.current.forEach(old => {
            if (old && 'close' in old) old.close()
          })

          imagesRef.current = newImages
          // Force redraw of the current frame position once everything loads
          const current = Math.round(frameIndex.get())
          currentFrameIndex.current = -1
          drawFrame(current)
        }
      }

      img.onload = async () => {
        try {
          // Off-thread decoding into GPU memory. Prevents main thread stutter!
          const bitmap = await window.createImageBitmap(img)
          handleReady(bitmap)
        } catch (e) {
          // Fallback to normal image if createImageBitmap is not supported or fails
          handleReady(img)
        }
      }

      img.onerror = () => {
        handleReady(img) // Push broken image to maintain array index, drawFrame will ignore it
      }
    }

    return () => {
      isCancelled = true
    }
  }, [isDark]) // Ensure frameIndex is not a dependency so it doesn't re-trigger preloading

  // Function to draw a specific frame onto the canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false }) // Disable alpha for perf
    if (!ctx) return

    // Ensure we don't go out of bounds
    const safeIndex = Math.max(1, Math.min(index, FRAME_COUNT))

    // Skip if we are already drawing this exact frame
    if (safeIndex === currentFrameIndex.current) return
    currentFrameIndex.current = safeIndex

    // Check if images are fully loaded
    if (imagesRef.current.length !== FRAME_COUNT) return

    const image = imagesRef.current[safeIndex - 1]
    if (!image) return
    // Check if valid (ImageBitmap has width, HTMLImageElement has naturalWidth)
    const imgWidth = 'naturalWidth' in image ? image.naturalWidth : image.width
    const imgHeight = 'naturalHeight' in image ? image.naturalHeight : image.height
    if (imgWidth === 0) return

    const { width: canvasWidth, height: canvasHeight } = canvasSize.current
    if (canvasWidth === 0 || canvasHeight === 0) return

    // Object-fit: cover logic
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
    const drawWidth = imgWidth * scale
    const drawHeight = imgHeight * scale

    // Center the image
    const drawX = (canvasWidth - drawWidth) / 2
    const drawY = (canvasHeight - drawHeight) / 2

    // Framer Motion's useMotionValueEvent is already synced to the animation frame.
    // Drawing synchronously here eliminates the 1-frame lag and prevents the "flash"
    // of an old frame when scrolling rapidly back and forth.
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
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
