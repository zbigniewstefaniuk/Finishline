import { useState } from 'react'
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
    <input
      type="date"
      aria-label="Date"
      className="date-input"
      value={formatInputDate(value)}
      max={formatInputDate(today)}
      onChange={(event) => {
        const date = parseInputDate(event.target.value)
        if (date) onChange(date)
      }}
    />
  )
}
