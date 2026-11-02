import { Spline } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'serpent-20',
  title: 'Long tale',
  description: 'Grow your serpent to 20 segments.',
  icon: Spline,
  check: ({ summary }) => (summary.serpent?.length ?? 0) >= 20,
} satisfies Achievement
