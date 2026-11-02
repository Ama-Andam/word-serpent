import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { SessionsDrawer } from '@/components/chrome/SessionsDrawer'
import { ShortcutsModal } from '@/components/chrome/ShortcutsModal'
import { TopBar } from '@/components/chrome/TopBar'
import { WritePanel } from '@/components/editor/WritePanel'
import { GameFeedback } from '@/components/game/GameFeedback'
import { LevelUpBurst } from '@/components/game/LevelUpBurst'
import { SessionSummary } from '@/components/game/SessionSummary'
import { TrophyCase } from '@/components/game/TrophyCase'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useHotkeys } from '@/hooks/useHotkeys'
import { resolvedTheme, toggleTheme, useThemeSync } from '@/hooks/useTheme'
import { useStore } from '@/store/useStore'

// The game loads on demand so the writing view opens fast.
const SerpentView = lazy(() => import('@/components/serpent/SerpentView').then((m) => ({ default: m.SerpentView })))

export default function App() {
  useThemeSync()
  const view = useStore((s) => s.view)
  const theme = useStore((s) => s.settings.theme)
  const s = useStore.getState

  const goWrite = (mode?: 'sprint' | 'focus') => {
    s().setView('write')
    if (mode) s().setWriteMode(mode)
  }

  useHotkeys({
    'alt+n': () => {
      s().newDraft()
      s().setView('write')
    },
    'alt+w': () => goWrite(),
    'alt+g': () => s().setView('serpent'),
    'alt+s': () => goWrite('sprint'),
    'alt+f': () => goWrite('focus'),
    'alt+t': toggleTheme,
    'alt+m': () => s().toggleSound(),
    'alt+h': () => s().setDialog('sessions'),
    'alt+b': () => s().setDialog('trophies'),
    'mod+k': () => s().setDialog('help'),
    '?': () => s().setDialog('help'),
  })

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex min-h-dvh flex-col">
        <TopBar />
        <main id="main" className="flex flex-1 flex-col">
          {view === 'write' ? (
            <WritePanel />
          ) : (
            <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
              <SerpentView />
            </Suspense>
          )}
        </main>
      </div>
      <SessionsDrawer />
      <TrophyCase />
      <ShortcutsModal />
      <SessionSummary
        onNewPage={() => {
          s().newDraft()
        }}
      />
      <LevelUpBurst />
      <GameFeedback />
      <Toaster
        position="bottom-center"
        theme={resolvedTheme(theme)}
        toastOptions={{
          className: '!bg-surface !text-ink !border-line !font-sans !rounded-xl',
          descriptionClassName: '!text-muted',
        }}
      />
    </TooltipProvider>
  )
}
