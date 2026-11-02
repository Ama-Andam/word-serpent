/** Segmented control (radio group semantics) with a sliding indicator. */
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface Option<T extends string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  id,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  label: string
  id: string
  size?: 'sm' | 'md'
}) {
  return (
    <div role="radiogroup" aria-label={label} className="relative inline-flex rounded-xl bg-surface-2 p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-lg font-medium transition-colors',
              size === 'md' ? 'h-8 px-3 text-sm' : 'h-7 px-2.5 text-xs',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 -z-10 rounded-lg bg-surface shadow-sm shadow-black/10"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
