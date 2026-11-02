import { Ban, Flag, Timer } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { StatsRail } from '@/components/stats/StatsRail'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { dailyChallenge } from '@/game/challenges/registry'
import { bump, emptyCombo, multiplier, touch, type Combo } from '@/game/combo'
import { emit } from '@/game/events'
import type { WriteMode } from '@/game/types'
import { XP } from '@/game/xp'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useNow } from '@/hooks/useNow'
import { play } from '@/lib/sound'
import { countWords, getTextStats } from '@/lib/textStats'
import { clamp, cn, formatClock } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { ExportMenu } from './ExportMenu'

/** Pauses longer than this don't count toward active writing time. */
const IDLE_CAP_MS = 5000
const WPM_WINDOW_MS = 15000
/** Focus mode reveals the summary after this much quiet. */
const FOCUS_REVEAL_MS = 8000

const PROMPTS = [
  'Begin anywhere. The first sentence is allowed to be bad.',
  'Write about a door you never opened.',
  'Describe the last thing that made you laugh, slowly.',
  'What does the room sound like right now?',
  'Start with a lie, end with the truth.',
]

/** Per-session counters. Kept in a ref so typing never waits on React. */
interface Metrics {
  startedAt: number
  lastKeyAt: number
  activeMs: number
  inserted: number
  deleted: number
  backspaces: number
  startWords: number
  insertTimes: number[]
  liveXp: number
  goalHit: boolean
  /** Highest count of finished words seen, so XP is only paid for new words. */
  bestCompleted: number
  /** Set by a paste/drop so the next change doesn't earn XP. */
  pasting: boolean
}

const freshMetrics = (startWords: number): Metrics => ({
  startedAt: 0,
  lastKeyAt: 0,
  activeMs: 0,
  inserted: 0,
  deleted: 0,
  backspaces: 0,
  startWords,
  insertTimes: [],
  liveXp: 0,
  goalHit: false,
  bestCompleted: startWords,
  pasting: false,
})

/** Words that are finished (followed by a space or punctuation), ignoring the one being typed. */
const completedWords = (text: string) => countWords(text.replace(/[\p{L}\p{N}'’-]+$/u, ''))

export function WritePanel() {
  const draft = useStore((s) => s.drafts.find((d) => d.id === s.currentId) ?? s.drafts[0])
  const { writeMode: mode, goal, sprintSeconds } = useStore((s) => s.settings)
  const resetTick = useStore((s) => s.resetTick)
  const challengeActive = useStore((s) => s.challengeActive)
  const noBackspace = challengeActive && !!dailyChallenge().setup.noBackspace
  const store = useStore.getState

  const text = draft?.text ?? ''
  const ref = useRef<HTMLTextAreaElement>(null)
  const m = useRef<Metrics>(freshMetrics(countWords(text)))
  const [combo, setCombo] = useState<Combo>(emptyCombo)
  const comboRef = useRef(combo)
  const [started, setStarted] = useState(false)
  const [shake, setShake] = useState(0)
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const now = useNow(started, 500)

  // New page / opened draft / mode switch → start a fresh session.
  const reset = useCallback(() => {
    const d = store().drafts.find((x) => x.id === store().currentId)
    m.current = freshMetrics(countWords(d?.text ?? ''))
    comboRef.current = emptyCombo()
    setCombo(comboRef.current)
    setStarted(false)
    store().setFocusing(false)
    requestAnimationFrame(() => ref.current?.focus())
  }, [store])

  useEffect(reset, [resetTick, mode, reset])

  const stats = useMemo(() => getTextStats(text), [text])
  const sessionWords = Math.max(0, stats.words - m.current.startWords)

  // --- live numbers --------------------------------------------------------
  const mm = m.current
  const elapsedActive = started ? mm.activeMs + Math.min(now - mm.lastKeyAt, IDLE_CAP_MS) : 0
  const recent = mm.insertTimes.filter((t) => t > now - WPM_WINDOW_MS).length
  const windowMs = started ? clamp(now - mm.startedAt, 3000, WPM_WINDOW_MS) : WPM_WINDOW_MS
  const liveWpm = started ? Math.min(300, recent / 5 / (windowMs / 60000)) : 0
  const accuracy = mm.inserted ? clamp((mm.inserted - mm.deleted) / mm.inserted, 0, 1) : 1
  const sprintLeft = mode === 'sprint' && started ? sprintSeconds * 1000 - (now - mm.startedAt) : sprintSeconds * 1000

  // --- finishing -----------------------------------------------------------
  const finish = useCallback(() => {
    const cur = m.current
    const words = Math.max(0, countWords(ref.current?.value ?? '') - cur.startWords)
    if (!cur.startedAt || words === 0) {
      toast('Write a few words first')
      return
    }
    const wall = Date.now() - cur.startedAt
    const duration = mode === 'sprint' ? Math.min(wall, sprintSeconds * 1000) : Math.max(cur.activeMs, 1000)
    const st = getTextStats(ref.current?.value ?? '')
    store().finishSession({
      id: `${Date.now()}`,
      mode,
      endedAt: Date.now(),
      durationMs: duration,
      words,
      wpm: Math.min(300, words / Math.max(duration / 60000, 1 / 60)),
      accuracy: cur.inserted ? clamp((cur.inserted - cur.deleted) / cur.inserted, 0, 1) : 1,
      backspaces: cur.backspaces,
      longestSentence: st.longestSentence,
      peakCombo: comboRef.current.peak,
      goal,
      goalHit: cur.goalHit,
      liveXp: cur.liveXp,
    })
    reset()
  }, [goal, mode, reset, sprintSeconds, store])

  // Sprint countdown ends the session automatically.
  useEffect(() => {
    if (mode === 'sprint' && started && sprintLeft <= 0) finish()
  }, [finish, mode, sprintLeft, started])

  // Focus mode: once you stop typing for a while, reveal the summary.
  useEffect(() => {
    if (mode === 'focus' && started && sessionWords > 0 && now - m.current.lastKeyAt > FOCUS_REVEAL_MS) finish()
  }, [finish, mode, now, started, sessionWords])

  useHotkeys({
    escape: () => {
      const s = store()
      if (s.view === 'write' && !s.dialog && !s.result) finish()
    },
  })

  // --- keystroke tracking ---------------------------------------------------
  // beforeinput (native, works with mobile keyboards) feeds accuracy and WPM,
  // and enforces the no-backspace challenge.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onBeforeInput = (e: InputEvent) => {
      const t = Date.now()
      const cur = m.current
      if (e.inputType.startsWith('delete')) {
        if (noBackspace) {
          e.preventDefault()
          setShake((n) => n + 1)
          play('miss')
          return
        }
        cur.backspaces++
        cur.deleted++
        return
      }
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
        cur.pasting = true
        return
      }
      const data = e.data ?? (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph' ? '\n' : '')
      cur.inserted += data.length
      for (let i = 0; i < data.length; i++) cur.insertTimes.push(t)
      if (cur.insertTimes.length > 600) cur.insertTimes.splice(0, 300)
    }
    el.addEventListener('beforeinput', onBeforeInput)
    return () => el.removeEventListener('beforeinput', onBeforeInput)
  }, [noBackspace])

  // The change handler drives timing, combo and XP. It sees every input
  // method (typing, dictation, autocomplete), so nothing slips through.
  const onChange = (value: string) => {
    store().updateText(value)
    const t = Date.now()
    const cur = m.current
    if (!cur.startedAt) {
      cur.startedAt = t
      cur.lastKeyAt = t
      setStarted(true)
    }
    cur.activeMs += Math.min(t - cur.lastKeyAt, IDLE_CAP_MS)
    cur.lastKeyAt = t
    if (mode === 'focus') store().setFocusing(true)

    // Fallback for input methods that skip beforeinput: count the growth here.
    const grew = value.length - text.length
    if (grew > 0 && !cur.pasting && (cur.insertTimes.at(-1) ?? 0) < t - 30) {
      cur.inserted += grew
      for (let i = 0; i < grew; i++) cur.insertTimes.push(t)
    }

    let c = touch(comboRef.current, t)
    const done = completedWords(value)
    if (cur.pasting) {
      cur.pasting = false
      cur.bestCompleted = Math.max(cur.bestCompleted, done)
    } else if (done > cur.bestCompleted) {
      // Each newly finished word → combo + XP (capped to keep autocomplete fair).
      for (let i = 0; i < Math.min(done - cur.bestCompleted, 10); i++) {
        const before = multiplier(c.count)
        c = bump(c, t)
        const mult = multiplier(c.count)
        if (mult > before) emit('comboTier', { multiplier: mult })
        const gained = XP.perWord * mult
        cur.liveXp += gained
        store().gainXp(gained)
      }
      cur.bestCompleted = done
    }
    comboRef.current = c
    setCombo(c)

    const words = countWords(value) - cur.startWords
    if (!cur.goalHit && goal > 0 && words >= goal) {
      cur.goalHit = true
      emit('goalHit', { goal })
    }
  }

  const focusing = useStore((s) => s.focusing)
  const hideStats = mode === 'focus' && focusing

  const setMode = (v: WriteMode) => {
    if (started && sessionWords > 0) finish()
    store().setWriteMode(v)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-8 pt-4 lg:flex-row lg:gap-8 lg:px-8">
      <section className="flex min-w-0 flex-1 flex-col" aria-label="Writing">
        {/* Toolbar */}
        <div
          className={cn(
            'flex flex-wrap items-center gap-2 transition-opacity duration-500',
            hideStats && 'opacity-0 focus-within:opacity-100 hover:opacity-100',
          )}
        >
          <Segmented
            id="write-mode"
            label="Writing mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'sprint', label: 'Sprint' },
              { value: 'focus', label: 'Focus' },
            ]}
          />
          <label className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2 text-xs text-muted">
            Goal
            <input
              type="number"
              inputMode="numeric"
              min={10}
              max={10000}
              step={10}
              value={goal}
              onChange={(e) => store().setGoal(clamp(Number(e.target.value) || 0, 0, 10000))}
              className="w-14 bg-transparent font-mono text-sm text-ink tabular outline-none"
              aria-label="Word goal"
            />
          </label>
          {mode === 'sprint' && (
            <label className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2 text-xs text-muted">
              <Timer size={14} aria-hidden="true" />
              <select
                value={sprintSeconds}
                disabled={started}
                onChange={(e) => store().setSprintSeconds(Number(e.target.value))}
                className="cursor-pointer bg-transparent font-mono text-sm text-ink outline-none"
                aria-label="Sprint length"
              >
                {[60, 120, 300, 600, 900].map((s) => (
                  <option key={s} value={s}>
                    {s / 60} min
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="flex-1" />
          {!hideStats && (
            <span
              className={cn(
                'font-mono text-sm tabular',
                mode === 'sprint' && started && sprintLeft < 15000 ? 'text-ember' : 'text-muted',
              )}
              aria-label={mode === 'sprint' ? 'Time left' : 'Session time'}
              role="timer"
            >
              {mode === 'sprint' ? formatClock(sprintLeft) : formatClock(elapsedActive)}
            </span>
          )}
          <ExportMenu text={text} />
          <Button size="sm" variant={started ? 'default' : 'outline'} onClick={finish} title="Finish session (Esc)">
            <Flag size={14} aria-hidden="true" /> Finish
          </Button>
        </div>

        {/* Goal progress (ember until hit, then mint) */}
        <div
          className={cn('mt-3 h-1 overflow-hidden rounded-full bg-surface-2 transition-opacity', hideStats && 'opacity-0')}
          aria-hidden="true"
        >
          <motion.div
            className={cn('h-full rounded-full', sessionWords >= goal ? 'bg-mint' : 'bg-ember')}
            initial={false}
            animate={{ width: `${clamp(goal ? (sessionWords / goal) * 100 : 0, 0, 100)}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 24 }}
          />
        </div>

        {noBackspace && (
          <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-ember-soft px-3 py-1 text-xs font-medium text-ember-ink">
            <Ban size={13} aria-hidden="true" /> Backspace is off for this challenge
          </p>
        )}

        <div key={shake} className={cn('flex flex-1', shake > 0 && 'animate-shake')}>
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={prompt}
            aria-label="Writing area"
            spellCheck
            autoFocus
            className="mx-auto mt-6 min-h-[55dvh] w-full max-w-[68ch] flex-1 resize-none bg-transparent font-serif text-[20px] leading-[1.7] text-ink caret-ember outline-none placeholder:italic placeholder:text-muted/70 sm:text-[21px] lg:min-h-[70dvh]"
          />
        </div>
      </section>

      <StatsRail
        className={cn(
          'w-full shrink-0 transition-opacity duration-500 lg:sticky lg:top-20 lg:w-72 lg:self-start',
          hideStats && 'pointer-events-none opacity-0',
        )}
        combo={combo}
        stats={{ text: stats, sessionWords, wpm: liveWpm, accuracy, goal }}
      />
    </div>
  )
}
