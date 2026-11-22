import type { KeyboardEvent, ReactNode } from 'react'

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
    <div className="field-row" data-separated={hasSeparator || undefined}>
      <div className="field-line">
        <span className="field-label">{label}</span>
        <div className="field-value">
          {children}
          {unit === undefined ? null : <span className="field-unit">{unit}</span>}
        </div>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}
