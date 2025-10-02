// Audio synthesis engine for stroke playback
// Maps stroke properties to audio parameters

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3 // Master volume
    }
  }

  // Map color to instrument type and waveform
  private getInstrumentConfig(color: string): {
    waveform: OscillatorType
    attack: number
    decay: number
    sustain: number
    release: number
  } {
    const colorMap: Record<
      string,
      {
        waveform: OscillatorType
        attack: number
        decay: number
        sustain: number
        release: number
      }
    > = {
      "#ef4444": {
        // Red - Piano (sine with quick decay)
        waveform: "sine",
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 0.5,
      },
      "#3b82f6": {
        // Blue - Synth (sawtooth)
        waveform: "sawtooth",
        attack: 0.05,
        decay: 0.1,
        sustain: 0.6,
        release: 0.3,
      },
      "#10b981": {
        // Green - Pluck (triangle with fast decay)
        waveform: "triangle",
        attack: 0.001,
        decay: 0.15,
        sustain: 0.2,
        release: 0.2,
      },
      "#f59e0b": {
        // Yellow - Bell (sine with harmonics)
        waveform: "sine",
        attack: 0.01,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
      },
      "#a855f7": {
        // Purple - Pad (square, smooth)
        waveform: "square",
        attack: 0.2,
        decay: 0.2,
        sustain: 0.7,
        release: 0.5,
      },
    }

    return (
      colorMap[color] || {
        waveform: "sine",
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
      }
    )
  }

  // Map stroke length to pitch (longer = lower, shorter = higher)
  private lengthToPitch(length: number): number {
    // Map length (0-1000) to frequency (200-800 Hz)
    const minFreq = 200
    const maxFreq = 800
    const normalizedLength = Math.min(length / 1000, 1)

    // Invert: longer strokes = lower pitch
    return maxFreq - normalizedLength * (maxFreq - minFreq)
  }

  // Map stroke speed to volume (faster = louder)
  private speedToVolume(speed: number): number {
    // Map speed (0-5) to volume (0.1-0.8)
    const minVol = 0.1
    const maxVol = 0.8
    const normalizedSpeed = Math.min(speed / 5, 1)

    return minVol + normalizedSpeed * (maxVol - minVol)
  }

  // Play a note for a stroke
  playStroke(color: string, length: number, speed: number, duration = 0.5) {
    if (!this.audioContext || !this.masterGain) return

    const config = this.getInstrumentConfig(color)
    const frequency = this.lengthToPitch(length)
    const volume = this.speedToVolume(speed)

    const now = this.audioContext.currentTime

    // Create oscillator
    const oscillator = this.audioContext.createOscillator()
    oscillator.type = config.waveform
    oscillator.frequency.value = frequency

    // Create gain envelope
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = 0

    // ADSR envelope
    const attackTime = config.attack
    const decayTime = config.decay
    const sustainLevel = config.sustain * volume
    const releaseTime = config.release

    // Attack
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + attackTime)

    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime)

    // Hold sustain
    const sustainDuration = Math.max(duration - attackTime - decayTime - releaseTime, 0.1)
    gainNode.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime + sustainDuration)

    // Release
    gainNode.gain.linearRampToValueAtTime(0, now + attackTime + decayTime + sustainDuration + releaseTime)

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    // Start and stop
    oscillator.start(now)
    oscillator.stop(now + attackTime + decayTime + sustainDuration + releaseTime)
  }

  // Stop all sounds
  stop() {
    if (this.audioContext) {
      // Create a new audio context to stop all sounds
      this.audioContext.close()
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3
    }
  }
}
