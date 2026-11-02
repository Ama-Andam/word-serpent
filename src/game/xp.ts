/** XP rules and the level curve. Tweak numbers here to rebalance the game. */
export const XP = {
  perWord: 1,
  perInk: 5,
  goalHit: 50,
  gardenClear: 40,
  perStar: 20,
  sessionMinWords: 25,
  sessionBonus: 10,
} as const

/** Total XP needed to reach `level` (level 1 starts at 0). Each level asks 50 XP more than the last. */
export function xpForLevel(level: number) {
  const n = level - 1
  return 100 * n + 25 * n * (n - 1)
}

export function levelFromXp(xp: number) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

/** Progress inside the current level, 0..1, plus the raw numbers for labels. */
export function levelProgress(xp: number) {
  const level = levelFromXp(xp)
  const start = xpForLevel(level)
  const end = xpForLevel(level + 1)
  return { level, into: xp - start, needed: end - start, ratio: (xp - start) / (end - start) }
}

const TITLES = ['Scribbler', 'Wordsmith', 'Storyteller', 'Essayist', 'Novelist', 'Bard', 'Laureate', 'Legend']

export function levelTitle(level: number) {
  return TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 5))]
}
