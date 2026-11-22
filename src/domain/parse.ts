import { ACTIVITIES, UNITS, type ActivityType } from './activity'

const DECIMAL_PATTERN = /^\d+(?:[.,]\d+)?$/
const WHOLE_NUMBER_PATTERN = /^\d+$/
const INPUT_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DURATION_PATTERN = /^(?:(\d+):([0-5]\d)|(\d+)):([0-5]\d)$/

function positiveOrNull(value: number) {
  return value > 0 ? value : null
}

export function parseDecimal(text: string) {
  const trimmed = text.trim()
  if (!DECIMAL_PATTERN.test(trimmed)) return null
  return positiveOrNull(Number(trimmed.replace(',', '.')))
}

export function parseWholeNumber(text: string) {
  const trimmed = text.trim()
  if (!WHOLE_NUMBER_PATTERN.test(trimmed)) return null
  return positiveOrNull(Number(trimmed))
}

export function parseDistanceMeters({
  text,
  activity,
}: {
  text: string
  activity: ActivityType
}) {
  const value = parseDecimal(text)
  if (value === null) return null
  return ACTIVITIES[activity].distanceUnit === 'km' ? value * UNITS.metersPerKm : value
}

export function parseDuration(text: string) {
  const match = DURATION_PATTERN.exec(text.trim())
  if (!match) return null
  const [, hours = '0', minutesAfterHours, minutesAlone, seconds = '0'] = match
  const minutes = minutesAfterHours ?? minutesAlone ?? '0'
  return positiveOrNull(
    Number(hours) * UNITS.secondsPerHour +
      Number(minutes) * UNITS.secondsPerMinute +
      Number(seconds),
  )
}

export function parseInputDate(text: string) {
  const match = INPUT_DATE_PATTERN.exec(text)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}
