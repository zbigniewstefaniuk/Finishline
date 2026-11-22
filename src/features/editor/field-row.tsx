import type { KeyboardEvent, ReactNode } from 'react'
import { Field, FieldError, FieldLabel, FieldTitle } from '~/components/ui/field'
import { Separator } from '~/components/ui/separator'

export function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur()
}

export function FieldRow({
  label,
  htmlFor,
  unit,
  error,
  hasSeparator,
  children,
}: {
  label: string
  htmlFor?: string
  unit?: string
  error?: string
  hasSeparator: boolean
  children: ReactNode
}) {
  return (
    <>
      <Field
        orientation="horizontal"
        data-invalid={Boolean(error)}
        className="min-h-13 flex-wrap justify-between gap-x-3 gap-y-1 py-2"
      >
        {htmlFor ? (
          <FieldLabel htmlFor={htmlFor} className="text-base font-normal">
            {label}
          </FieldLabel>
        ) : (
          <FieldTitle className="text-base font-normal">{label}</FieldTitle>
        )}
        <div className="flex items-center gap-1.5">
          {children}
          {unit === undefined ? null : (
            <span className="min-w-10 text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        {error ? <FieldError className="basis-full">{error}</FieldError> : null}
      </Field>
      {hasSeparator ? <Separator /> : null}
    </>
  )
}
