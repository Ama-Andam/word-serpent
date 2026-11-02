import { Lock } from 'lucide-react'
import type { Achievement } from '@/game/achievements/types'
import { cn } from '@/lib/utils'

export function BadgeTile({ a, unlockedAt, fresh }: { a: Achievement; unlockedAt?: number; fresh?: boolean }) {
  const open = !!unlockedAt
  const hidden = !open && a.secret
  const Icon = open ? a.icon : Lock
  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3',
        open ? 'border-mint/40 bg-mint-soft/60' : 'border-line bg-surface-2/50',
        fresh && 'animate-pop',
      )}
    >
      <span
        className={cn('grid size-10 shrink-0 place-items-center rounded-lg', open ? 'bg-mint text-white' : 'bg-surface-2 text-muted')}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className={cn('text-sm font-medium', !open && 'text-muted')}>{hidden ? '???' : a.title}</p>
        <p className="text-xs text-muted">{hidden ? 'A secret badge.' : a.description}</p>
        {open && (
          <p className="mt-0.5 text-[11px] text-mint-ink">
            <span className="sr-only">Unlocked </span>
            {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </li>
  )
}
