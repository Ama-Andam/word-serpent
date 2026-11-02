import type { Challenge } from './types'

export default {
  id: 'sprint-100',
  title: '100 in 2',
  description: 'Write 100 words in a 2-minute sprint.',
  xp: 120,
  setup: { view: 'write', mode: 'sprint', goal: 100, sprintSeconds: 120 },
  validate: (s) => s.mode === 'sprint' && s.words >= 100 && s.durationMs <= 125_000,
} satisfies Challenge
