import { FileText, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/** Autosaved pages. Opening one continues it; deleting offers an undo. */
export function SessionsDrawer() {
  const open = useStore((s) => s.dialog === 'sessions')
  const drafts = useStore((s) => s.drafts)
  const currentId = useStore((s) => s.currentId)
  const { setDialog, openDraft, deleteDraft, restoreDraft, newDraft } = useStore.getState()
  const sorted = [...drafts].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <Dialog open={open} onOpenChange={(o) => setDialog(o ? 'sessions' : null)}>
      <DialogContent side="right">
        <DialogTitle>Saved pages</DialogTitle>
        <DialogDescription>Everything autosaves in this browser.</DialogDescription>
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={() => {
            newDraft()
            useStore.getState().setView('write')
            setDialog(null)
          }}
        >
          <Plus size={15} aria-hidden="true" /> New page
        </Button>
        <ul className="mt-4 space-y-2">
          {sorted.map((d) => {
            const title = d.text.trim().split('\n')[0]?.slice(0, 60) || 'Untitled'
            return (
              <li
                key={d.id}
                className={cn(
                  'group flex items-start gap-2 rounded-xl border p-3 transition-colors',
                  d.id === currentId ? 'border-ember/50 bg-ember-soft/30' : 'border-line hover:bg-surface-2/60',
                )}
              >
                <button className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => openDraft(d.id)}>
                  <p className="flex items-center gap-1.5 truncate font-serif text-base">
                    <FileText size={14} className="shrink-0 text-muted" aria-hidden="true" />
                    <span className="truncate">{title}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(d.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    {' · '}
                    <span className="font-mono tabular">{d.words}</span> words · {d.mode}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${title}`}
                  onClick={() => {
                    deleteDraft(d.id)
                    toast('Page deleted', { action: { label: 'Undo', onClick: () => restoreDraft(d) } })
                  }}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </Button>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
