import { Copy, Star } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { tierById } from '@/game/serpent/tiers'
import { levelProgress } from '@/game/xp'
import { copyText } from '@/lib/export'
import { cn, formatClock } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { BadgeTile } from './BadgeTile'

const MODE_LABEL = { free: 'Free write', sprint: 'Sprint', focus: 'Focus', serpent: 'Word Serpent' } as const

/** End-of-session card. Designed to be screenshot-worthy. */
export function SessionSummary({ onNewPage }: { onNewPage: () => void }) {
  const result = useStore((s) => s.result)
  const clear = useStore((s) => s.clearResult)
  const xp = useStore((s) => s.profile.xp)
  const reduce = useReducedMotion()
  if (!result) return null

  const { summary: s, bonuses, xpTotal, unlocked, levelAfter, levelBefore } = result
  const sv = s.serpent
  const lp = levelProgress(xp)

  const stats: [string, string][] = sv
    ? [
        ['Length', String(sv.length)],
        ['Ink', String(sv.inkEaten)],
        ['WPM', String(Math.round(s.wpm))],
        ['Accuracy', `${Math.round(s.accuracy * 100)}%`],
      ]
    : [
        ['Words', String(s.words)],
        ['WPM', String(Math.round(s.wpm))],
        ['Accuracy', `${Math.round(s.accuracy * 100)}%`],
        ['Time', formatClock(s.durationMs)],
      ]

  const share = async () => {
    const line = sv
      ? `inkwell · Word Serpent (${tierById(sv.tier).name}): length ${sv.length}, ${sv.inkEaten} ink, ${Math.round(s.wpm)} WPM, ${Math.round(s.accuracy * 100)}% accuracy, +${xpTotal} XP`
      : `inkwell · ${MODE_LABEL[s.mode]}: ${s.words} words, ${Math.round(s.wpm)} WPM, ${Math.round(s.accuracy * 100)}% accuracy, +${xpTotal} XP`
    toast(await copyText(line) ? 'Summary copied' : "Couldn't copy. Your browser blocked clipboard access.")
  }

  return (
    <Dialog open onOpenChange={(o) => !o && clear()}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="relative bg-ink px-6 pb-6 pt-7 text-bg">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-70">{MODE_LABEL[s.mode]}</p>
          <DialogTitle className="mt-1 font-serif text-3xl font-normal">
            {sv ? (sv.cleared ? 'Garden cleared' : sv.crashed ? 'The serpent rests' : 'Run complete') : s.goalHit ? 'Goal reached' : 'Session complete'}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-bg/70">
            {new Date(s.endedAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </DialogDescription>
          {sv && sv.stars > 0 && (
            <div className="mt-3 flex gap-1" aria-label={`${sv.stars} of 3 stars`}>
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15 * i, type: 'spring', stiffness: 400, damping: 14 }}
                >
                  <Star size={22} aria-hidden="true" className={i <= sv.stars ? 'fill-ember text-ember' : 'text-bg/30'} />
                </motion.span>
              ))}
            </div>
          )}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {stats.map(([k, v], i) => (
              <motion.div
                key={k}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <p className="font-mono text-2xl font-medium tabular">{v}</p>
                <p className="text-[11px] opacity-70">{k}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">XP earned</p>
              <p className="font-mono text-xl font-medium text-arcane tabular">+{xpTotal}</p>
            </div>
            <ul className="mt-1 space-y-0.5 text-xs text-muted">
              {s.liveXp > 0 && (
                <li className="flex justify-between">
                  <span>{sv ? 'Moves and ink' : 'Words (with combo)'}</span>
                  <span className="font-mono tabular">+{s.liveXp}</span>
                </li>
              )}
              {bonuses.map((b) => (
                <li key={b.label} className="flex justify-between">
                  <span>{b.label}</span>
                  <span className="font-mono tabular">+{b.xp}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-xs text-arcane-ink tabular">Lv {lp.level}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-arcane" style={{ width: `${lp.ratio * 100}%` }} />
              </div>
              {levelAfter > levelBefore && <span className="text-xs font-medium text-arcane-ink">Level up!</span>}
            </div>
          </div>

          {unlocked.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">New badges</p>
              <ul className="grid gap-2">
                {unlocked.map((a) => (
                  <BadgeTile key={a.id} a={a} unlockedAt={Date.now()} fresh />
                ))}
              </ul>
            </div>
          )}

          <div className={cn('flex flex-wrap gap-2', 'pt-1')}>
            <Button variant="outline" size="sm" onClick={share}>
              <Copy size={14} aria-hidden="true" /> Copy summary
            </Button>
            <div className="flex-1" />
            {!sv && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clear()
                  onNewPage()
                }}
              >
                New page
              </Button>
            )}
            <Button size="sm" onClick={clear} autoFocus>
              {sv ? 'Continue' : 'Keep writing'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
