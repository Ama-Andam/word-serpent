import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import CircularProgress from '@/components/ui/circular-progress'
import { DailyChallengeCard } from '@/components/game/DailyChallengeCard'
import { ComboMeter } from '@/components/game/ComboMeter'
import type { Combo } from '@/game/combo'
import type { TextStats } from '@/lib/textStats'
import { cn } from '@/lib/utils'
import { StatTile } from './StatTile'

export interface LiveStats {
  text: TextStats
  sessionWords: number
  wpm: number
  accuracy: number
  goal: number
}

/**
 * Always-visible live stats. A column on desktop; a collapsible panel under
 * the editor on small screens.
 */
export function StatsRail({ stats, combo, className }: { stats: LiveStats; combo: Combo; className?: string }) {
  const [open, setOpen] = useState(false)
  const t = stats.text
  const goalPct = stats.goal ? (stats.sessionWords / stats.goal) * 100 : 0
  const reading = t.readingMinutes < 1 ? `${Math.max(0, Math.round(t.readingMinutes * 60))}s` : `${Math.round(t.readingMinutes)}m`

  return (
    <aside aria-label="Live stats" className={cn('flex flex-col gap-3', className)}>
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <CircularProgress
            value={goalPct}
            size={64}
            strokeWidth={9}
            className="stroke-surface-2"
            progressClassName={goalPct >= 100 ? 'stroke-mint' : 'stroke-ember'}
            label="Word goal progress"
            showLabel
            labelClassName="font-mono text-[11px] font-medium tabular"
            renderLabel={(v) => `${Math.min(100, Math.round(v))}%`}
          />
          <div className="min-w-0">
            <p className="font-mono text-2xl font-medium leading-none tabular">{stats.sessionWords}</p>
            <p className="mt-1 text-xs text-muted">of {stats.goal} words this session</p>
          </div>
        </div>
        <ComboMeter combo={combo} className="mt-4" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatTile label="WPM" value={Math.round(stats.wpm)} hint="Words per minute over the last 15 seconds" />
          <StatTile label="Accuracy" value={`${Math.round(stats.accuracy * 100)}%`} hint="Characters kept vs. deleted" />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <button
          className="flex w-full cursor-pointer items-center justify-between text-left text-[11px] font-medium uppercase tracking-wider text-muted lg:cursor-default"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="text-stats"
        >
          Text
          <ChevronDown size={14} aria-hidden="true" className={cn('transition-transform lg:hidden', open && 'rotate-180')} />
        </button>
        <dl id="text-stats" className={cn('mt-3 grid-cols-2 gap-2', open ? 'grid' : 'hidden lg:grid')}>
          <StatTile label="Words" value={t.words} />
          <StatTile label="Characters" value={t.chars} />
          <StatTile label="No spaces" value={t.charsNoSpaces} />
          <StatTile label="Sentences" value={t.sentences} />
          <StatTile label="Paragraphs" value={t.paragraphs} />
          <StatTile label="Reading time" value={reading} />
          <StatTile label="Avg word" value={t.avgWordLength.toFixed(1)} hint="Average letters per word" className="col-span-2" />
        </dl>
      </div>

      <DailyChallengeCard />
    </aside>
  )
}
