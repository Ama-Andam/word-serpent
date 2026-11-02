import type { Challenge } from './types'

export default {
  id: 'short-sentences',
  title: 'Haiku brain',
  description: 'Write 120 words where every sentence is under 10 words.',
  xp: 130,
  setup: { view: 'write', mode: 'free', goal: 120 },
  validate: (s) => s.mode !== 'serpent' && s.words >= 120 && s.longestSentence < 10,
} satisfies Challenge
