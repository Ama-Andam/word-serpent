import { Moon } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'night-owl',
  title: 'Night owl',
  description: 'Finish a session between midnight and 4 a.m.',
  icon: Moon,
  secret: true,
  check: ({ summary }) => new Date(summary.endedAt).getHours() < 4 && summary.words >= 20,
} satisfies Achievement
