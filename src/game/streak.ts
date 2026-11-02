import { daysBetween } from '@/lib/date'

/** New streak value after activity on `today`. */
export function advanceStreak(lastDay: string | null, streak: number, today: string) {
  if (lastDay === today) return Math.max(1, streak)
  if (lastDay && daysBetween(lastDay, today) === 1) return streak + 1
  return 1
}

/** Streak to display: it survives until the end of the day after the last activity. */
export function visibleStreak(lastDay: string | null, streak: number, today: string) {
  return lastDay && daysBetween(lastDay, today) <= 1 ? streak : 0
}
