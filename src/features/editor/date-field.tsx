import { Suspense, lazy, useState } from 'react'
import { DateButton } from './date-button'

function loadDatePicker() {
  return import('./date-picker').then((module) => ({ default: module.DatePicker }))
}

const DatePicker = lazy(loadDatePicker)

export function DateField({
  id,
  value,
  onChange,
}: {
  id: string
  value: Date
  onChange: (date: Date) => void
}) {
  const [isPickerLoaded, setIsPickerLoaded] = useState(false)

  if (!isPickerLoaded) {
    return (
      <DateButton
        id={id}
        date={value}
        onPointerDown={() => void loadDatePicker()}
        onClick={() => setIsPickerLoaded(true)}
      />
    )
  }
  return (
    <Suspense fallback={<DateButton id={id} date={value} disabled />}>
      <DatePicker id={id} value={value} onChange={onChange} />
    </Suspense>
  )
}
