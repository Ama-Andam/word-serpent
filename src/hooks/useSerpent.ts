/**
 * Drives one Word Serpent run: owns the engine state, the drift timer,
 * combo, scoring, and XP. Returns everything the board needs to render.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { breakCombo, bump, emptyCombo, multiplier, type Combo } from '@/game/combo'
import { emit } from '@/game/events'
import { accuracyOf, backspace, createGame, drift, typeChar, type SerpentState } from '@/game/serpent/engine'
import type { Tier } from '@/game/serpent/tiers'
import { XP } from '@/game/xp'
import { hashString, seeded, type Rng } from '@/lib/rng'
import { play } from '@/lib/sound'
import { useStore } from '@/store/useStore'

export interface RunConfig {
  tier: Tier
  layout: string[]
  /** null = endless */
  inkGoal: number | null
  driftMs: number
  gardenId?: string
  /** Seed for daily runs so everyone gets the same board. */
  seed?: string
}

export interface RunEnd {
  state: SerpentState
  score: number
  wpm: number
  accuracy: number
  durationMs: number
  peakCombo: number
}

export function useSerpent(config: RunConfig, onEnd: (end: RunEnd) => void) {
  const rng = useRef<Rng>(seeded(config.seed ? hashString(config.seed) : Date.now()))
  const words = config.tier.words
  const [state, setState] = useState<SerpentState>(() => createGame(config.layout, config.inkGoal, words, rng.current))
  const [combo, setCombo] = useState<Combo>(emptyCombo)
  const [score, setScore] = useState(0)
  const [miss, setMiss] = useState(0)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [deadline, setDeadline] = useState(0)

  const live = useRef({ state, combo, score, startedAt: 0, pausedAt: 0, liveXp: 0 })

  // In endless runs the drift speeds up 4% per ink drop (down to 55%).
  const driftFor = useCallback(
    (s: SerpentState) => (config.inkGoal === null ? Math.max(config.driftMs * 0.55, config.driftMs * 0.96 ** s.inkEaten) : config.driftMs),
    [config.driftMs, config.inkGoal],
  )

  const end = useCallback(
    (s: SerpentState) => {
      const l = live.current
      const durationMs = Math.max(1000, Date.now() - l.startedAt)
      onEnd({
        state: s,
        score: l.score,
        wpm: s.charsTyped / 5 / (durationMs / 60000),
        accuracy: accuracyOf(s),
        durationMs,
        peakCombo: l.combo.peak,
      })
    },
    [onEnd],
  )

  const award = useCallback((n: number) => {
    live.current.liveXp += n
    useStore.getState().gainXp(n)
  }, [])

  const apply = useCallback(
    (next: SerpentState, moved: boolean, ate: boolean, now: number) => {
      if (moved || ate) setDeadline(now + driftFor(next))
      if (ate) {
        play('eat')
        const mult = multiplier(live.current.combo.count)
        live.current.score += 10 * mult
        setScore(live.current.score)
        award(XP.perInk * mult)
      }
      live.current.state = next
      setState(next)
      if (next.status === 'crashed') play('crash')
      if (next.status !== 'playing') end(next)
    },
    [award, driftFor, end],
  )

  /** Feed a key from the input. Returns false if it was rejected. */
  const input = useCallback(
    (ch: string) => {
      const s = live.current.state
      if (s.status !== 'playing' || paused) return true
      const now = Date.now()
      if (!started) {
        setStarted(true)
        live.current.startedAt = now
        setDeadline(now + driftFor(s))
      }
      if (ch === 'Backspace') {
        live.current.state = backspace(s)
        setState(live.current.state)
        return true
      }
      const [next, r] = typeChar(s, ch, words, rng.current)
      if (r.mistake) {
        play('miss')
        setMiss((n) => n + 1)
        const c = breakCombo(live.current.combo, now)
        live.current.combo = c
        setCombo(c)
        live.current.state = next
        setState(next)
        return false
      }
      if (r.moved) {
        const before = multiplier(live.current.combo.count)
        const c = bump(live.current.combo, now)
        live.current.combo = c
        setCombo(c)
        const mult = multiplier(c.count)
        if (mult > before) emit('comboTier', { multiplier: mult })
        live.current.score += mult
        setScore(live.current.score)
        award(mult)
      } else play('key')
      apply(next, r.moved, r.ate, now)
      return true
    },
    [apply, award, driftFor, paused, started, words],
  )

  // Drift timer: when it runs out, the serpent slides forward on its own.
  useEffect(() => {
    if (!started || paused || state.status !== 'playing' || !deadline) return
    const id = window.setTimeout(() => {
      const now = Date.now()
      const [next, ate] = drift(live.current.state, words, rng.current)
      const c = breakCombo(live.current.combo, now)
      live.current.combo = c
      setCombo(c)
      apply(next, true, ate, now)
    }, Math.max(0, deadline - Date.now()))
    return () => window.clearTimeout(id)
  }, [apply, deadline, paused, started, state.status, words])

  const togglePause = useCallback(() => {
    if (!started || live.current.state.status !== 'playing') return
    setPaused((p) => {
      const now = Date.now()
      if (!p) live.current.pausedAt = now
      else {
        // Push the deadline and start time forward by the paused duration.
        const gap = now - live.current.pausedAt
        live.current.startedAt += gap
        setDeadline((d) => d + gap)
      }
      return !p
    })
  }, [started])

  return {
    state,
    combo,
    score,
    miss,
    started,
    paused,
    deadline,
    driftMs: driftFor(state),
    liveXp: () => live.current.liveXp,
    input,
    togglePause,
  }
}
