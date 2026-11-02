import { useState } from 'react'
import { gardensFor, OPEN_LAYOUT, type Garden } from '@/game/serpent/gardens'
import { adaptiveDrift, tierById } from '@/game/serpent/tiers'
import type { RunConfig } from '@/hooks/useSerpent'
import { dayKey } from '@/lib/date'
import { hashString } from '@/lib/rng'
import { useStore } from '@/store/useStore'
import { PlacementTest } from './PlacementTest'
import { SerpentHome } from './SerpentHome'
import { SerpentRun } from './SerpentRun'

type Screen =
  | { kind: 'home' }
  | { kind: 'placement' }
  | { kind: 'run'; config: RunConfig; title: string; daily?: boolean; garden?: Garden; nonce: number }

/** Top-level Word Serpent view: placement → hub → runs. */
export function SerpentView() {
  const sp = useStore((s) => s.profile.serpent)
  const [screen, setScreen] = useState<Screen>(() => (sp.placementDone ? { kind: 'home' } : { kind: 'placement' }))
  const tier = tierById(sp.tier)
  const drift = adaptiveDrift(tier, sp.recentWpm)

  const playGarden = (g: Garden) =>
    setScreen({
      kind: 'run',
      title: `${g.name} · Garden ${g.index + 1}`,
      garden: g,
      nonce: Date.now(),
      config: { tier: tierById(g.tier), layout: g.layout, inkGoal: g.inkGoal, driftMs: drift, gardenId: g.id },
    })

  if (screen.kind === 'placement') return <PlacementTest onDone={() => setScreen({ kind: 'home' })} />

  if (screen.kind === 'run') {
    const g = screen.garden
    const next = g ? gardensFor(g.tier)[g.index + 1] : undefined
    return (
      <SerpentRun
        key={screen.nonce}
        config={screen.config}
        title={screen.title}
        daily={screen.daily}
        hasNext={!!next}
        onExit={() => setScreen({ kind: 'home' })}
        onRetry={() => setScreen({ ...screen, nonce: Date.now() })}
        onNext={() => next && playGarden(next)}
      />
    )
  }

  return (
    <SerpentHome
      onPlacement={() => setScreen({ kind: 'placement' })}
      onPlayGarden={playGarden}
      onEndless={() =>
        setScreen({
          kind: 'run',
          title: 'Endless',
          nonce: Date.now(),
          config: { tier, layout: OPEN_LAYOUT, inkGoal: null, driftMs: drift },
        })
      }
      onDaily={() => {
        const day = dayKey()
        const layouts = gardensFor(tier.id)
        const g = layouts[hashString(day) % layouts.length]
        setScreen({
          kind: 'run',
          title: `Daily garden · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
          daily: true,
          nonce: Date.now(),
          config: { tier, layout: g.layout, inkGoal: 10, driftMs: drift, seed: `${day}:${tier.id}` },
        })
      }}
    />
  )
}
