'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR for Web MIDI / Web Audio API
const PianoSightReading = dynamic(
  () => import('@/components/piano/PianoSightReading'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎹</div>
          <p style={{ color: 'var(--muted)' }}>Loading Piano…</p>
        </div>
      </div>
    ),
  }
)

export default function PianoPage() {
  return <PianoSightReading />
}

