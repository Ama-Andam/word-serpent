import { Infinity as InfinityIcon } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'ouroboros',
  title: 'Ouroboros',
  description: 'Clear a garden in the Ouroboros tier.',
  icon: InfinityIcon,
  secret: true,
  check: ({ summary }) => summary.serpent?.tier === 'ouroboros' && summary.serpent.cleared,
} satisfies Achievement
