'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

// ─── Music Theory Data ─────────────────────────────────────────────────────

type Clef = 'treble' | 'bass'

interface NoteInfo {
  midi: number       // MIDI note number (0–127)
  name: string       // e.g. "C4"
  pitchClass: string // e.g. "C"
  octave: number
  staffPosition: number // half-steps from the middle line (positive = up)
  accidental: '' | '#' | 'b'
}

// Staff positions for treble clef: middle line = B4 (MIDI 71)
// Position 0 = middle line (B4), positive = up, negative = down
// Each step = one diatonic step (line or space)
// Natural notes only for now (no accidentals in beginner mode)

const TREBLE_NOTES: NoteInfo[] = [
  // Range: C4 (middle C) to C6
  { midi: 60, name: 'C4', pitchClass: 'C', octave: 4, staffPosition: -6, accidental: '' },
  { midi: 62, name: 'D4', pitchClass: 'D', octave: 4, staffPosition: -5, accidental: '' },
  { midi: 64, name: 'E4', pitchClass: 'E', octave: 4, staffPosition: -4, accidental: '' },
  { midi: 65, name: 'F4', pitchClass: 'F', octave: 4, staffPosition: -3, accidental: '' },
  { midi: 67, name: 'G4', pitchClass: 'G', octave: 4, staffPosition: -2, accidental: '' },
  { midi: 69, name: 'A4', pitchClass: 'A', octave: 4, staffPosition: -1, accidental: '' },
  { midi: 71, name: 'B4', pitchClass: 'B', octave: 4, staffPosition:  0, accidental: '' },
  { midi: 72, name: 'C5', pitchClass: 'C', octave: 5, staffPosition:  1, accidental: '' },
  { midi: 74, name: 'D5', pitchClass: 'D', octave: 5, staffPosition:  2, accidental: '' },
  { midi: 76, name: 'E5', pitchClass: 'E', octave: 5, staffPosition:  3, accidental: '' },
  { midi: 77, name: 'F5', pitchClass: 'F', octave: 5, staffPosition:  4, accidental: '' },
  { midi: 79, name: 'G5', pitchClass: 'G', octave: 5, staffPosition:  5, accidental: '' },
  { midi: 81, name: 'A5', pitchClass: 'A', octave: 5, staffPosition:  6, accidental: '' },
  { midi: 83, name: 'B5', pitchClass: 'B', octave: 5, staffPosition:  7, accidental: '' },
  { midi: 84, name: 'C6', pitchClass: 'C', octave: 6, staffPosition:  8, accidental: '' },
]

const BASS_NOTES: NoteInfo[] = [
  // Range: E2 to G4, middle line = D3 (MIDI 50)
  // Position 0 = middle line (D3)
  { midi: 40, name: 'E2', pitchClass: 'E', octave: 2, staffPosition: -6, accidental: '' },
  { midi: 41, name: 'F2', pitchClass: 'F', octave: 2, staffPosition: -5, accidental: '' }, // F2=41
  { midi: 43, name: 'G2', pitchClass: 'G', octave: 2, staffPosition: -4, accidental: '' },
  { midi: 45, name: 'A2', pitchClass: 'A', octave: 2, staffPosition: -3, accidental: '' },
  { midi: 47, name: 'B2', pitchClass: 'B', octave: 2, staffPosition: -2, accidental: '' },
  { midi: 48, name: 'C3', pitchClass: 'C', octave: 3, staffPosition: -1, accidental: '' },
  { midi: 50, name: 'D3', pitchClass: 'D', octave: 3, staffPosition:  0, accidental: '' },
  { midi: 52, name: 'E3', pitchClass: 'E', octave: 3, staffPosition:  1, accidental: '' },
  { midi: 53, name: 'F3', pitchClass: 'F', octave: 3, staffPosition:  2, accidental: '' },
  { midi: 55, name: 'G3', pitchClass: 'G', octave: 3, staffPosition:  3, accidental: '' },
  { midi: 57, name: 'A3', pitchClass: 'A', octave: 3, staffPosition:  4, accidental: '' },
  { midi: 59, name: 'B3', pitchClass: 'B', octave: 3, staffPosition:  5, accidental: '' },
  { midi: 60, name: 'C4', pitchClass: 'C', octave: 4, staffPosition:  6, accidental: '' },
  { midi: 62, name: 'D4', pitchClass: 'D', octave: 4, staffPosition:  7, accidental: '' },
  { midi: 64, name: 'E4', pitchClass: 'E', octave: 4, staffPosition:  8, accidental: '' },
]

// ─── Canvas Staff Drawing ─────────────────────────────────────────────────

function drawStaff(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  clef: Clef,
  note: NoteInfo | null,
  feedback: 'correct' | 'wrong' | 'idle',
  isDark: boolean,
  showHint: boolean,
) {
  ctx.clearRect(0, 0, width, height)

  const lineColor  = isDark ? 'rgba(235,229,244,0.5)' : 'rgba(31,26,38,0.4)'
  const noteColor  = feedback === 'correct' ? '#22c55e'
                   : feedback === 'wrong'   ? '#ef4444'
                   : isDark                 ? '#ebe5f4'
                                            : '#1f1a26'
  const textColor  = isDark ? '#ebe5f4' : '#1f1a26'
  const extraColor = isDark ? 'rgba(235,229,244,0.7)' : 'rgba(31,26,38,0.6)'

  const staffPad   = 40
  const lineGap    = Math.min(height / 14, 22) // space between lines
  const middleLine = height / 2                // vertical center

  // 5 staff lines: positions -2, -1, 0, 1, 2 (above/below middle)
  ctx.strokeStyle = lineColor
  ctx.lineWidth   = 1.5
  for (let i = -2; i <= 2; i++) {
    const y = middleLine + i * lineGap * 2 // lines are spaced 2 units apart (lines + spaces)
    ctx.beginPath()
    ctx.moveTo(staffPad, y)
    ctx.lineTo(width - staffPad, y)
    ctx.stroke()
  }

  // ── Clef symbol ───────────────────────────────────────────────────────
  // Treble: baseline at bottom staff line (E4). The G-ring of 𝄞 naturally
  // sits 2 lineGaps above baseline → lands on G4 line (2nd from bottom).
  // Bass: baseline adjusted so F-line of 𝄢 aligns with the F3 staff line
  // (2nd from top = middleLine - 2*lineGap).
  ctx.fillStyle = textColor
  ctx.textAlign = 'left'
  if (clef === 'treble') {
    ctx.font = `${lineGap * 11}px serif`
    ctx.fillText('𝄞', staffPad - 10, middleLine + lineGap * 4)
  } else {
    ctx.font = `${lineGap * 5}px serif`
    ctx.fillText('𝄢', staffPad - 2, middleLine - lineGap * 0.5)
  }

  if (!note) return

  // ── Map staffPosition to Y coordinate ────────────────────────────────
  // staffPosition 0 = middle line (y = middleLine)
  // Each step = lineGap (half the space between staff lines)
  const noteX = width / 2 + 30
  const noteY = middleLine - note.staffPosition * lineGap
  const noteR = lineGap * 0.85

  // ── Ledger lines ──────────────────────────────────────────────────────
  // Draw ledger lines for notes outside the staff (staffPosition > 4 or < -4)
  ctx.strokeStyle = extraColor
  ctx.lineWidth   = 1.5
  const ledgerW   = noteR * 2.6

  // Above staff (positions 5, 6, 7, 8...)
  for (let p = 5; p <= note.staffPosition; p += 2) {
    const ly = middleLine - p * lineGap
    ctx.beginPath()
    ctx.moveTo(noteX - ledgerW, ly)
    ctx.lineTo(noteX + ledgerW, ly)
    ctx.stroke()
  }
  // Below staff (positions -5, -6, -7...)
  for (let p = -5; p >= note.staffPosition; p -= 2) {
    const ly = middleLine - p * lineGap
    ctx.beginPath()
    ctx.moveTo(noteX - ledgerW, ly)
    ctx.lineTo(noteX + ledgerW, ly)
    ctx.stroke()
  }

  // ── Note head ─────────────────────────────────────────────────────────
  ctx.fillStyle   = noteColor
  ctx.strokeStyle = noteColor
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, noteR, noteR * 0.75, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // ── Stem ─────────────────────────────────────────────────────────────
  const stemDir   = note.staffPosition >= 0 ? -1 : 1  // down if on/above middle
  const stemX     = stemDir === -1 ? noteX - noteR + 1 : noteX + noteR - 1
  const stemStart = noteY + stemDir * noteR * 0.5
  const stemEnd   = noteY + stemDir * lineGap * 6

  ctx.beginPath()
  ctx.moveTo(stemX, stemStart)
  ctx.lineTo(stemX, stemEnd)
  ctx.stroke()

  // ── Note name label — only when hint is shown ───────────────────────
  if (showHint) {
    ctx.fillStyle  = textColor
    ctx.font       = `500 ${lineGap * 1.1}px 'Geist', sans-serif`
    ctx.textAlign  = 'center'
    ctx.fillText(note.name, noteX, height - 6)
  }
}

// ─── Web Audio Synth ──────────────────────────────────────────────────────

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function playNote(audioCtx: AudioContext, midi: number) {
  const freq = midiToFreq(midi)
  const now  = audioCtx.currentTime

  const osc  = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type      = 'triangle'
  osc.frequency.setValueAtTime(freq, now)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.45, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)

  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 1.8)
}

// ─── Virtual Keyboard ─────────────────────────────────────────────────────

const WHITE_KEYS_PER_OCTAVE = 7
const WHITE_KEY_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_KEY_OFFSETS: Record<string, number> = { 'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5 }
// semitone offsets in octave: C=0, D=2, E=4, F=5, G=7, A=9, B=11
const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11]

interface KeyboardProps {
  startOctave: number
  endOctave: number
  highlightMidi: number | null
  activeFlash: { midi: number; color: string } | null
  onNotePlay: (midi: number) => void
  midiConnected: boolean
}

function VirtualKeyboard({ startOctave, endOctave, highlightMidi, activeFlash, onNotePlay, midiConnected }: KeyboardProps) {
  const octaves  = endOctave - startOctave + 1
  const totalW   = octaves * WHITE_KEYS_PER_OCTAVE

  return (
    <div className="relative select-none overflow-x-auto pb-2">
      <svg
        viewBox={`0 0 ${totalW * 24} 120`}
        style={{ width: '100%', maxWidth: '100%', display: 'block', minWidth: 320 }}
        aria-label="Virtual piano keyboard"
      >
        {/* White keys */}
        {Array.from({ length: octaves }, (_, oi) => {
          const oct = startOctave + oi
          return WHITE_KEY_NAMES.map((name, ki) => {
            const midi  = (oct + 1) * 12 + WHITE_SEMITONES[ki]
            const xIdx  = oi * WHITE_KEYS_PER_OCTAVE + ki
            const isFlash = activeFlash?.midi === midi
            const isTarget = highlightMidi === midi

            let fill = '#f9f9f7'
            if (isFlash) fill = activeFlash!.color
            else if (isTarget) fill = 'rgba(96,165,250,0.35)'

            return (
              <g key={`w-${midi}`} onClick={() => onNotePlay(midi)} style={{ cursor: 'pointer' }}>
                <rect
                  x={xIdx * 24 + 1}
                  y={0}
                  width={22}
                  height={118}
                  rx={3}
                  fill={fill}
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <text
                  x={xIdx * 24 + 12}
                  y={108}
                  textAnchor="middle"
                  fontSize={8}
                  fill={isFlash || isTarget ? '#1f1a26' : '#999'}
                  fontFamily="'Geist', sans-serif"
                  pointerEvents="none"
                >
                  {name}{oct}
                </text>
              </g>
            )
          })
        })}

        {/* Black keys */}
        {Array.from({ length: octaves }, (_, oi) => {
          const oct = startOctave + oi
          return Object.entries(BLACK_KEY_OFFSETS).map(([name, whiteOffset]) => {
            const semitone = WHITE_SEMITONES[whiteOffset] + 1
            const midi     = (oct + 1) * 12 + semitone
            const xIdx     = oi * WHITE_KEYS_PER_OCTAVE + whiteOffset
            const isFlash  = activeFlash?.midi === midi
            const isTarget = highlightMidi === midi

            let fill = '#1f1a26'
            if (isFlash) fill = activeFlash!.color
            else if (isTarget) fill = '#3b82f6'

            return (
              <g key={`b-${midi}`} onClick={() => onNotePlay(midi)} style={{ cursor: 'pointer' }}>
                <rect
                  x={xIdx * 24 + 15}
                  y={0}
                  width={14}
                  height={76}
                  rx={2}
                  fill={fill}
                  stroke="#000"
                  strokeWidth={0.5}
                />
              </g>
            )
          })
        })}
      </svg>
      {!midiConnected && (
        <p className="text-center text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Click a key · Use keyboard <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}>A–K</kbd> for C4–B4
        </p>
      )}
    </div>
  )
}

// PC keyboard mapping (A–K = C4–B4, Z = octave down, X = octave up... simple)
const PC_KEY_MAP: Record<string, number> = {
  'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64, 'f': 65, 't': 66,
  'g': 67, 'y': 68, 'h': 69, 'u': 70, 'j': 71, 'k': 72,
}

// Full chromatic name lookup for display
const MIDI_NAMES: Record<number, string> = {
  60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4', 64: 'E4',
  65: 'F4', 66: 'F#4', 67: 'G4', 68: 'G#4', 69: 'A4',
  70: 'A#4', 71: 'B4', 72: 'C5',
}


// ─── Main Component ───────────────────────────────────────────────────────

export default function PianoSightReading() {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const audioCtxRef   = useRef<AudioContext | null>(null)
  const midiAccessRef = useRef<MIDIAccess | null>(null)
  const rafRef        = useRef<number>(0)

  const [clef, setClef]               = useState<Clef>('treble')
  const [currentNote, setCurrentNote] = useState<NoteInfo | null>(null)
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | 'idle'>('idle')
  const [midiStatus, setMidiStatus]   = useState<'disconnected' | 'connected' | 'error' | 'unsupported'>('disconnected')
  const [score, setScore]             = useState({ correct: 0, wrong: 0 })
  const [isDark, setIsDark]           = useState(false)
  const [activeFlash, setActiveFlash] = useState<{ midi: number; color: string } | null>(null)
  const [streak, setStreak]           = useState(0)
  const [showHint, setShowHint]       = useState(false)

  const midiConnected = midiStatus === 'connected'

  // Detect theme
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Pick random note — also resets hint
  const pickNote = useCallback((nextClef?: Clef) => {
    const pool  = (nextClef ?? clef) === 'treble' ? TREBLE_NOTES : BASS_NOTES
    const note  = pool[Math.floor(Math.random() * pool.length)]
    setCurrentNote(note)
    setFeedback('idle')
    setShowHint(false)
  }, [clef])

  // Init game
  useEffect(() => {
    pickNote()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audio context (lazy init) ──────────────────────────────────────────
  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // ── Play note sound ────────────────────────────────────────────────────
  const playSound = useCallback((midi: number) => {
    if (midiConnected) return  // physical piano handles sound
    const ctx = getAudioCtx()
    playNote(ctx, midi)
  }, [midiConnected])

  // ── Handle note input ──────────────────────────────────────────────────
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNoteInput = useCallback((midi: number) => {
    if (!currentNote) return

    playSound(midi)

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)

    if (midi === currentNote.midi) {
      // Correct!
      setFeedback('correct')
      setActiveFlash({ midi, color: '#22c55e' })
      setScore(s => ({ ...s, correct: s.correct + 1 }))
      setStreak(s => s + 1)

      feedbackTimerRef.current = setTimeout(() => {
        setActiveFlash(null)
        pickNote()
      }, 600)
    } else {
      // Wrong
      setFeedback('wrong')
      setActiveFlash({ midi, color: '#ef4444' })
      setScore(s => ({ ...s, wrong: s.wrong + 1 }))
      setStreak(0)

      feedbackTimerRef.current = setTimeout(() => {
        setActiveFlash(null)
        setFeedback('idle')
      }, 400)
    }
  }, [currentNote, pickNote, playSound])

  // ── Draw staff via requestAnimationFrame ───────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    function loop() {
      if (!running || !ctx || !canvas) return
      const dpr = window.devicePixelRatio || 1
      const w   = canvas.offsetWidth
      const h   = canvas.offsetHeight
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width  = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
      }
      drawStaff(ctx, w, h, clef, currentNote, feedback, isDark, showHint)
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [clef, currentNote, feedback, isDark, showHint])


  // ── Web MIDI ──────────────────────────────────────────────────────────
  const connectMidi = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      setMidiStatus('unsupported')
      return
    }
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false })
      midiAccessRef.current = access
      setMidiStatus('connected')

      function attachListeners(access: MIDIAccess) {
        access.inputs.forEach(input => {
          input.onmidimessage = (e: MIDIMessageEvent) => {
            if (!e.data) return
            const [status, note, velocity] = Array.from(e.data)
            const cmd = status & 0xf0
            // Note On with velocity > 0
            if ((cmd === 0x90 && velocity > 0) && note !== undefined) {
              handleNoteInput(note)
            }
          }
        })
      }

      attachListeners(access)

      access.onstatechange = () => {
        const hasInput = access.inputs.size > 0
        setMidiStatus(hasInput ? 'connected' : 'disconnected')
        attachListeners(access)
      }
    } catch {
      setMidiStatus('error')
    }
  }, [handleNoteInput])

  // Re-attach MIDI listeners when handleNoteInput changes
  useEffect(() => {
    if (!midiAccessRef.current) return
    midiAccessRef.current.inputs.forEach(input => {
      input.onmidimessage = (e: MIDIMessageEvent) => {
        if (!e.data) return
        const [status, note, velocity] = Array.from(e.data)
        const cmd = status & 0xf0
        if ((cmd === 0x90 && velocity > 0) && note !== undefined) {
          handleNoteInput(note)
        }
      }
    })
  }, [handleNoteInput])

  // ── PC Keyboard ───────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const midi = PC_KEY_MAP[e.key.toLowerCase()]
      if (midi !== undefined) handleNoteInput(midi)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleNoteInput])

  // ── Clef switch ────────────────────────────────────────────────────────
  const switchClef = (next: Clef) => {
    setClef(next)
    pickNote(next)
  }

  // ── Derived keyboard range ─────────────────────────────────────────────
  const kbStart = clef === 'treble' ? 3 : 2
  const kbEnd   = clef === 'treble' ? 5 : 4

  const accuracy = score.correct + score.wrong > 0
    ? Math.round((score.correct / (score.correct + score.wrong)) * 100)
    : null

  const midiStatusLabel: Record<typeof midiStatus, string> = {
    disconnected: 'No MIDI device',
    connected:    '🎹 MIDI Connected',
    error:        'MIDI Error',
    unsupported:  'MIDI not supported',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            ✦ — Music
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight" style={{ color: 'var(--ink)' }}>
            Piano Sight Reading
          </h1>
          <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>
            Read the note on the staff and play it on the keyboard.
          </p>
        </div>

        {/* ── Controls row ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Clef toggle */}
          <div
            className="flex items-center gap-1 rounded-full p-1"
            style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}
          >
            {(['treble', 'bass'] as Clef[]).map(c => (
              <button
                key={c}
                onClick={() => switchClef(c)}
                className="px-4 py-1.5 text-sm rounded-full font-medium transition-all"
                style={{
                  background: clef === c ? 'var(--ink)' : 'transparent',
                  color: clef === c ? 'var(--paper)' : 'var(--muted)',
                }}
              >
                {c === 'treble' ? '𝄞 Treble' : '𝄢 Bass'}
              </button>
            ))}
          </div>

          {/* MIDI connect */}
          <button
            id="btn-connect-piano"
            onClick={connectMidi}
            disabled={midiConnected}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: midiConnected ? 'oklch(0.55 0.16 145)' : 'var(--ink)',
              color: 'var(--paper)',
              opacity: midiConnected ? 1 : 1,
              cursor: midiConnected ? 'default' : 'pointer',
            }}
          >
            <span className={`w-2 h-2 rounded-full ${midiConnected ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            {midiConnected ? 'MIDI Connected' : 'Connect Piano'}
          </button>
        </div>

        {/* MIDI status pill */}
        {midiStatus !== 'disconnected' && (
          <div className="mb-4 flex justify-end">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: midiConnected ? 'oklch(0.95 0.05 145)' : 'oklch(0.95 0.05 25)',
                color: midiConnected ? 'oklch(0.40 0.12 145)' : 'oklch(0.40 0.12 25)',
              }}
            >
              {midiStatusLabel[midiStatus]}
            </span>
          </div>
        )}

        {/* ── Score & streak ───────────────────────────────────────────── */}
        <div
          className="flex items-center justify-center gap-6 py-4 mb-6 rounded-2xl"
          style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{score.correct}</div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Correct</div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--line)' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>{score.wrong}</div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Wrong</div>
          </div>
          {accuracy !== null && (
            <>
              <div className="w-px h-8" style={{ background: 'var(--line)' }} />
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-strong)' }}>{accuracy}%</div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Accuracy</div>
              </div>
            </>
          )}
          {streak >= 3 && (
            <>
              <div className="w-px h-8" style={{ background: 'var(--line)' }} />
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>🔥 {streak}</div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Streak</div>
              </div>
            </>
          )}
        </div>

        {/* ── Staff canvas ─────────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : '#fffdf8',
            border: `2px solid ${
              feedback === 'correct' ? '#22c55e'
              : feedback === 'wrong' ? '#ef4444'
              : 'var(--line)'
            }`,
            boxShadow: feedback === 'correct'
              ? '0 0 0 4px oklch(0.85 0.12 145 / 0.3)'
              : feedback === 'wrong'
              ? '0 0 0 4px oklch(0.85 0.12 25 / 0.3)'
              : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: 220, display: 'block' }}
          />
          {/* Feedback overlay message */}
          {feedback !== 'idle' && (
            <div
              className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: feedback === 'correct' ? '#22c55e' : '#ef4444',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {feedback === 'correct' ? '✓ Correct!' : '✗ Try again'}
            </div>
          )}
        </div>

        {/* ── Actions row: Skip + Hint ──────────────────────────────────── */}
        <div className="flex justify-center gap-3 mb-8">
          {/* Skip */}
          <button
            onClick={() => pickNote()}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            Skip
          </button>

          {/* Hint — reveals note name on staff + highlights keyboard key */}
          <button
            onClick={() => setShowHint(h => !h)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: showHint ? 'oklch(0.55 0.18 280)' : 'var(--paper-2)',
              border: showHint ? '1px solid oklch(0.55 0.18 280)' : '1px solid var(--line)',
              color: showHint ? '#fff' : 'var(--ink-2)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {showHint ? 'Hide hint' : 'Hint'}
          </button>
        </div>


        {/* ── Virtual Keyboard ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            Virtual Keyboard
          </p>
          <VirtualKeyboard
            startOctave={kbStart}
            endOctave={kbEnd}
            highlightMidi={showHint ? (currentNote?.midi ?? null) : null}
            activeFlash={activeFlash}
            onNotePlay={handleNoteInput}
            midiConnected={midiConnected}
          />
        </div>

        {/* ── PC Key guide ─────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl p-4" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            Keyboard Shortcuts (C4–C5)
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PC_KEY_MAP).map(([key, midi]) => {
              const noteName = MIDI_NAMES[midi] ?? `M${midi}`

              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <kbd
                    className="w-8 h-8 grid place-items-center rounded-lg text-xs font-mono font-bold uppercase"
                    style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                  >
                    {key}
                  </kbd>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{noteName}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── How to play ──────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl p-5" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            How to play
          </p>
          <ol className="space-y-2 text-sm" style={{ color: 'var(--ink-2)' }}>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>1.</span> A random note appears on the staff above.</li>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>2.</span> Identify the note name and play it on the keyboard.</li>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>3.</span> <span style={{ color: '#22c55e' }}>Green</span> = correct, next note loads automatically. <span style={{ color: '#ef4444' }}>Red</span> = wrong, try again.</li>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>4.</span> Connect a MIDI piano to use a real instrument — web audio mutes automatically.</li>
          </ol>
        </div>

      </div>
    </div>
  )
}
