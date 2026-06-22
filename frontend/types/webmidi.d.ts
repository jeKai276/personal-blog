// Web MIDI API type declarations
// https://www.w3.org/TR/webmidi/

interface MIDIOptions {
  sysex?: boolean
  software?: boolean
}

interface MIDIAccess extends EventTarget {
  readonly inputs: MIDIInputMap
  readonly outputs: MIDIOutputMap
  onstatechange: ((e: MIDIConnectionEvent) => void) | null
  readonly sysexEnabled: boolean
}

interface MIDIInputMap {
  readonly size: number
  forEach(callback: (value: MIDIInput, key: string, map: MIDIInputMap) => void): void
}

interface MIDIOutputMap {
  readonly size: number
  forEach(callback: (value: MIDIOutput, key: string, map: MIDIOutputMap) => void): void
}

interface MIDIPort extends EventTarget {
  readonly id: string
  readonly manufacturer?: string
  readonly name?: string
  readonly type: 'input' | 'output'
  readonly version?: string
  readonly state: 'disconnected' | 'connected'
  readonly connection: 'open' | 'closed' | 'pending'
  onstatechange: ((e: MIDIConnectionEvent) => void) | null
  open(): Promise<MIDIPort>
  close(): Promise<MIDIPort>
}

interface MIDIInput extends MIDIPort {
  readonly type: 'input'
  onmidimessage: ((e: MIDIMessageEvent) => void) | null
}

interface MIDIOutput extends MIDIPort {
  readonly type: 'output'
  send(data: Uint8Array | number[], timestamp?: number): void
  clear(): void
}

interface MIDIMessageEvent extends Event {
  readonly data: Uint8Array
  readonly receivedTime?: number
}

interface MIDIConnectionEvent extends Event {
  readonly port: MIDIPort
}

interface Navigator {
  requestMIDIAccess(options?: MIDIOptions): Promise<MIDIAccess>
}
