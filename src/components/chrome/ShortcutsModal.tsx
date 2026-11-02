import { SHORTCUTS } from '@/app/shortcuts'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { isMac } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const label = (k: string) => (k === 'mod' ? (isMac ? '⌘' : 'Ctrl') : k === 'alt' ? (isMac ? '⌥' : 'Alt') : k)

export function ShortcutsModal() {
  const open = useStore((s) => s.dialog === 'help')
  const setDialog = useStore((s) => s.setDialog)
  return (
    <Dialog open={open} onOpenChange={(o) => setDialog(o ? 'help' : null)}>
      <DialogContent>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Everything works without a mouse.</DialogDescription>
        <ul className="mt-4 divide-y divide-line">
          {SHORTCUTS.map((s) => (
            <li key={s.combo} className="flex items-center justify-between py-2 text-sm">
              <span>{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <Kbd key={k}>{label(k)}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
