import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { on } from '@/game/events'

/**
 * Celebration overlay for level-ups. It never takes focus or blocks clicks,
 * so writing continues underneath. Reduced motion → a simple fade.
 */
export function LevelUpBurst() {
  const [shown, setShown] = useState<{ level: number; title: string; key: number } | null>(null)
  const reduce = useReducedMotion()

  useEffect(
    () =>
      on('levelUp', ({ level, title }) => {
        setShown({ level, title, key: Date.now() })
        window.setTimeout(() => setShown((s) => (s?.level === level ? null : s)), 2200)
      }),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" aria-hidden="true">
      <AnimatePresence>
        {shown && (
          <motion.div
            key={shown.key}
            className="relative grid place-items-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 1.1 }}
            transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 18 }}
          >
            {!reduce && (
              <>
                <motion.span
                  className="absolute size-40 rounded-full border-2 border-arcane"
                  initial={{ scale: 0.4, opacity: 0.9 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2
                  return (
                    <motion.span
                      key={i}
                      className={i % 3 === 0 ? 'absolute size-2 rounded-full bg-ember' : 'absolute size-1.5 rounded-full bg-arcane'}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: Math.cos(angle) * 140, y: Math.sin(angle) * 140, opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
                    />
                  )
                })}
              </>
            )}
            <div className="rounded-2xl border border-arcane/40 bg-surface/95 px-8 py-5 text-center shadow-lift backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-arcane-ink">Level up</p>
              <p className="mt-1 font-mono text-5xl font-medium text-arcane tabular">{shown.level}</p>
              <p className="mt-1 font-serif text-lg italic text-muted">{shown.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
