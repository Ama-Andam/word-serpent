/** Daily challenge pool. The day's challenge is chosen by a hash of the date. */
import { dayKey } from '@/lib/date'
import { hashString } from '@/lib/rng'
import focusFlow from './focusFlow'
import marathon from './marathon'
import noBackspace from './noBackspace'
import serpentClean from './serpentClean'
import serpentFeast from './serpentFeast'
import shortSentences from './shortSentences'
import sprint100 from './sprint100'
import type { Challenge } from './types'

export const CHALLENGES: Challenge[] = [
  sprint100,
  noBackspace,
  serpentFeast,
  shortSentences,
  focusFlow,
  serpentClean,
  marathon,
]

export function dailyChallenge(day = dayKey()): Challenge {
  return CHALLENGES[hashString(`inkwell:${day}`) % CHALLENGES.length]
}
