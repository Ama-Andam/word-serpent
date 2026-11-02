import { Feather } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'first-words',
  title: 'First ink',
  description: 'Finish your first session.',
  icon: Feather,
  check: ({ profile }) => profile.totalSessions >= 1,
} satisfies Achievement
