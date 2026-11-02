import { cn } from '@/lib/utils'

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 font-mono text-[11px] text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
