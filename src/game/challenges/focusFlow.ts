import type { Challenge } from './types'

export default {
  id: 'focus-flow',
  title: 'Blind flow',
  description: 'Write 200 words in Focus mode, stats hidden.',
  xp: 140,
  setup: { view: 'write', mode: 'focus', goal: 200 },
  validate: (s) => s.mode === 'focus' && s.words >= 200,
} satisfies Challenge
