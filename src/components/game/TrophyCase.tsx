import { Trophy } from 'lucide-react'
import { ACHIEVEMENTS } from '@/game/achievements/registry'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useStore } from '@/store/useStore'
import { BadgeTile } from './BadgeTile'

export function TrophyCase() {
  const open = useStore((s) => s.dialog === 'trophies')
  const setDialog = useStore((s) => s.setDialog)
  const p = useStore((s) => s.profile)
  const count = Object.keys(p.unlocked).length

  const totals = [
    ['Words', p.totalWords.toLocaleString()],
    ['Sessions', p.totalSessions],
    ['Best WPM', Math.round(p.bestWpm)],
    ['Best streak', `${p.bestStreak}d`],
    ['Ink eaten', p.serpent.totalInk],
    ['Best combo', p.bestCombo],
  ] as const

  return (
    <Dialog open={open} onOpenChange={(o) => setDialog(o ? 'trophies' : null)}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-mint" aria-hidden="true" />
          <DialogTitle>Trophy case</DialogTitle>
        </div>
        <DialogDescription>
          {count} of {ACHIEVEMENTS.length} badges unlocked.
        </DialogDescription>
        <dl className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {totals.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-surface-2 px-2 py-2 text-center">
              <dt className="text-[11px] text-muted">{k}</dt>
              <dd className="font-mono text-sm font-medium tabular">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => (
            <BadgeTile key={a.id} a={a} unlockedAt={p.unlocked[a.id]} />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
