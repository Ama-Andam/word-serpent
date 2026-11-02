import type { Challenge } from './types'

export default {
  id: 'serpent-feast',
  title: 'Ink feast',
  description: 'Eat 12 ink drops in one Word Serpent run.',
  xp: 140,
  setup: { view: 'serpent' },
  validate: (s) => (s.serpent?.inkEaten ?? 0) >= 12,
} satisfies Challenge
