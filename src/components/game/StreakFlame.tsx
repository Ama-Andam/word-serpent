import { Flame } from 'lucide-react'
import { visibleStreak } from '@/game/streak'
import { dayKey } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/** Consecutive-day counter (ember = energy). Grey until today's activity lights it. */
export function StreakFlame() {
  const { lastActiveDay, streak } = useStore((s) => s.profile)
  const today = dayKey()
  const n = visibleStreak(lastActiveDay, streak, today)
  const litToday = lastActiveDay === today
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full px-2.5 font-mono text-xs font-medium tabular',
        litToday ? 'bg-ember-soft text-ember-ink' : 'bg-surface-2 text-muted',
      )}
      aria-label={`${n} day streak${litToday ? '' : ', write or play today to keep it'}`}
      title={litToday ? `${n}-day streak` : 'Write or play today to keep your streak'}
    >
      <Flame size={14} aria-hidden="true" className={cn(litToday && 'fill-ember/30')} />
      {n}
    </span>
  )
}
