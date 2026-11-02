import { Droplet } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { BOARD_H, BOARD_W } from '@/game/serpent/gardens'
import type { SerpentState } from '@/game/serpent/engine'
import { cn } from '@/lib/utils'

/** Position a child on the board in percentages so it scales with the container. */
const at = (x: number, y: number) => ({
  left: `${(x / BOARD_W) * 100}%`,
  top: `${(y / BOARD_H) * 100}%`,
  width: `${100 / BOARD_W}%`,
  height: `${100 / BOARD_H}%`,
})

/**
 * The garden. A DOM grid (not canvas) so it themes with CSS tokens, stays
 * crisp at any size, and segments can slide smoothly with transforms.
 */
export function SerpentBoard({ state, className }: { state: SerpentState; className?: string }) {
  const reduce = useReducedMotion()
  const { body, ink, choices, typed, trail, walls } = state
  const crashed = state.status === 'crashed'

  return (
    <div
      className={cn('relative mx-auto w-full select-none overflow-visible rounded-2xl border border-line bg-surface p-1.5 sm:p-2', className)}
      // Fit the viewport height too, so the input stays visible on laptops.
      style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}`, maxWidth: `min(100%, calc((100dvh - 270px) * ${BOARD_W / BOARD_H}))` }}
      role="img"
      aria-label={`Garden board. Serpent length ${body.length}. ${ink.length} ink drops on the board.`}
    >
      <div className="relative h-full w-full">
        {/* Ground tiles and walls */}
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${BOARD_W}, 1fr)`, gridTemplateRows: `repeat(${BOARD_H}, 1fr)` }}
          aria-hidden="true"
        >
          {Array.from({ length: BOARD_W * BOARD_H }, (_, i) => {
            const wall = walls.has(`${i % BOARD_W},${Math.floor(i / BOARD_W)}`)
            return (
              <div key={i} className="p-[1.5px]">
                <div
                  className={cn('h-full w-full rounded-[5px]', wall ? 'bg-line' : 'bg-surface-2/80')}
                  style={wall ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 4px, rgb(0 0 0 / 0.08) 4px 6px)' } : undefined}
                />
              </div>
            )
          })}
        </div>

        {/* Ink drops */}
        {ink.map((c) => (
          <div key={`ink-${c.x},${c.y}`} className="absolute grid place-items-center p-[1.5px]" style={at(c.x, c.y)} aria-hidden="true">
            <span className="grid h-full w-full animate-pop place-items-center rounded-[5px] bg-arcane text-white shadow-sm">
              <Droplet className="size-[55%] fill-current" />
            </span>
          </div>
        ))}

        {/* Serpent: segments keyed by index so each one slides into the previous one's cell. */}
        {body.map((c, i) => {
          const head = i === 0
          const ch = trail[trail.length - i] ?? ''
          return (
            <div
              key={i}
              className="absolute p-[1.5px]"
              style={{
                ...at(0, 0),
                transform: `translate(${c.x * 100}%, ${c.y * 100}%)`,
                transition: reduce ? 'none' : 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1)',
                zIndex: 5,
              }}
              aria-hidden="true"
            >
              <div
                className={cn(
                  'grid h-full w-full place-items-center font-serif leading-none',
                  head ? 'rounded-[40%] bg-ember text-white shadow-sm' : 'rounded-[6px] bg-ink text-bg',
                  crashed && head && 'animate-shake bg-danger',
                )}
                style={{ fontSize: 'clamp(10px, 2.2vw, 18px)', opacity: head ? 1 : Math.max(0.55, 1 - i * 0.015) }}
              >
                {head ? <span className="size-[22%] rounded-full bg-white" /> : ch === '·' ? '' : ch}
              </div>
            </div>
          )
        })}

        {/* Word choices on the open neighbours of the head */}
        {state.status === 'playing' &&
          choices.map((c) => {
            const match = c.word.startsWith(typed)
            const done = typed.length > 0 && match
            return (
              <div key={`${c.dir}-${c.word}`} className="absolute z-10 grid place-items-center" style={at(c.cell.x, c.cell.y)}>
                <span
                  className={cn(
                    'whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono font-medium shadow-sm transition-opacity duration-150',
                    done ? 'border-mint bg-surface' : 'border-line bg-surface',
                    typed && !match && 'opacity-30',
                  )}
                  style={{ fontSize: 'clamp(10px, 1.7vw, 14px)' }}
                >
                  <span className="text-mint-ink">{match ? c.word.slice(0, typed.length) : ''}</span>
                  <span className="text-ink">{match ? c.word.slice(typed.length) : c.word}</span>
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
