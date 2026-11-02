import type { Challenge } from './types'

export default {
  id: 'serpent-clean',
  title: 'Clean scales',
  description: 'Eat 6 ink drops in Word Serpent with 97%+ accuracy.',
  xp: 140,
  setup: { view: 'serpent' },
  validate: (s) => (s.serpent?.inkEaten ?? 0) >= 6 && s.accuracy >= 0.97,
} satisfies Challenge
