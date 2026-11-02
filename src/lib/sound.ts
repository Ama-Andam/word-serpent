/**
 * Tiny synthesized sound effects (Web Audio). No audio files to ship.
 * Every call is a no-op unless sound is enabled in settings.
 */
type Cue = 'key' | 'combo' | 'eat' | 'levelUp' | 'unlock' | 'crash' | 'goal' | 'miss'

let ctx: AudioContext | null = null
let enabled = false

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function audio() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.06) {
  const a = audio()
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, a.currentTime + start)
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur)
  osc.connect(g).connect(a.destination)
  osc.start(a.currentTime + start)
  osc.stop(a.currentTime + start + dur + 0.02)
}

export function play(cue: Cue) {
  if (!enabled) return
  try {
    switch (cue) {
      case 'key':
        return tone(880, 0, 0.03, 'triangle', 0.015)
      case 'miss':
        return tone(160, 0, 0.08, 'square', 0.02)
      case 'combo':
        return tone(660, 0, 0.08, 'triangle', 0.04)
      case 'eat':
        tone(523, 0, 0.08, 'triangle')
        return tone(784, 0.06, 0.12, 'triangle')
      case 'goal':
        ;[523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.2, 'sine'))
        return
      case 'levelUp':
        ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.07))
        return
      case 'unlock':
        tone(988, 0, 0.12, 'sine')
        return tone(1319, 0.1, 0.3, 'sine')
      case 'crash':
        tone(220, 0, 0.2, 'sawtooth', 0.04)
        return tone(110, 0.12, 0.35, 'sawtooth', 0.04)
    }
  } catch {
    // Audio can fail (autoplay policy, old browsers). Sound is decoration; ignore.
  }
}
