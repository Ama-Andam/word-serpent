import { BookOpen } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'words-1000',
  title: 'First 1,000 words',
  description: 'Write 1,000 words in total.',
  icon: BookOpen,
  check: ({ profile }) => profile.totalWords >= 1000,
} satisfies Achievement
