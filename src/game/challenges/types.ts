import type { SessionSummary, WriteMode } from '../types'

/** How the app should set itself up when the player starts this challenge. */
export interface ChallengeSetup {
  view: 'write' | 'serpent'
  mode?: WriteMode
  goal?: number
  sprintSeconds?: number
  /** Disable the backspace/delete keys in the editor. */
  noBackspace?: boolean
}

/**
 * A daily challenge. One is picked per calendar day (same for everyone).
 * To add one: create a file in this folder and add it to `registry.ts`.
 */
export interface Challenge {
  id: string
  title: string
  description: string
  xp: number
  setup: ChallengeSetup
  validate: (s: SessionSummary) => boolean
}
