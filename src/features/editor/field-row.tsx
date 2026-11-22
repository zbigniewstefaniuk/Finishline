import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '~/lib/utils'

export function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur()
}

export function FieldRow({
  label,
  unit,
  error,
  hasSeparator,
  children,
}: {
  label: string
  unit?: string
  error?: string
  hasSeparator: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex min-h-13 flex-col justify-center py-2',
        hasSeparator && 'border-b border-border',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-base">{label}</span>
        <div className="flex items-center gap-1.5">
          {children}
          {unit === undefined ? null : (
            <span className="min-w-10 text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
      </div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
