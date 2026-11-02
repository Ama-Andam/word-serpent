import { motion } from 'motion/react'
import { levelProgress, levelTitle } from '@/game/xp'
import { useStore } from '@/store/useStore'

/** Level badge + XP progress toward the next level (arcane = XP). */
export function XpBar({ compact = false }: { compact?: boolean }) {
  const xp = useStore((s) => s.profile.xp)
  const { level, into, needed, ratio } = levelProgress(xp)
  return (
    <div className="flex min-w-0 items-center gap-2.5" aria-label={`Level ${level}, ${into} of ${needed} XP to next level`}>
      <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-arcane-soft px-2.5 font-mono text-xs font-medium text-arcane-ink tabular">
        Lv {level}
        {!compact && <span className="hidden font-sans font-normal sm:inline">· {levelTitle(level)}</span>}
      </span>
      {!compact && (
        <div className="hidden w-32 flex-col gap-1 md:flex lg:w-40">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-arcane"
              initial={false}
              animate={{ width: `${Math.max(3, ratio * 100)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <span className="font-mono text-[10px] leading-none text-muted tabular">
            {into} / {needed} XP
          </span>
        </div>
      )}
    </div>
  )
}
