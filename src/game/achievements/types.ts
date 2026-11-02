import type { LucideIcon } from 'lucide-react'
import type { Profile, SessionSummary } from '../types'

export interface AchievementContext {
  /** Profile after the session has been applied (totals, streak, etc.). */
  profile: Profile
  /** The session that just ended. */
  summary: SessionSummary
}

/**
 * One unlockable badge. To add a new one: create a file in this folder that
 * default-exports an Achievement, then add it to `registry.ts`.
 */
export interface Achievement {
  id: string
  title: string
  description: string
  icon: LucideIcon
  /** Hidden badges show as "???" in the trophy case until unlocked. */
  secret?: boolean
  check: (ctx: AchievementContext) => boolean
}
