/**
 * Combo meter. Every keystroke keeps it alive; every finished word adds to the count.
 * Pause longer than the window and it resets. The multiplier scales XP.
 */
export const COMBO_WINDOW_MS = 2500
const TIERS = [10, 25, 50] // word counts for x2, x3, x4

export interface Combo {
  count: number
  lastAt: number
  peak: number
}

export const emptyCombo = (): Combo => ({ count: 0, lastAt: 0, peak: 0 })

export const isAlive = (c: Combo, now: number) => c.count > 0 && now - c.lastAt <= COMBO_WINDOW_MS

/** Keystroke: keep the combo alive (or reset it if the pause was too long). */
export function touch(c: Combo, now: number): Combo {
  return { ...c, count: isAlive(c, now) || c.count === 0 ? c.count : 0, lastAt: now }
}

/** Finished word: grow the combo. */
export function bump(c: Combo, now: number): Combo {
  const count = (now - c.lastAt <= COMBO_WINDOW_MS ? c.count : 0) + 1
  return { count, lastAt: now, peak: Math.max(c.peak, count) }
}

/** A mistake (serpent typo) breaks the chain. */
export const breakCombo = (c: Combo, now: number): Combo => ({ ...c, count: 0, lastAt: now })

export function multiplier(count: number) {
  return 1 + TIERS.filter((t) => count >= t).length
}

/** Progress toward the next multiplier, 0..1 (1 when maxed). */
export function tierProgress(count: number) {
  const next = TIERS.find((t) => count < t)
  if (next === undefined) return 1
  const prev = [0, ...TIERS][TIERS.indexOf(next)]
  return (count - prev) / (next - prev)
}
