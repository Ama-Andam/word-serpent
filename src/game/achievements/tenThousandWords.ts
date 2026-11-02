import { Library } from 'lucide-react'
import type { Achievement } from './types'

export default {
  id: 'words-10000',
  title: 'Shelf-worthy',
  description: 'Write 10,000 words in total.',
  icon: Library,
  check: ({ profile }) => profile.totalWords >= 10000,
} satisfies Achievement
