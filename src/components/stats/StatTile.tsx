import { cn } from '@/lib/utils'

export function StatTile({ label, value, hint, className }: { label: string; value: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn('rounded-lg bg-surface-2/70 px-3 py-2', className)} title={hint}>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="font-mono text-lg font-medium leading-tight tabular">{value}</dd>
    </div>
  )
}
