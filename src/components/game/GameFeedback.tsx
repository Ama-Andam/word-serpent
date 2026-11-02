import { useEffect } from 'react'
import { toast } from 'sonner'
import { on } from '@/game/events'
import { play } from '@/lib/sound'

/**
 * Bridges game events to feedback: toasts (announced politely to screen
 * readers by Sonner) and optional sounds. Renders nothing.
 */
export function GameFeedback() {
  useEffect(() => {
    const offs = [
      on('levelUp', ({ level, title }) => {
        play('levelUp')
        toast(`Level ${level} reached`, { description: `You're now a ${title}.` })
      }),
      on('unlock', ({ achievement: a }) => {
        play('unlock')
        const Icon = a.icon
        toast(`Badge unlocked: ${a.title}`, {
          description: a.description,
          icon: <Icon size={16} className="text-mint" aria-hidden="true" />,
        })
      }),
      on('goalHit', ({ goal }) => {
        play('goal')
        toast(`Goal hit: ${goal} words`, { description: 'Keep going, every word still counts.' })
      }),
      on('dailyComplete', ({ challenge }) => {
        toast(`Daily challenge complete`, { description: `${challenge.title} · +${challenge.xp} XP` })
      }),
      on('comboTier', () => play('combo')),
    ]
    return () => offs.forEach((off) => off())
  }, [])
  return null
}
