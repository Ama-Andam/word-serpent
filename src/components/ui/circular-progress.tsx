/**
 * CircularProgress — from 21st.dev (@shadcnui-blocks/progress-10).
 * Adapted: exact circumference, a transition on the arc, and an aria role.
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

interface CircularProgressProps {
  value: number
  renderLabel?: (progress: number) => React.ReactNode
  size?: number
  strokeWidth?: number
  shape?: 'square' | 'round'
  className?: string
  progressClassName?: string
  labelClassName?: string
  showLabel?: boolean
  label?: string
}

const CircularProgress = ({
  value,
  renderLabel,
  className,
  progressClassName,
  labelClassName,
  showLabel,
  shape = 'round',
  size = 100,
  strokeWidth = 10,
  label,
}: CircularProgressProps) => {
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference * ((100 - Math.min(100, Math.max(0, value))) / 100)
  const viewBox = `-${size * 0.125} -${size * 0.125} ${size * 1.25} ${size * 1.25}`

  return (
    <div
      className="relative"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg height={size} width={size} viewBox={viewBox} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle
          className={cn('stroke-primary/25', className)}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn('stroke-primary transition-[stroke-dashoffset] duration-300 ease-out', progressClassName)}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap={shape}
          strokeWidth={strokeWidth}
        />
      </svg>
      {showLabel && (
        <div className={cn('absolute inset-0 flex items-center justify-center', labelClassName)}>
          {renderLabel ? renderLabel(value) : value}
        </div>
      )}
    </div>
  )
}

export default CircularProgress
