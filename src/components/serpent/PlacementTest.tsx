import { Gauge } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { tierById, tierForWpm } from '@/game/serpent/tiers'
import { WORDS } from '@/game/serpent/words'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const DURATION_MS = 30_000

/** 30-second typing check that suggests a starting tier. */
export function PlacementTest({ onDone }: { onDone: () => void }) {
  const passage = useMemo(() => {
    const pool = [...WORDS.hatchling, ...WORDS.viper]
    return Array.from({ length: 60 }, () => pool[Math.floor(Math.random() * pool.length)]).join(' ')
  }, [])
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const now = useNow(!!startedAt && result === null, 200)
  const ref = useRef<HTMLInputElement>(null)

  const correct = [...typed].filter((c, i) => c === passage[i]).length
  const left = startedAt ? Math.max(0, DURATION_MS - (now - startedAt)) : DURATION_MS

  useEffect(() => {
    if (startedAt && result === null && (left === 0 || typed.length >= passage.length)) {
      const mins = Math.max((Date.now() - startedAt) / 60000, 1 / 60)
      setResult(correct / 5 / mins)
    }
  }, [correct, left, passage.length, result, startedAt, typed.length])

  useEffect(() => ref.current?.focus(), [])

  const suggested = result !== null ? tierById(tierForWpm(result)) : null

  return (
    <section className="mx-4 mt-8 rounded-2xl sm:mx-auto sm:w-full sm:max-w-2xl border border-line bg-surface p-6" aria-labelledby="placement-title">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
        <Gauge size={13} aria-hidden="true" /> Placement
      </p>
      <h2 id="placement-title" className="mt-1 font-serif text-2xl">
        {suggested ? `You type about ${Math.round(result!)} WPM` : 'Find your tier'}
      </h2>
      {!suggested ? (
        <>
          <p className="mt-1 text-sm text-muted">Type the text below for 30 seconds. Mistakes are fine, keep going.</p>
          <p className="mt-4 font-mono text-base leading-relaxed" aria-hidden="true">
            {[...passage.slice(0, Math.max(120, typed.length + 60))].map((c, i) => (
              <span
                key={i}
                className={cn(
                  i < typed.length ? (typed[i] === c ? 'text-mint-ink' : 'rounded-sm bg-danger/20 text-danger') : 'text-muted',
                  i === typed.length && 'border-l-2 border-ember',
                )}
              >
                {c}
              </span>
            ))}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              ref={ref}
              value={typed}
              onChange={(e) => {
                if (!startedAt) setStartedAt(Date.now())
                setTyped(e.target.value)
              }}
              aria-label="Placement test input"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="h-11 flex-1 rounded-xl border border-line bg-bg px-3 font-mono outline-none focus:border-arcane"
              placeholder="start typing…"
            />
            <span className="w-12 text-right font-mono text-sm text-muted tabular" role="timer">
              {Math.ceil(left / 1000)}s
            </span>
          </div>
          <Button variant="link" size="sm" className="mt-2 px-0 text-muted" onClick={() => { useStore.getState().completePlacement('hatchling'); onDone() }}>
            Skip, start as Hatchling
          </Button>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            We suggest <span className="font-medium text-ink">{suggested.name}</span>: {suggested.blurb} You can switch tiers any time.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                useStore.getState().completePlacement(suggested.id)
                onDone()
              }}
            >
              Start as {suggested.name}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTyped('')
                setStartedAt(0)
                setResult(null)
                requestAnimationFrame(() => ref.current?.focus())
              }}
            >
              Try again
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
