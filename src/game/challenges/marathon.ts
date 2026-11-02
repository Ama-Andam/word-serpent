import type { Challenge } from './types'

export default {
  id: 'marathon',
  title: 'Long haul',
  description: 'Write 500 words in a single session.',
  xp: 200,
  setup: { view: 'write', mode: 'free', goal: 500 },
  validate: (s) => s.mode !== 'serpent' && s.words >= 500,
} satisfies Challenge
