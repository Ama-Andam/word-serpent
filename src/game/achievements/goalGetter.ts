import { Target } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'goal-getter',
  title: 'Goal getter',
  description: 'Hit your word goal.',
  icon: Target,
  check: ({ summary }) => summary.goalHit,
} satisfies Achievement
