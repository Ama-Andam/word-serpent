import type { TierId } from './serpent/tiers'

export type WriteMode = 'free' | 'sprint' | 'focus'
export type PlayMode = WriteMode | 'serpent'

/** Everything the game layer knows about a finished session or serpent run. */
export interface SessionSummary {
  id: string
  mode: PlayMode
  endedAt: number
  durationMs: number
  words: number
  wpm: number
  /** 0..1 */
  accuracy: number
  backspaces: number
  longestSentence: number
  peakCombo: number
  goal?: number
  goalHit: boolean
  /** XP earned live during the session (per word / per ink drop). */
  liveXp: number
  serpent?: {
    tier: TierId
    gardenId?: string
    daily: boolean
    length: number
    score: number
    inkEaten: number
    stars: number
    cleared: boolean
    crashed: boolean
  }
}

export interface SerpentProgress {
  tier: TierId
  placementDone: boolean
  /** gardenId → best star count (0–3) */
  stars: Record<string, number>
  /** best endless score per tier */
  best: Partial<Record<TierId, number>>
  totalInk: number
  /** WPM of recent runs, used to gently adapt the drift timer. */
  recentWpm: number[]
}

export interface Profile {
  xp: number
  totalWords: number
  totalSessions: number
  bestWpm: number
  bestCombo: number
  streak: number
  bestStreak: number
  lastActiveDay: string | null
  /** achievement id → unlock timestamp */
  unlocked: Record<string, number>
  /** dayKey of the last completed daily challenge */
  dailyDone: string | null
  serpent: SerpentProgress
}

export const newProfile = (): Profile => ({
  xp: 0,
  totalWords: 0,
  totalSessions: 0,
  bestWpm: 0,
  bestCombo: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  unlocked: {},
  dailyDone: null,
  serpent: { tier: 'hatchling', placementDone: false, stars: {}, best: {}, totalInk: 0, recentWpm: [] },
})
