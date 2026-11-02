import * as Menu from '@radix-ui/react-dropdown-menu'
import { Feather, FolderOpen, Gamepad2, Keyboard, Moon, MoreHorizontal, PenLine, Sun, Trophy, Volume2, VolumeX } from 'lucide-react'
import { StreakFlame } from '@/components/game/StreakFlame'
import { XpBar } from '@/components/game/XpBar'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { Tip } from '@/components/ui/tooltip'
import { toggleTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

export function TopBar() {
  const view = useStore((s) => s.view)
  const sound = useStore((s) => s.settings.sound)
  const focusing = useStore((s) => s.focusing && s.view === 'write')
  const { setView, setDialog, toggleSound } = useStore.getState()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur transition-opacity duration-500',
        focusing && 'opacity-0 focus-within:opacity-100 hover:opacity-100',
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3 lg:px-8">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
          Skip to content
        </a>
        <span className="flex items-center gap-1.5 font-serif text-xl tracking-tight">
          <Feather size={18} className="text-ember" aria-hidden="true" />
          <span className="sr-only sm:hidden">inkwell</span>
          <span className="hidden sm:inline">inkwell</span>
        </span>

        <Segmented
          id="view"
          label="Section"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'write', label: 'Write', icon: <PenLine size={13} aria-hidden="true" className="hidden sm:block" /> },
            { value: 'serpent', label: 'Serpent', icon: <Gamepad2 size={13} aria-hidden="true" className="hidden sm:block" /> },
          ]}
        />

        <div className="flex-1" />

        <StreakFlame />
        <XpBar />

        {/* Phones: secondary actions live in one menu so the bar never overflows. */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="More" className="sm:hidden">
              <MoreHorizontal size={18} aria-hidden="true" />
            </Button>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-48 rounded-xl border border-line bg-surface p-1 text-ink shadow-lift"
            >
              {[
                { label: 'Saved pages', icon: FolderOpen, run: () => setDialog('sessions') },
                { label: 'Trophy case', icon: Trophy, run: () => setDialog('trophies') },
                { label: sound ? 'Turn sound off' : 'Turn sound on', icon: sound ? VolumeX : Volume2, run: toggleSound },
                { label: 'Toggle theme', icon: Sun, run: toggleTheme },
              ].map((it) => (
                <Menu.Item
                  key={it.label}
                  onSelect={it.run}
                  className="flex h-11 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm outline-none data-[highlighted]:bg-surface-2"
                >
                  <it.icon size={16} aria-hidden="true" /> {it.label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>

        <div className="hidden items-center sm:flex">
          <Tip label="Saved pages">
            <Button variant="ghost" size="icon" aria-label="Saved pages" onClick={() => setDialog('sessions')}>
              <FolderOpen size={17} aria-hidden="true" />
            </Button>
          </Tip>
          <Tip label="Trophy case">
            <Button variant="ghost" size="icon" aria-label="Trophy case" onClick={() => setDialog('trophies')}>
              <Trophy size={17} aria-hidden="true" />
            </Button>
          </Tip>
          <Tip label={sound ? 'Sound on' : 'Sound off'}>
            <Button variant="ghost" size="icon" aria-label="Sound" aria-pressed={sound} onClick={toggleSound}>
              {sound ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
            </Button>
          </Tip>
          <Tip label="Toggle theme">
            <Button variant="ghost" size="icon" aria-label="Toggle light or dark theme" onClick={toggleTheme}>
              <Sun size={17} aria-hidden="true" className="hidden dark:block" />
              <Moon size={17} aria-hidden="true" className="dark:hidden" />
            </Button>
          </Tip>
          <Tip label="Shortcuts">
            <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts" onClick={() => setDialog('help')}>
              <Keyboard size={17} aria-hidden="true" />
            </Button>
          </Tip>
        </div>
      </div>
    </header>
  )
}
