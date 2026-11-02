import * as Menu from '@radix-ui/react-dropdown-menu'
import { ClipboardCopy, Download, FileText, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { copyText, downloadText, slugify, toMarkdown } from '@/lib/export'

const item =
  'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-surface-2'

export function ExportMenu({ text }: { text: string }) {
  const title = text.trim().split('\n')[0]?.replace(/^#+\s*/, '').slice(0, 60) || 'Untitled'
  const empty = !text.trim()
  const guard = (fn: () => void) => () => (empty ? toast('Nothing to export yet') : fn())

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="sm" aria-label="Export or copy">
          <Download size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-xl border border-line bg-surface p-1 text-ink shadow-lift data-[state=open]:animate-[fade_150ms_ease-out]"
        >
          <Menu.Item className={item} onSelect={guard(() => downloadText(`${slugify(title)}.txt`, text))}>
            <FileText size={15} aria-hidden="true" /> Download .txt
          </Menu.Item>
          <Menu.Item
            className={item}
            onSelect={guard(() => downloadText(`${slugify(title)}.md`, toMarkdown(title, text), 'text/markdown'))}
          >
            <Hash size={15} aria-hidden="true" /> Download .md
          </Menu.Item>
          <Menu.Separator className="my-1 h-px bg-line" />
          <Menu.Item
            className={item}
            onSelect={guard(async () => toast((await copyText(text)) ? 'Copied to clipboard' : "Couldn't copy. Your browser blocked clipboard access."))}
          >
            <ClipboardCopy size={15} aria-hidden="true" /> Copy all
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
