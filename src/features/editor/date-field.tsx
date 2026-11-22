import { useState } from 'react'
import { Input } from '~/components/ui/input'
import { formatInputDate } from '~/domain/format'
import { parseInputDate } from '~/domain/parse'

export function DateField({
  value,
  onChange,
}: {
  value: Date
  onChange: (date: Date) => void
}) {
  const [today] = useState(() => new Date())
  return (
    <Input
      type="date"
      aria-label="Date"
      className="h-9 w-auto text-base tabular-nums"
      value={formatInputDate(value)}
      max={formatInputDate(today)}
      onChange={(event) => {
        const date = parseInputDate(event.target.value)
        if (date) onChange(date)
      }}
    />
  )
}
