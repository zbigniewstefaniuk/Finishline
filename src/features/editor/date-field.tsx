import { RiCalendarLine } from '@remixicon/react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { formatDate } from '~/domain/format'

const MONDAY = 1

export function DateField({
  id,
  value,
  onChange,
}: {
  id: string
  value: Date
  onChange: (date: Date) => void
}) {
  const [today] = useState(() => new Date())
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="secondary"
            className="h-9 px-3 text-base font-medium tabular-nums"
          />
        }
      >
        <RiCalendarLine data-icon="inline-start" aria-hidden="true" />
        {formatDate(value)}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          required
          selected={value}
          defaultMonth={value}
          weekStartsOn={MONDAY}
          endMonth={today}
          disabled={{ after: today }}
          onSelect={(date) => {
            onChange(date)
            setIsOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
