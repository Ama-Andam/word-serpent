/**
 * Word Serpent engine: pure functions over an immutable game state.
 * No React, no timers. The `useSerpent` hook drives it.
 *
 * Rules:
 *  - Each open tile next to the head shows a word. Typing that word moves the
 *    serpent onto the tile.
 *  - If the drift timer runs out first, the serpent slides one tile forward.
 *  - Eating an ink drop grows the serpent by one segment.
 *  - Hitting a wall, the edge, or your own body ends the run.
 */
import type { Rng } from '@/lib/rng'
import { pick } from '@/lib/rng'
import { BOARD_H, BOARD_W } from './gardens'

export type Dir = 'up' | 'down' | 'left' | 'right'
export interface Cell {
  x: number
  y: number
}
export interface Choice {
  dir: Dir
  cell: Cell
  word: string
}

export interface SerpentState {
  walls: Set<string>
  /** Head first. */
  body: Cell[]
  dir: Dir
  ink: Cell[]
  choices: Choice[]
  /** Letters of every word typed so far; the body displays the tail end of it. */
  trail: string
  typed: string
  inkEaten: number
  /** null = endless */
  inkGoal: number | null
  keystrokes: number
  mistakes: number
  wordsTyped: number
  charsTyped: number
  status: 'playing' | 'crashed' | 'cleared'
}

export type StepResult = { ate: boolean; moved: boolean; mistake: boolean }

const INK_ON_BOARD = 3
const DELTA: Record<Dir, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export const key = (c: Cell) => `${c.x},${c.y}`
const add = (c: Cell, d: Dir): Cell => ({ x: c.x + DELTA[d].x, y: c.y + DELTA[d].y })
const inBounds = (c: Cell) => c.x >= 0 && c.y >= 0 && c.x < BOARD_W && c.y < BOARD_H

export function createGame(layout: string[], inkGoal: number | null, words: readonly string[], rng: Rng): SerpentState {
  const walls = new Set<string>()
  let start: Cell = { x: 3, y: 4 }
  layout.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '#') walls.add(key({ x, y }))
      if (ch === 'S') start = { x, y }
    }),
  )
  let s: SerpentState = {
    walls,
    body: [start, { x: start.x - 1, y: start.y }, { x: start.x - 2, y: start.y }],
    dir: 'right',
    ink: [],
    choices: [],
    trail: 'ink',
    typed: '',
    inkEaten: 0,
    inkGoal,
    keystrokes: 0,
    mistakes: 0,
    wordsTyped: 0,
    charsTyped: 0,
    status: 'playing',
  }
  for (let i = 0; i < INK_ON_BOARD; i++) s = { ...s, ink: [...s.ink, spawnInk(s, rng)] }
  return withChoices(s, words, rng)
}

function isBlocked(s: SerpentState, c: Cell, growing: boolean) {
  if (!inBounds(c) || s.walls.has(key(c))) return true
  // The tail moves out of the way this turn unless the serpent is growing.
  const body = growing ? s.body : s.body.slice(0, -1)
  return body.some((b) => b.x === c.x && b.y === c.y)
}

function spawnInk(s: SerpentState, rng: Rng): Cell {
  const taken = new Set([...s.walls, ...s.body.map(key), ...s.ink.map(key)])
  const free: Cell[] = []
  for (let y = 0; y < BOARD_H; y++) for (let x = 0; x < BOARD_W; x++) if (!taken.has(`${x},${y}`)) free.push({ x, y })
  return free.length ? pick(rng, free) : { x: -1, y: -1 }
}

/** Assign a word to each open neighbour. First characters are kept distinct so typing is unambiguous. */
function withChoices(s: SerpentState, words: readonly string[], rng: Rng): SerpentState {
  const head = s.body[0]
  const used = new Set<string>()
  const choices: Choice[] = []
  for (const dir of (['up', 'right', 'down', 'left'] as Dir[]).filter((d) => d !== OPPOSITE[s.dir])) {
    const cell = add(head, dir)
    const growing = s.ink.some((i) => i.x === cell.x && i.y === cell.y)
    if (isBlocked(s, cell, growing)) continue
    let word = pick(rng, words)
    for (let tries = 0; tries < 40 && used.has(word[0].toLowerCase()); tries++) word = pick(rng, words)
    used.add(word[0].toLowerCase())
    choices.push({ dir, cell, word })
  }
  return { ...s, choices, typed: '' }
}

/** Move one tile in `dir`. `word` is what was typed to get there (empty for a drift). */
function move(s: SerpentState, dir: Dir, word: string, words: readonly string[], rng: Rng): [SerpentState, boolean] {
  const next = add(s.body[0], dir)
  const ate = s.ink.some((i) => i.x === next.x && i.y === next.y)
  if (isBlocked(s, next, ate)) return [{ ...s, status: 'crashed', typed: '' }, false]

  const body = [next, ...(ate ? s.body : s.body.slice(0, -1))]
  let n: SerpentState = {
    ...s,
    body,
    dir,
    trail: (s.trail + (word || '·')).slice(-200),
    inkEaten: s.inkEaten + (ate ? 1 : 0),
    ink: s.ink.filter((i) => !(i.x === next.x && i.y === next.y)),
  }
  if (ate) n = { ...n, ink: [...n.ink, spawnInk(n, rng)] }
  if (n.inkGoal !== null && n.inkEaten >= n.inkGoal) return [{ ...n, status: 'cleared', choices: [], typed: '' }, ate]

  n = withChoices(n, words, rng)
  // Boxed in with nowhere to go: the run is over.
  if (n.choices.length === 0) n = { ...n, status: 'crashed' }
  return [n, ate]
}

/** Feed one typed character. Wrong characters are rejected and counted as mistakes. */
export function typeChar(s: SerpentState, ch: string, words: readonly string[], rng: Rng): [SerpentState, StepResult] {
  if (s.status !== 'playing') return [s, { ate: false, moved: false, mistake: false }]
  const typed = s.typed + ch
  const match = s.choices.filter((c) => c.word.startsWith(typed))
  if (match.length === 0) {
    return [{ ...s, keystrokes: s.keystrokes + 1, mistakes: s.mistakes + 1 }, { ate: false, moved: false, mistake: true }]
  }
  const counted = { ...s, typed, keystrokes: s.keystrokes + 1 }
  const done = match.find((c) => c.word === typed)
  if (!done) return [counted, { ate: false, moved: false, mistake: false }]

  const [n, ate] = move(counted, done.dir, done.word, words, rng)
  return [
    { ...n, wordsTyped: n.wordsTyped + 1, charsTyped: n.charsTyped + done.word.length + 1 },
    { ate, moved: true, mistake: false },
  ]
}

export function backspace(s: SerpentState): SerpentState {
  return { ...s, typed: s.typed.slice(0, -1) }
}

/** Drift timer ran out: slide forward one tile. */
export function drift(s: SerpentState, words: readonly string[], rng: Rng): [SerpentState, boolean] {
  if (s.status !== 'playing') return [s, false]
  return move(s, s.dir, '', words, rng)
}

export const accuracyOf = (s: SerpentState) => (s.keystrokes ? (s.keystrokes - s.mistakes) / s.keystrokes : 1)
