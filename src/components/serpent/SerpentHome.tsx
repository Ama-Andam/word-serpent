import { CalendarDays, Gauge, Infinity as InfinityIcon, Lock, Star } from 'lucide-react'
import { DailyChallengeCard } from '@/components/game/DailyChallengeCard'
import { Button } from '@/components/ui/button'
import { gardensFor, isUnlocked, type Garden } from '@/game/serpent/gardens'
import { TIERS, tierById, type TierId } from '@/game/serpent/tiers'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

interface Props {
  onPlayGarden: (g: Garden) => void
  onEndless: () => void
  onDaily: () => void
  onPlacement: () => void
}

/** Serpent hub: pick a tier, walk the garden map, or play endless/daily runs. */
export function SerpentHome({ onPlayGarden, onEndless, onDaily, onPlacement }: Props) {
  const sp = useStore((s) => s.profile.serpent)
  const setTier = useStore((s) => s.setTier)
  const tier = tierById(sp.tier)
  const gardens = gardensFor(tier.id)
  const tierStars = (id: TierId) => gardensFor(id).reduce((n, g) => n + (sp.stars[g.id] ?? 0), 0)

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 pt-6 lg:grid-cols-[1fr_18rem] lg:px-8">
      <div className="min-w-0 space-y-6">
        <header>
          <h1 className="font-serif text-3xl sm:text-4xl">Word Serpent</h1>
          <p className="mt-1 max-w-prose text-muted">
            Type the word beside your serpent's head to move. Eat ink to grow. Your serpent is made of everything you type.
          </p>
        </header>

        {/* Tier picker */}
        <section aria-labelledby="tier-title">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="tier-title" className="text-sm font-medium">
              Your tier
            </h2>
            <Button variant="ghost" size="sm" onClick={onPlacement}>
              <Gauge size={14} aria-hidden="true" /> Retake placement
            </Button>
          </div>
          <div role="radiogroup" aria-label="Skill tier" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {TIERS.map((t, i) => {
              const active = t.id === tier.id
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTier(t.id)}
                  className={cn(
                    'cursor-pointer rounded-xl border p-3 text-left transition-[border-color,background-color,transform] active:scale-[0.98]',
                    active ? 'border-ember bg-ember-soft/60' : 'border-line bg-surface hover:border-muted/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted">{['I', 'II', 'III', 'IV', 'V'][i]}</span>
                    <span className="flex items-center gap-0.5 font-mono text-[11px] text-muted tabular">
                      <Star size={11} aria-hidden="true" /> {tierStars(t.id)}
                      <span className="sr-only">stars</span>
                    </span>
                  </div>
                  <p className={cn('mt-1 font-medium', active && 'text-ember-ink')}>{t.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted">{t.blurb}</p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Garden map */}
        <section aria-labelledby="garden-title">
          <h2 id="garden-title" className="mb-2 text-sm font-medium">
            {tier.name} gardens
          </h2>
          <ol className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
            {gardens.map((g) => {
              const open = isUnlocked(g, sp.stars)
              const stars = sp.stars[g.id] ?? 0
              return (
                <li key={g.id}>
                  <button
                    disabled={!open}
                    onClick={() => onPlayGarden(g)}
                    className={cn(
                      'group flex w-full cursor-pointer flex-col gap-3 rounded-xl border p-3 text-left transition-[border-color,transform] active:scale-[0.98] disabled:cursor-not-allowed',
                      open ? 'border-line bg-surface hover:border-ember' : 'border-dashed border-line bg-transparent opacity-60',
                    )}
                    aria-label={`${g.name}, garden ${g.index + 1}${open ? `, ${stars} of 3 stars` : ', locked'}`}
                  >
                    <MiniLayout layout={g.layout} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{g.name}</p>
                        <p className="text-xs text-muted">Eat {g.inkGoal} ink</p>
                      </div>
                      {open ? (
                        <span className="flex" aria-hidden="true">
                          {[1, 2, 3].map((i) => (
                            <Star key={i} size={14} className={i <= stars ? 'fill-ember text-ember' : 'text-line'} />
                          ))}
                        </span>
                      ) : (
                        <Lock size={14} className="text-muted" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="mt-2 text-xs text-muted">Stars: clear the garden · 95%+ accuracy · {tier.targetWpm}+ WPM.</p>
        </section>
      </div>

      <aside className="space-y-3" aria-label="Other runs">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
            <InfinityIcon size={13} aria-hidden="true" /> Endless
          </p>
          <p className="mt-2 text-sm text-muted">Open board. The drift speeds up with every ink drop.</p>
          <p className="mt-2 font-mono text-sm tabular">
            Best <span className="text-ember-ink">{sp.best[tier.id] ?? 0}</span>
          </p>
          <Button className="mt-3 w-full" variant="ember" onClick={onEndless}>
            Play endless
          </Button>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
            <CalendarDays size={13} aria-hidden="true" /> Daily garden
          </p>
          <p className="mt-2 text-sm text-muted">Same board for everyone today. Eat 10 ink.</p>
          <Button className="mt-3 w-full" variant="outline" onClick={onDaily}>
            Play today's garden
          </Button>
        </div>
        <DailyChallengeCard />
      </aside>
    </div>
  )
}

/** Tiny preview of a garden's walls. */
function MiniLayout({ layout }: { layout: string[] }) {
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${layout[0].length}, 1fr)` }} aria-hidden="true">
      {layout.flatMap((row, y) =>
        [...row].map((c, x) => (
          <span
            key={`${x},${y}`}
            className={cn('aspect-square rounded-[2px]', c === '#' ? 'bg-muted/50' : c === 'S' ? 'bg-ember' : 'bg-surface-2')}
          />
        )),
      )}
    </div>
  )
}
