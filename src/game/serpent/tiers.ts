import { clamp } from '@/lib/utils'
import { WORDS } from './words'

export type TierId = 'hatchling' | 'viper' | 'cobra' | 'basilisk' | 'ouroboros'

export interface Tier {
  id: TierId
  name: string
  blurb: string
  /** Base time before the serpent drifts one tile on its own. */
  driftMs: number
  /** WPM that earns the speed star and keeps the drift timer at its base. */
  targetWpm: number
  /** Ink drops needed to clear the first garden of the tier (+1 per later garden). */
  inkGoal: number
  words: readonly string[]
}

export const TIERS: Tier[] = [
  { id: 'hatchling', name: 'Hatchling', blurb: 'Short lowercase words. Plenty of time.', driftMs: 6500, targetWpm: 20, inkGoal: 5, words: WORDS.hatchling },
  { id: 'viper', name: 'Viper', blurb: 'Everyday 4–7 letter words.', driftMs: 5000, targetWpm: 32, inkGoal: 6, words: WORDS.viper },
  { id: 'cobra', name: 'Cobra', blurb: 'Capitals and punctuation.', driftMs: 4200, targetWpm: 42, inkGoal: 7, words: WORDS.cobra },
  { id: 'basilisk', name: 'Basilisk', blurb: 'Long, tricky words.', driftMs: 3800, targetWpm: 55, inkGoal: 8, words: WORDS.basilisk },
  { id: 'ouroboros', name: 'Ouroboros', blurb: 'Numbers, symbols, everything.', driftMs: 3400, targetWpm: 65, inkGoal: 9, words: WORDS.ouroboros },
]

export const tierById = (id: TierId) => TIERS.find((t) => t.id === id) ?? TIERS[0]

/** Suggest a tier from a placement-test WPM. */
export function tierForWpm(wpm: number): TierId {
  if (wpm < 22) return 'hatchling'
  if (wpm < 36) return 'viper'
  if (wpm < 50) return 'cobra'
  if (wpm < 68) return 'basilisk'
  return 'ouroboros'
}

/**
 * Gently adapt the drift timer to the player's recent speed (±25%), so each
 * tier stays challenging without being punishing.
 */
export function adaptiveDrift(tier: Tier, recentWpm: number[]) {
  if (recentWpm.length === 0) return tier.driftMs
  const avg = recentWpm.reduce((a, b) => a + b, 0) / recentWpm.length
  return Math.round(tier.driftMs * clamp(tier.targetWpm / Math.max(avg, 1), 0.75, 1.25))
}
