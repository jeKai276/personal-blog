'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'

// ─── Responsive hook ───────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => {
    const handler = () => setW(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return w
}

// ─── Music Theory Data ─────────────────────────────────────────────────────

type Clef = 'treble' | 'bass' | 'both'

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
  // Range: C3 to B6
  { midi: 48, name: 'C3', pitchClass: 'C', octave: 3, staffPosition: -13, accidental: '' },
  { midi: 50, name: 'D3', pitchClass: 'D', octave: 3, staffPosition: -12, accidental: '' },
  { midi: 52, name: 'E3', pitchClass: 'E', octave: 3, staffPosition: -11, accidental: '' },
  { midi: 53, name: 'F3', pitchClass: 'F', octave: 3, staffPosition: -10, accidental: '' },
  { midi: 55, name: 'G3', pitchClass: 'G', octave: 3, staffPosition: -9, accidental: '' },
  { midi: 57, name: 'A3', pitchClass: 'A', octave: 3, staffPosition: -8, accidental: '' },
  { midi: 59, name: 'B3', pitchClass: 'B', octave: 3, staffPosition: -7, accidental: '' },
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
  { midi: 86, name: 'D6', pitchClass: 'D', octave: 6, staffPosition:  9, accidental: '' },
  { midi: 88, name: 'E6', pitchClass: 'E', octave: 6, staffPosition: 10, accidental: '' },
  { midi: 89, name: 'F6', pitchClass: 'F', octave: 6, staffPosition: 11, accidental: '' },
  { midi: 91, name: 'G6', pitchClass: 'G', octave: 6, staffPosition: 12, accidental: '' },
  { midi: 93, name: 'A6', pitchClass: 'A', octave: 6, staffPosition: 13, accidental: '' },
  { midi: 95, name: 'B6', pitchClass: 'B', octave: 6, staffPosition: 14, accidental: '' },
]

const BASS_NOTES: NoteInfo[] = [
  // Range: C2 to B4, middle line = D3 (MIDI 50)
  // Position 0 = middle line (D3)
  { midi: 36, name: 'C2', pitchClass: 'C', octave: 2, staffPosition: -8, accidental: '' },
  { midi: 38, name: 'D2', pitchClass: 'D', octave: 2, staffPosition: -7, accidental: '' },
  { midi: 40, name: 'E2', pitchClass: 'E', octave: 2, staffPosition: -6, accidental: '' },
  { midi: 41, name: 'F2', pitchClass: 'F', octave: 2, staffPosition: -5, accidental: '' },
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
  { midi: 65, name: 'F4', pitchClass: 'F', octave: 4, staffPosition:  9, accidental: '' },
  { midi: 67, name: 'G4', pitchClass: 'G', octave: 4, staffPosition: 10, accidental: '' },
  { midi: 69, name: 'A4', pitchClass: 'A', octave: 4, staffPosition: 11, accidental: '' },
  { midi: 71, name: 'B4', pitchClass: 'B', octave: 4, staffPosition: 12, accidental: '' },
]

// Fixed range options: Start = C notes, End = B notes (one full octave each)
// Fixed range options: Start = C notes, End = B notes
const RANGE_START_OPTIONS = [
  { label: 'C3', octave: 3, midi: 48 },
  { label: 'C4', octave: 4, midi: 60 },
  { label: 'C5', octave: 5, midi: 72 },
  { label: 'C6', octave: 6, midi: 84 },
]
const RANGE_END_OPTIONS = [
  { label: 'B3', octave: 3, midi: 59 },
  { label: 'B4', octave: 4, midi: 71 },
  { label: 'B5', octave: 5, midi: 83 },
  { label: 'B6', octave: 6, midi: 95 },
]

// ─── Canvas Staff Drawing ─────────────────────────────────────────────────

interface StaffColors { line: string; note: string; text: string; extra: string }

/** Draws a single staff section centred at `midY` using the given `lineGap`. */
function drawOneStaff(
  ctx: CanvasRenderingContext2D,
  width: number,
  clef: 'treble' | 'bass',
  note: NoteInfo | null,
  colors: StaffColors,
  showHint: boolean,
  midY: number,
  lineGap: number,
) {
  const staffPad = 40

  // 5 staff lines
  ctx.strokeStyle = colors.line
  ctx.lineWidth   = 1.5
  for (let i = -2; i <= 2; i++) {
    const y = midY + i * lineGap * 2
    ctx.beginPath()
    ctx.moveTo(staffPad, y)
    ctx.lineTo(width - staffPad, y)
    ctx.stroke()
  }

  // Clef symbol
  ctx.fillStyle = colors.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic' // Prevent state leak from showHint

  if (clef === 'treble') {
    ctx.font = `${lineGap * 11}px serif`
    ctx.fillText('𝄞', staffPad - 10, midY + lineGap * 4)
  } else {
    ctx.font = `${lineGap * 5}px serif`
    ctx.fillText('𝄢', staffPad - 2, midY + lineGap * 0.5)
  }

  if (!note) return

  const noteX = width / 2 + 30
  const noteY = midY - note.staffPosition * lineGap
  const noteR = lineGap * 0.85

  // Ledger lines
  ctx.strokeStyle = colors.extra
  ctx.lineWidth   = 1.5
  const ledgerW   = noteR * 2.6
  // Ledger lines are drawn at even positions >= 6 or <= -6
  for (let p = 6; p <= note.staffPosition; p += 2) {
    const ly = midY - p * lineGap
    ctx.beginPath(); ctx.moveTo(noteX - ledgerW, ly); ctx.lineTo(noteX + ledgerW, ly); ctx.stroke()
  }
  for (let p = -6; p >= note.staffPosition; p -= 2) {
    const ly = midY - p * lineGap
    ctx.beginPath(); ctx.moveTo(noteX - ledgerW, ly); ctx.lineTo(noteX + ledgerW, ly); ctx.stroke()
  }

  // Note head
  ctx.fillStyle = ctx.strokeStyle = colors.note
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, noteR, noteR * 0.75, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // Stem
  // Rule: On or above middle line (staffPosition >= 0) -> Stem DOWN (+Y), LEFT side.
  // Rule: Below middle line (staffPosition < 0) -> Stem UP (-Y), RIGHT side.
  const isDownStem = note.staffPosition >= 0
  const stemDir    = isDownStem ? 1 : -1
  const stemX      = isDownStem ? noteX - noteR + 1 : noteX + noteR - 1
  
  // Stem length: 1 octave. (3.5 line spacings = 3.5 * 2 * lineGap = 7 * lineGap)
  const stemLength = 7 * lineGap

  ctx.beginPath()
  ctx.moveTo(stemX, noteY + stemDir * noteR * 0.5)
  ctx.lineTo(stemX, noteY + stemDir * stemLength)
  ctx.stroke()

  // Note name hint
  if (showHint) {
    ctx.fillStyle = colors.text
    ctx.font      = `500 ${lineGap * 1.1}px 'Geist', sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(note.name, noteX, midY + lineGap * 5.5)
  }
}

function drawStaff(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  clef: Clef,
  note: NoteInfo | null,
  feedback: 'correct' | 'wrong' | 'idle',
  isDark: boolean,
  showHint: boolean,
  noteClef: 'treble' | 'bass' = 'treble',
) {
  ctx.clearRect(0, 0, width, height)

  const baseNote: StaffColors = {
    line:  isDark ? 'rgba(235,229,244,0.5)' : 'rgba(31,26,38,0.4)',
    note:  feedback === 'correct' ? '#22c55e'
         : feedback === 'wrong'   ? '#ef4444'
         : isDark                 ? '#ebe5f4' : '#1f1a26',
    text:  isDark ? '#ebe5f4' : '#1f1a26',
    extra: isDark ? 'rgba(235,229,244,0.7)' : 'rgba(31,26,38,0.6)',
  }
  // Idle color for the inactive staff in "both" mode
  const idleNote = isDark ? '#ebe5f4' : '#1f1a26'

  if (clef === 'both') {
    // Tight spacing for Grand Staff — enough room for middle C ledger line.
    // With mobile canvas 200px: lineGap = 200/24 = 8.3px (5 lines span 33px — compact but readable).
    const lineGap = Math.min(height / 24, 12)
    const midY_treble = height / 2 - 6 * lineGap
    const midY_bass   = height / 2 + 6 * lineGap

    // Draw Brace and System Barline
    const staffPad = 40
    const yTop = midY_treble - 4 * lineGap
    const yBot = midY_bass + 4 * lineGap

    ctx.strokeStyle = baseNote.line
    ctx.lineWidth   = 1.5
    
    // System barline
    ctx.beginPath()
    ctx.moveTo(staffPad, yTop)
    ctx.lineTo(staffPad, yBot)
    ctx.stroke()

    // Brace (curly bracket)
    const braceX = staffPad - 28
    const w = 8
    const yMid = height / 2
    ctx.beginPath()
    ctx.moveTo(braceX + w, yTop)
    ctx.bezierCurveTo(braceX, yTop, braceX, yTop, braceX, yTop + w)
    ctx.lineTo(braceX, yMid - w)
    ctx.bezierCurveTo(braceX, yMid, braceX - w, yMid, braceX - w, yMid)
    ctx.bezierCurveTo(braceX, yMid, braceX, yMid, braceX, yMid + w)
    ctx.lineTo(braceX, yBot - w)
    ctx.bezierCurveTo(braceX, yBot, braceX, yBot, braceX + w, yBot)
    ctx.stroke()

    // Treble (top half)
    const trebleColors: StaffColors = {
      ...baseNote,
      note: noteClef === 'treble' ? baseNote.note : idleNote,
    }
    drawOneStaff(
      ctx, width, 'treble',
      noteClef === 'treble' ? note : null,
      trebleColors,
      showHint && noteClef === 'treble',
      midY_treble, lineGap,
    )

    // Bass (bottom half)
    const bassColors: StaffColors = {
      ...baseNote,
      note: noteClef === 'bass' ? baseNote.note : idleNote,
    }
    drawOneStaff(
      ctx, width, 'bass',
      noteClef === 'bass' ? note : null,
      bassColors,
      showHint && noteClef === 'bass',
      midY_bass, lineGap,
    )
  } else {
    // Single staff: allow 2 ledger lines above+below (4 lineGaps safety zone each side).
    // With mobile canvas 140px: lineGap = 140/20 = 7px (4 staff lines span 28px — tight but OK).
    const lineGap = Math.min(height / 20, 18)
    drawOneStaff(ctx, width, clef, note, baseNote, showHint, height / 2, lineGap)
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
  highlightMidi: number | null   // Blue hint highlight (only when showHint)
  scrollHintMidi: number | null  // Triggers scrollIntoView (only when showHint)
  scrollRangeMidi: number | null // Triggers scroll when range changes
  activeFlash: { midi: number; color: string } | null
  onNotePlay: (midi: number) => void
  midiConnected: boolean
}

// Fixed key dimensions — these will be overridden per-render based on screen size.
// See VirtualKeyboard component which reads isMobile to scale down.
const WHITE_W_DESK  = 42
const WHITE_H_DESK  = 130
const BLACK_W_DESK  = 26
const BLACK_H_DESK  = 82
const WHITE_W_MOB   = 28
const WHITE_H_MOB   = 90
const BLACK_W_MOB   = 18
const BLACK_H_MOB   = 56
// Semitone offset within an octave for each white key (C D E F G A B)
const WHITE_SEMITONES_LIST = [0, 2, 4, 5, 7, 9, 11]
// Black key semitones and their left-offset relative to the octave block
// offset = how many white-key widths from the left of the C key
const BLACK_KEYS_DEF = [
  { semitone: 1,  leftFrac: 0.6 },  // C#
  { semitone: 3,  leftFrac: 1.6 },  // D#
  { semitone: 6,  leftFrac: 3.6 },  // F#
  { semitone: 8,  leftFrac: 4.6 },  // G#
  { semitone: 10, leftFrac: 5.6 },  // A#
]

function VirtualKeyboard({ startOctave, endOctave, highlightMidi, scrollHintMidi, scrollRangeMidi, activeFlash, onNotePlay, midiConnected }: KeyboardProps) {
  const screenW = useWindowWidth()
  const isMobile = screenW < 640

  const WHITE_W = isMobile ? WHITE_W_MOB : WHITE_W_DESK
  const WHITE_H = isMobile ? WHITE_H_MOB : WHITE_H_DESK
  const BLACK_W = isMobile ? BLACK_W_MOB : BLACK_W_DESK
  const BLACK_H = isMobile ? BLACK_H_MOB : BLACK_H_DESK

  const octaves  = endOctave - startOctave + 1
  const totalPxW = octaves * 7 * WHITE_W

  // Ref map for auto-scroll: midi -> element
  const keyElRefs = useRef<Map<number, HTMLElement>>(new Map())

  // Auto-scroll ONLY on activeFlash — this is triggered by the user pressing a key.
  // (Hint-triggered scroll is handled by the parent via the scrollHintRef callback.)
  useEffect(() => {
    if (!activeFlash) return
    const el = keyElRefs.current.get(activeFlash.midi)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeFlash])

  // Expose a way for the parent to programmatically scroll to any midi key
  // (used by Hint button only — never triggered automatically on new note)
  useEffect(() => {
    if (scrollHintMidi == null) return
    const el = keyElRefs.current.get(scrollHintMidi)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [scrollHintMidi])

  // Scroll to the start of the note range when it changes or on load
  useEffect(() => {
    if (scrollRangeMidi == null) return
    const el = keyElRefs.current.get(scrollRangeMidi)
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }, 50)
    }
  }, [scrollRangeMidi])

  return (
    <div
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch' as any,
        overscrollBehaviorX: 'contain',
        paddingBottom: 8,
      }}
    >
      {/* Keyboard canvas */}
      <div
        style={{
          position: 'relative',
          width: totalPxW,
          height: WHITE_H + 4,
          userSelect: 'none',
        }}
      >
        {/* White keys */}
        {Array.from({ length: octaves }, (_, oi) => {
          const oct = startOctave + oi
          return WHITE_SEMITONES_LIST.map((semitone, ki) => {
            const midi  = (oct + 1) * 12 + semitone
            const left  = (oi * 7 + ki) * WHITE_W
            const isFlash  = activeFlash?.midi === midi
            const isTarget = highlightMidi === midi

            let bg = '#f9f9f7'
            if (isFlash)  bg = activeFlash!.color
            else if (isTarget) bg = 'rgba(96,165,250,0.45)'

            return (
              <div
                key={`w-${midi}`}
                ref={el => { if (el) keyElRefs.current.set(midi, el) }}
                onClick={() => onNotePlay(midi)}
                style={{
                  position: 'absolute',
                  left,
                  top: 0,
                  width: WHITE_W - 2,
                  height: WHITE_H,
                  background: bg,
                  border: '1px solid #ccc',
                  borderRadius: '0 0 5px 5px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background 0.1s',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 4,
                }}
              >
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isFlash || isTarget ? '#1f1a26' : '#aaa',
                  pointerEvents: 'none',
                  lineHeight: 1,
                }}>
                  {WHITE_KEY_NAMES[ki]}{oct}
                </span>
              </div>
            )
          })
        })}

        {/* Black keys — rendered above white keys */}
        {Array.from({ length: octaves }, (_, oi) => {
          const oct = startOctave + oi
          return BLACK_KEYS_DEF.map(({ semitone, leftFrac }) => {
            const midi  = (oct + 1) * 12 + semitone
            const left  = (oi * 7 + leftFrac) * WHITE_W - BLACK_W / 2
            const isFlash  = activeFlash?.midi === midi
            const isTarget = highlightMidi === midi

            let bg = '#1a1625'
            if (isFlash)  bg = activeFlash!.color
            else if (isTarget) bg = '#3b82f6'

            return (
              <div
                key={`b-${midi}`}
                ref={el => { if (el) keyElRefs.current.set(midi, el) }}
                onClick={(e) => { e.stopPropagation(); onNotePlay(midi) }}
                style={{
                  position: 'absolute',
                  left,
                  top: 0,
                  width: BLACK_W,
                  height: BLACK_H,
                  background: bg,
                  border: '1px solid #000',
                  borderRadius: '0 0 4px 4px',
                  cursor: 'pointer',
                  zIndex: 1,
                  transition: 'background 0.1s',
                }}
              />
            )
          })
        })}
      </div>

      {!midiConnected && (
        <p className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Click a key &middot; Use keyboard <kbd style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '0 4px' }}>A–K</kbd> for C4–B4
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
  // Range state: stored as octave numbers (2–6) for C-start and B-end
  const [rangeStartOct, setRangeStartOct] = useState<number>(4) // Default start: C4 (MIDI 60)
  const [rangeEndOct,   setRangeEndOct]   = useState<number>(5) // Default end:   B5 (MIDI 83)
  const [currentNote, setCurrentNote] = useState<NoteInfo | null>(null)
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | 'idle'>('idle')
  const [midiStatus, setMidiStatus]   = useState<'disconnected' | 'connected' | 'error' | 'unsupported'>('disconnected')
  const [score, setScore]             = useState({ correct: 0, wrong: 0 })
  const [isDark, setIsDark]           = useState(false)
  const [activeFlash, setActiveFlash] = useState<{ midi: number; color: string } | null>(null)
  const [streak, setStreak]           = useState(0)
  const [showHint, setShowHint]       = useState(false)
  // Which staff has the active note ('both' mode uses both staves, but note is on one)
  const [noteClef, setNoteClef]       = useState<'treble' | 'bass'>('treble')

  const midiConnected = midiStatus === 'connected'

  // Derive exact MIDI bounds from the octave selectors
  const minNoteMidi = RANGE_START_OPTIONS.find(o => o.octave === rangeStartOct)?.midi ?? 60
  const maxNoteMidi = RANGE_END_OPTIONS.find(o => o.octave === rangeEndOct)?.midi ?? 83

  // Detect theme
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Pick random note — also resets hint
  // In 'both' mode: 50/50 draw from treble or bass pool each turn
  const pickNote = useCallback((nextClef?: Clef) => {
    const activeClef = nextClef ?? clef
    let pool: NoteInfo[]
    let resolvedClef: 'treble' | 'bass'
    if (activeClef === 'both') {
      resolvedClef = Math.random() < 0.5 ? 'treble' : 'bass'
      pool = resolvedClef === 'treble' ? TREBLE_NOTES : BASS_NOTES
    } else {
      resolvedClef = activeClef
      pool = activeClef === 'treble' ? TREBLE_NOTES : BASS_NOTES
    }

    // Filter by the configured MIDI range [minNoteMidi, maxNoteMidi]
    let filteredPool = pool.filter(n => n.midi >= minNoteMidi && n.midi <= maxNoteMidi)
    if (filteredPool.length === 0) {
      // Fallback if range produces no notes for this clef — use full pool
      filteredPool = pool
    }

    const note = filteredPool[Math.floor(Math.random() * filteredPool.length)]
    setCurrentNote(note)
    setNoteClef(resolvedClef)
    setFeedback('idle')
    setShowHint(false)
  }, [clef, minNoteMidi, maxNoteMidi])

  // Init game and update note when range changes
  useEffect(() => {
    pickNote()
  }, [rangeStartOct, rangeEndOct, pickNote])

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

    // Debug log per user request
    console.log('Expected MIDI:', currentNote.midi, '| Received MIDI:', midi)

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

  // Prevent stale closures in MIDI event listeners without constant re-attaching
  const handleNoteInputRef = useRef(handleNoteInput)
  useEffect(() => {
    handleNoteInputRef.current = handleNoteInput
  }, [handleNoteInput])

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
      drawStaff(ctx, w, h, clef, currentNote, feedback, isDark, showHint, noteClef)
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [clef, currentNote, feedback, isDark, showHint, noteClef])


  // ── Web MIDI & Web Bluetooth (BLE MIDI) ────────────────────────────────
  const connectMidi = useCallback(async () => {
    // 1. Try standard Web MIDI (Chrome, Edge, Android, etc.)
    if (navigator.requestMIDIAccess) {
      try {
        const access = await navigator.requestMIDIAccess({ sysex: false })
        midiAccessRef.current = access
        setMidiStatus('connected')

        function attachListeners(acc: MIDIAccess) {
          acc.inputs.forEach(input => {
            input.onmidimessage = (e: MIDIMessageEvent) => {
              if (!e.data) return
              const [status, note, velocity] = Array.from(e.data)
              const cmd = status & 0xf0
              if ((cmd === 0x90 && velocity > 0) && note !== undefined) {
                handleNoteInputRef.current(note)
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
        return
      } catch {
        // Fallthrough to BLE MIDI if standard Web MIDI is blocked or fails
      }
    }

    // 2. Fallback to Web Bluetooth (for Bluefy / iOS)
    const nav = navigator as any
    if (nav.bluetooth && nav.bluetooth.requestDevice) {
      try {
        const device = await nav.bluetooth.requestDevice({
          filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }]
        })
        const server = await device.gatt?.connect()
        if (!server) throw new Error("GATT connection failed")
        
        const service = await server.getPrimaryService('03b80e5a-ede8-4b33-a751-6ce34ec4c700')
        const characteristic = await service.getCharacteristic('7772e5db-3868-4112-a1a9-f2669d106bf3')
        
        await characteristic.startNotifications()
        setMidiStatus('connected')
        
        let runningStatus = 0
        
        characteristic.addEventListener('characteristicvaluechanged', (e: any) => {
          const data = new Uint8Array(e.target.value.buffer)
          if (data.length < 3) return
          
          let i = 1 // skip header (data[0])
          while (i < data.length) {
            const b = data[i]
            if (b >= 0x80) { 
              // Timestamp or Status
              if (i + 1 < data.length && data[i + 1] >= 0x80) {
                // b is timestamp, next is status
                runningStatus = data[i + 1]
                i += 2
              } else {
                // b is timestamp, next is data
                i += 1
              }
            } else { 
              // Data byte
              const cmd = runningStatus & 0xf0
              if (cmd === 0x90 || cmd === 0x80) {
                const note = data[i]
                const vel = data[i + 1] !== undefined ? data[i + 1] : 0
                if (cmd === 0x90 && vel > 0) {
                  handleNoteInputRef.current(note)
                }
                i += 2
              } else {
                i += 1 // unknown data length, skip 1 and hope for sync
              }
            }
          }
        })
        
        device.addEventListener('gattserverdisconnected', () => {
          setMidiStatus('disconnected')
        })
        return
      } catch (err) {
        console.error('BLE MIDI Error', err)
        setMidiStatus('error')
        return
      }
    }

    // 3. Neither supported
    setMidiStatus('unsupported')
  }, [])

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
  // Virtual keyboard ALWAYS renders C3-B6, only the random note generation respects the range limit
  const kbStart = 3
  const kbEnd   = 6

  // Responsive canvas height
  const screenW = useWindowWidth()
  const isMobile = screenW < 640
  const canvasHeight = isMobile
    ? (clef === 'both' ? 200 : 140)
    : (clef === 'both' ? 380 : 240)

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
    <div
      style={{
        background: 'var(--paper)',
        color: 'var(--ink)',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable content area — grows to fill, scrolls only if needed on large screens */}
      <div
        style={{
          flex: 1,
          overflowY: isMobile ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      <div
        style={{
          maxWidth: 768,
          width: '100%',
          margin: '0 auto',
          padding: isMobile ? '8px 12px 4px' : '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>
            ✦ — Music
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight" style={{ color: 'var(--ink)' }}>
            Piano Sight Reading
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Read the note on the staff and play it on the keyboard.
          </p>
        </div>

        {/* ── Controls row ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: isMobile ? 6 : 16 }}>
          {/* Clef toggle + Range */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 999, padding: 3, background: 'var(--paper-2)', border: '1px solid var(--line)' }}
            >
              {(['treble', 'bass', 'both'] as Clef[]).map(c => (
                <button
                  key={c}
                  onClick={() => switchClef(c)}
                  style={{
                    padding: isMobile ? '3px 10px' : '6px 16px',
                    fontSize: isMobile ? 11 : 13,
                    borderRadius: 999,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    background: clef === c ? 'var(--ink)' : 'transparent',
                    color: clef === c ? 'var(--paper)' : 'var(--muted)',
                    transition: 'background 0.15s',
                  }}
                >
                  {c === 'treble' ? '𝄞 Treble' : c === 'bass' ? '𝄢 Bass' : '𝄞𝄢 Both'}
                </button>
              ))}
            </div>

            {/* Range Configuration */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '3px 12px' : '6px 16px', borderRadius: 999, background: 'var(--paper-2)', border: '1px solid var(--line)', fontSize: isMobile ? 11 : 13, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'var(--paper-3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--paper-2)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Range:
              </span>

              <select
                value={rangeStartOct}
                onChange={(e) => {
                  const oct = Number(e.target.value)
                  setRangeStartOct(oct)
                  if (oct > rangeEndOct) setRangeEndOct(oct)
                }}
                style={{ background: 'transparent', outline: 'none', fontWeight: 600, appearance: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: 'inherit' }}
              >
                {RANGE_START_OPTIONS.map(o => (
                  <option key={o.octave} value={o.octave} style={{ color: '#000' }}>{o.label}</option>
                ))}
              </select>

              <span style={{ color: 'var(--muted)' }}>—</span>

              <select
                value={rangeEndOct}
                onChange={(e) => {
                  const oct = Number(e.target.value)
                  setRangeEndOct(oct)
                  if (oct < rangeStartOct) setRangeStartOct(oct)
                }}
                style={{ background: 'transparent', outline: 'none', fontWeight: 600, appearance: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: 'inherit' }}
              >
                {RANGE_END_OPTIONS.map(o => (
                  <option key={o.octave} value={o.octave} style={{ color: '#000' }}>{o.label}</option>
                ))}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)', marginLeft: 2 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          {/* MIDI connect */}
          <button
            id="btn-connect-piano"
            onClick={connectMidi}
            disabled={midiConnected}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isMobile ? '4px 10px' : '8px 18px',
              borderRadius: 999, fontSize: isMobile ? 11 : 13, fontWeight: 500,
              border: 'none', cursor: midiConnected ? 'default' : 'pointer',
              background: midiConnected ? 'oklch(0.55 0.16 145)' : 'var(--ink)',
              color: 'var(--paper)',
              transition: 'background 0.15s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: midiConnected ? '#86efac' : '#9ca3af', display: 'inline-block' }} />
            {midiConnected ? 'Connected' : 'Connect Piano'}
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

        {/* ── Score & streak ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: isMobile ? 12 : 24,
            padding: isMobile ? '6px 0' : '16px 0',
            marginBottom: isMobile ? 6 : 16,
            borderRadius: 16,
            background: 'var(--paper-2)',
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#22c55e' }}>{score.correct}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Correct</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--line)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#ef4444' }}>{score.wrong}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Wrong</div>
          </div>
          {accuracy !== null && (
            <>
              <div style={{ width: 1, height: 28, background: 'var(--line)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: 'var(--accent-strong)' }}>{accuracy}%</div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Accuracy</div>
              </div>
            </>
          )}
          {streak >= 3 && (
            <>
              <div style={{ width: 1, height: 28, background: 'var(--line)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#f59e0b' }}>🔥 {streak}</div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Streak</div>
              </div>
            </>
          )}
        </div>

        {/* ── Staff canvas ──────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: isMobile ? 6 : 16,
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
            flexShrink: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: canvasHeight, display: 'block' }}
          />
          {feedback !== 'idle' && (
            <div
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: 8, pointerEvents: 'none',
                fontSize: 12, fontWeight: 600,
                color: feedback === 'correct' ? '#22c55e' : '#ef4444',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              {feedback === 'correct' ? '✓ Correct!' : '✗ Try again'}
            </div>
          )}
        </div>

        {/* ── Actions row: Skip + Hint ───────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: isMobile ? 6 : 24, flexShrink: 0 }}>
          <button
            onClick={() => pickNote()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isMobile ? '5px 14px' : '8px 20px',
              borderRadius: 999, fontSize: isMobile ? 12 : 14, fontWeight: 500,
              border: '1px solid var(--line)', cursor: 'pointer',
              background: 'var(--paper-2)', color: 'var(--ink-2)',
              transition: 'opacity 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            Skip
          </button>

          <button
            onClick={() => setShowHint(h => !h)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isMobile ? '5px 14px' : '8px 20px',
              borderRadius: 999, fontSize: isMobile ? 12 : 14, fontWeight: 500,
              border: showHint ? '1px solid oklch(0.55 0.18 280)' : '1px solid var(--line)',
              cursor: 'pointer',
              background: showHint ? 'oklch(0.55 0.18 280)' : 'var(--paper-2)',
              color: showHint ? '#fff' : 'var(--ink-2)',
              transition: 'all 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {showHint ? 'Hide hint' : 'Hint'}
          </button>
        </div>


        {/* ── Virtual Keyboard ──────────────────────────────────────────── */}
        <div
          style={{
            borderRadius: 14,
            padding: isMobile ? '8px 8px 4px' : '16px',
            background: 'var(--paper-2)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, color: 'var(--muted)' }}>
            Virtual Keyboard
          </p>
          <VirtualKeyboard
            startOctave={kbStart}
            endOctave={kbEnd}
            highlightMidi={showHint ? (currentNote?.midi ?? null) : null}
            scrollHintMidi={showHint ? (currentNote?.midi ?? null) : null}
            scrollRangeMidi={minNoteMidi}
            activeFlash={activeFlash}
            onNotePlay={handleNoteInput}
            midiConnected={midiConnected}
          />
        </div>

        {/* ── PC Key guide (desktop only) ───────────────────────────── */}
        {!isMobile && (
          <div className="mt-4 rounded-2xl p-4" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
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
        )}

        {/* ── How to play (always shown) ────────────────────────────── */}
        <div className="mt-4 rounded-2xl p-4" style={{ background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>How to play</p>
          <ol className="space-y-1 text-sm" style={{ color: 'var(--ink-2)' }}>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>1.</span> A random note appears on the staff above.</li>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>2.</span> Identify the note name and play it on the keyboard.</li>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>3.</span> <span style={{ color: '#22c55e' }}>Green</span> = correct, next note loads automatically. <span style={{ color: '#ef4444' }}>Red</span> = wrong, try again.</li>
            <li><span className="font-semibold" style={{ color: 'var(--ink)' }}>4.</span> Connect a MIDI piano to use a real instrument — web audio mutes automatically.</li>
          </ol>
        </div>

      </div>
      </div>
    </div>
  )
}
