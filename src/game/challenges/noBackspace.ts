import type { Challenge } from './types'

export default {
  id: 'no-backspace',
  title: 'No going back',
  description: 'Write 150 words with backspace disabled.',
  xp: 150,
  setup: { view: 'write', mode: 'free', goal: 150, noBackspace: true },
  validate: (s) => s.mode !== 'serpent' && s.words >= 150 && s.backspaces === 0,
} satisfies Challenge
