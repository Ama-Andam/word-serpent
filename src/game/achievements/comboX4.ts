import { Zap } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'combo-x4',
  title: 'In the zone',
  description: 'Reach a x4 combo (50 words without a long pause).',
  icon: Zap,
  check: ({ summary }) => summary.peakCombo >= 50,
} satisfies Achievement
