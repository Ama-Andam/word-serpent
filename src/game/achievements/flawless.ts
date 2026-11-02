import { Sparkles } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'flawless',
  title: 'Flawless run',
  description: 'Finish a session of 50+ words with 100% accuracy.',
  icon: Sparkles,
  check: ({ summary }) => summary.words >= 50 && summary.accuracy >= 1,
} satisfies Achievement
