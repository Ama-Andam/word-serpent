import { Flame } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'streak-3',
  title: 'Kindling',
  description: 'Write or play 3 days in a row.',
  icon: Flame,
  check: ({ profile }) => profile.streak >= 3,
} satisfies Achievement
