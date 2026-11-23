import { useState } from 'react'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { DateButton } from './date-button'

const MONDAY = 1

export function DatePicker({
  id,
  value,
  onChange,
}: {
  id: string
  value: Date
  onChange: (date: Date) => void
}) {
  const [today] = useState(() => new Date())
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={<DateButton id={id} date={value} />} />
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
