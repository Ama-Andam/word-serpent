import { Flame } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'streak-7',
  title: '7-day streak',
  description: 'Write or play 7 days in a row.',
  icon: Flame,
  check: ({ profile }) => profile.streak >= 7,
} satisfies Achievement
