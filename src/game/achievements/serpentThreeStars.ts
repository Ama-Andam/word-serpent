import { Star } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'serpent-3-stars',
  title: 'Perfect garden',
  description: 'Clear a garden with 3 stars.',
  icon: Star,
  check: ({ summary }) => summary.serpent?.stars === 3,
} satisfies Achievement
