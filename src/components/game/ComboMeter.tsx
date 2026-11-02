import { AnimatePresence, motion } from 'motion/react'
import { COMBO_WINDOW_MS, isAlive, multiplier, tierProgress, type Combo } from '@/game/combo'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'

/**
 * Combo meter: the bar drains in real time as the pause grows and refills
 * on every keystroke. The badge shows the XP multiplier.
 */
export function ComboMeter({ combo, className }: { combo: Combo; className?: string }) {
  const now = useNow(combo.count > 0, 0)
  const alive = isAlive(combo, now)
  const count = alive ? combo.count : 0
  const mult = multiplier(count)
  const drain = alive ? 1 - (now - combo.lastAt) / COMBO_WINDOW_MS : 0

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative grid h-8 min-w-12 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={mult}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
            className={cn(
              'rounded-lg px-2 py-0.5 font-mono text-sm font-medium tabular',
              mult > 1 ? 'bg-ember text-white' : 'bg-surface-2 text-muted',
            )}
          >
            x{mult}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex justify-between text-[11px] text-muted">
          <span>Combo {count > 0 && <span className="font-mono tabular text-ink">{count}</span>}</span>
          <span className="font-mono tabular">{mult < 4 ? `next x${mult + 1}` : 'max'}</span>
        </div>
        <div
          className="relative h-2 overflow-hidden rounded-full bg-surface-2"
          role="meter"
          aria-label="Combo timer"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(drain * 100)}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-ember" style={{ width: `${drain * 100}%` }} />
        </div>
        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div className="h-full bg-ember/50 transition-[width] duration-200" style={{ width: `${tierProgress(count) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
