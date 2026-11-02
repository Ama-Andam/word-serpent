import { ArrowLeft, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ComboMeter } from '@/components/game/ComboMeter'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useNow } from '@/hooks/useNow'
import { useSerpent, type RunConfig, type RunEnd } from '@/hooks/useSerpent'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { SerpentBoard } from './SerpentBoard'

interface Props {
  config: RunConfig
  title: string
  daily?: boolean
  hasNext: boolean
  onExit: () => void
  onRetry: () => void
  onNext: () => void
}

/** One run of Word Serpent: HUD, board, drift timer, and the typing input. */
export function SerpentRun({ config, title, daily, hasNext, onExit, onRetry, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ended, setEnded] = useState<RunEnd | null>(null)
  const liveXpRef = useRef<() => number>(() => 0)

  const onEnd = useCallback(
    (e: RunEnd) => {
      setEnded(e)
      const s = e.state
      const cleared = s.status === 'cleared'
      const stars = cleared ? 1 + (e.accuracy >= 0.95 ? 1 : 0) + (e.wpm >= config.tier.targetWpm ? 1 : 0) : 0
      // Let the final move render before the summary card appears.
      window.setTimeout(
        () =>
          useStore.getState().finishSession({
            id: `${Date.now()}`,
            mode: 'serpent',
            endedAt: Date.now(),
            durationMs: e.durationMs,
            words: s.wordsTyped,
            wpm: e.wpm,
            accuracy: e.accuracy,
            backspaces: 0,
            longestSentence: 0,
            peakCombo: e.peakCombo,
            goalHit: false,
            liveXp: liveXpRef.current(),
            serpent: {
              tier: config.tier.id,
              gardenId: config.gardenId,
              daily: !!daily,
              length: s.body.length,
              score: e.score,
              inkEaten: s.inkEaten,
              stars,
              cleared,
              crashed: s.status === 'crashed',
            },
          }),
        650,
      )
    },
    [config.gardenId, config.tier, daily],
  )

  const run = useSerpent(config, onEnd)
  liveXpRef.current = run.liveXp
  const { state } = run
  const now = useNow(run.started && !run.paused && state.status === 'playing', 0)
  const left = run.started ? Math.max(0, run.deadline - now) : run.driftMs
  const urgent = run.started && left < 1200

  useEffect(() => inputRef.current?.focus(), [])

  // Shake the input on a wrong key (skipped under reduced motion).
  useEffect(() => {
    if (!run.miss || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    inputRef.current?.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
      { duration: 220, easing: 'ease-out' },
    )
  }, [run.miss])
  useHotkeys({ escape: () => !useStore.getState().result && run.togglePause() })

  // Controlled input mirrors the engine's typed buffer. Diffing the value
  // (instead of reading keydown) works with mobile keyboards too.
  const onChange = (value: string) => {
    if (value.length < state.typed.length) {
      for (let i = value.length; i < state.typed.length; i++) run.input('Backspace')
      return
    }
    for (const ch of value.slice(state.typed.length)) {
      if (ch === ' ') continue
      if (!run.input(ch)) break
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-8 pt-3">
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onExit} aria-label="Back to gardens">
          <ArrowLeft size={15} aria-hidden="true" /> <span className="hidden sm:inline">Gardens</span>
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-xs text-muted">
            {config.tier.name}
            {config.inkGoal !== null ? ` · eat ${config.inkGoal} ink` : ' · endless'}
          </p>
        </div>
        <div className="flex-1" />
        <dl className="flex gap-4 font-mono text-sm tabular">
          <div className="text-right">
            <dt className="font-sans text-[11px] text-muted">Ink</dt>
            <dd>
              {state.inkEaten}
              {config.inkGoal !== null && <span className="text-muted">/{config.inkGoal}</span>}
            </dd>
          </div>
          <div className="text-right">
            <dt className="font-sans text-[11px] text-muted">Length</dt>
            <dd>{state.body.length}</dd>
          </div>
          <div className="text-right">
            <dt className="font-sans text-[11px] text-muted">Score</dt>
            <dd>{run.score}</dd>
          </div>
        </dl>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            run.togglePause()
            inputRef.current?.focus()
          }}
          aria-label={run.paused ? 'Resume' : 'Pause'}
          disabled={!run.started || state.status !== 'playing'}
        >
          {run.paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </Button>
      </div>

      {!run.started && (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-center text-sm text-muted">
          <span className="font-medium text-ink">Type to begin.</span> Type a word next to the head to move there. Eat the ink. Don't bite your tail.
        </p>
      )}

      <div className="relative">
        <SerpentBoard state={state} className={cn(run.paused && 'opacity-40')} />

        <AnimatePresence>
          {(run.paused || ended) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
            >
              <div className="pointer-events-auto rounded-2xl border border-line bg-surface/95 px-6 py-5 text-center shadow-lift backdrop-blur">
                {ended ? (
                  <>
                    <p className="font-serif text-2xl">{ended.state.status === 'cleared' ? 'Garden cleared' : 'Crashed'}</p>
                    <p className="mt-1 text-sm text-muted">
                      Length {ended.state.body.length} · {ended.state.inkEaten} ink · {Math.round(ended.wpm)} WPM
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        <RotateCcw size={14} aria-hidden="true" /> Retry
                      </Button>
                      {ended.state.status === 'cleared' && hasNext && (
                        <Button size="sm" onClick={onNext}>
                          Next garden <SkipForward size={14} aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </>
                ) : run.paused ? (
                  <>
                    <p className="font-serif text-2xl">Paused</p>
                    <p className="mt-1 text-sm text-muted">
                      Press <Kbd>Esc</Kbd> to resume
                    </p>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drift timer (ember = energy). Turns urgent near the end. */}
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 whitespace-nowrap font-mono text-xs text-muted tabular">drift {(left / 1000).toFixed(1)}s</span>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="timer"
          aria-label="Time before the serpent drifts forward"
        >
          <div
            className={cn('h-full rounded-full', urgent ? 'bg-danger' : 'bg-ember')}
            style={{ width: `${(left / run.driftMs) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_16rem] sm:items-center">
        <label className="block">
          <span className="sr-only">Type a word to move</span>
          <input
            ref={inputRef}
            value={state.typed}
            onChange={(e) => onChange(e.target.value)}
            disabled={!!ended}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={ended ? 'Run over' : 'type a word…'}
            className={cn(
              'h-12 w-full rounded-xl border border-line bg-surface px-4 font-mono text-lg text-mint-ink caret-ember outline-none transition-colors focus:border-arcane',
            )}
          />
        </label>
        <ComboMeter combo={run.combo} />
      </div>
    </div>
  )
}
