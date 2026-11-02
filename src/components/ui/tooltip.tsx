/** Tooltip — shadcn/ui pattern on Radix Tooltip. Also shows on keyboard focus. */
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

export const TooltipProvider = TooltipPrimitive.Provider

export function Tip({ label, children }: { label: React.ReactNode; children: React.ReactElement }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 rounded-md bg-ink px-2 py-1 text-xs font-medium text-bg shadow-lift data-[state=delayed-open]:animate-[fade_150ms_ease-out]"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
