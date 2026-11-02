import { Gauge } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'wpm-60',
  title: '60 WPM',
  description: 'Finish a session at 60 words per minute or faster.',
  icon: Gauge,
  check: ({ summary }) => summary.wpm >= 60 && summary.words >= 30,
} satisfies Achievement
