import type { TierId } from './tiers'
import { TIERS } from './tiers'

/**
 * Garden layouts (11 × 9). `#` = wall, `S` = serpent head start (facing right).
 * Each tier reuses the layouts in order with its own names, so adding a layout
 * here adds a garden to every tier.
 */
export const BOARD_W = 11
export const BOARD_H = 9

const LAYOUTS: string[][] = [
  [
    '...........',
    '...........',
    '...........',
    '...........',
    '...S.......',
    '...........',
    '...........',
    '...........',
    '...........',
  ],
  [
    '...........',
    '.##.....##.',
    '.#.......#.',
    '...........',
    '...S.......',
    '...........',
    '.#.......#.',
    '.##.....##.',
    '...........',
  ],
  [
    '.....#.....',
    '.....#.....',
    '...........',
    '..#.....#..',
    '#...S.....#',
    '..#.....#..',
    '...........',
    '.....#.....',
    '.....#.....',
  ],
  [
    '...........',
    '.#########.',
    '...........',
    '...........',
    '...S.......',
    '...........',
    '...........',
    '.#########.',
    '...........',
  ],
]

const NAMES: Record<TierId, string[]> = {
  hatchling: ['Moss bed', 'Fern corner', 'Pebble path', 'Long rows'],
  viper: ['Dew garden', 'Hedge maze', 'Crossroads', 'Orchard lanes'],
  cobra: ['Lantern court', 'Stone ring', 'Four gates', 'Colonnade'],
  basilisk: ['Glass house', 'Ruined cloister', 'Sundial', 'Long gallery'],
  ouroboros: ['Ink sea', 'The coil', 'Clockwork', 'Final page'],
}

export interface Garden {
  id: string
  tier: TierId
  index: number
  name: string
  layout: string[]
  inkGoal: number
}

export function gardensFor(tier: TierId): Garden[] {
  const t = TIERS.find((x) => x.id === tier)!
  return LAYOUTS.map((layout, index) => ({
    id: `${tier}-${index + 1}`,
    tier,
    index,
    name: NAMES[tier][index] ?? `Garden ${index + 1}`,
    layout,
    inkGoal: t.inkGoal + index,
  }))
}

/** Open board for endless and daily runs. */
export const OPEN_LAYOUT = LAYOUTS[0]

/** A garden is unlocked when the previous one in its tier has at least 1 star. */
export function isUnlocked(g: Garden, stars: Record<string, number>) {
  return g.index === 0 || (stars[`${g.tier}-${g.index}`] ?? 0) > 0
}
