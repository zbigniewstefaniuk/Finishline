import { RiCalendarLine } from '@remixicon/react'
import type { ComponentProps } from 'react'
import { Button } from '~/components/ui/button'
import { formatDate } from '~/domain/format'

export function DateButton({
  date,
  ...props
}: ComponentProps<typeof Button> & { date: Date }) {
  return (
    <Button
      variant="secondary"
      className="h-9 px-3 text-base font-medium tabular-nums"
      {...props}
    >
      <RiCalendarLine data-icon="inline-start" aria-hidden="true" />
      {formatDate(date)}
    </Button>
  )
}
