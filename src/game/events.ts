/**
 * Typed event bus. Game logic emits; UI (toasts, sounds, animations) listens.
 * This keeps rules free of UI code, so new badges/challenges never touch components.
 */
import type { Achievement } from './achievements/types'
import type { Challenge } from './challenges/types'

export interface GameEvents {
  levelUp: { level: number; title: string }
  unlock: { achievement: Achievement }
  goalHit: { goal: number }
  dailyComplete: { challenge: Challenge }
  comboTier: { multiplier: number }
}

type Handler<K extends keyof GameEvents> = (payload: GameEvents[K]) => void
// Stored loosely typed; `on`/`emit` keep the public API fully typed.
const handlers = new Map<keyof GameEvents, Set<(payload: unknown) => void>>()

export function on<K extends keyof GameEvents>(type: K, fn: Handler<K>) {
  const set = handlers.get(type) ?? new Set()
  handlers.set(type, set)
  const h = fn as (payload: unknown) => void
  set.add(h)
  return () => void set.delete(h)
}

export function emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]) {
  handlers.get(type)?.forEach((fn) => fn(payload))
}
