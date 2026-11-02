import { CalendarCheck, Check, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dailyChallenge } from '@/game/challenges/registry'
import { dayKey } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/** Today's rotating challenge. Same for everyone on a given date. */
export function DailyChallengeCard({ className }: { className?: string }) {
  const today = dayKey()
  const c = dailyChallenge(today)
  const done = useStore((s) => s.profile.dailyDone === today)
  const active = useStore((s) => s.challengeActive)

  const start = () => {
    const s = useStore.getState()
    s.setView(c.setup.view)
    if (c.setup.view === 'write') {
      if (c.setup.mode) s.setWriteMode(c.setup.mode)
      if (c.setup.goal) s.setGoal(c.setup.goal)
      if (c.setup.sprintSeconds) s.setSprintSeconds(c.setup.sprintSeconds)
      s.newDraft()
    }
    s.setChallengeActive(true)
  }

  return (
    <section
      aria-labelledby="daily-title"
      className={cn('rounded-xl border p-4', done ? 'border-mint/40 bg-mint-soft/50' : 'border-line bg-surface', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
          <CalendarCheck size={13} aria-hidden="true" /> Daily challenge
        </p>
        <span className="font-mono text-[11px] text-arcane-ink tabular">+{c.xp} XP</span>
      </div>
      <h3 id="daily-title" className="mt-2 font-serif text-lg leading-tight">
        {c.title}
      </h3>
      <p className="mt-1 text-sm text-muted">{c.description}</p>
      {done ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-mint-ink">
          <Check size={16} aria-hidden="true" /> Done for today
        </p>
      ) : active ? (
        <p className="mt-3 text-sm font-medium text-ember-ink">In progress…</p>
      ) : (
        <Button size="sm" variant="outline" className="mt-3" onClick={start}>
          <Play size={14} aria-hidden="true" /> Start challenge
        </Button>
      )}
    </section>
  )
}
