import { ACTIVITIES, UNITS, type ActivityType } from './activity'

const THOUSANDS_PATTERN = /\B(?=(\d{3})+(?!\d))/g
const KM_DECIMALS = 2

function padTwo(value: number) {
  return String(value).padStart(2, '0')
}

export function formatGrouped(value: number) {
  return String(Math.round(value)).replaceAll(THOUSANDS_PATTERN, ',')
}

export function formatClock(totalSeconds: number) {
  const rounded = Math.round(totalSeconds)
  const hours = Math.floor(rounded / UNITS.secondsPerHour)
  const minutes = Math.floor((rounded % UNITS.secondsPerHour) / UNITS.secondsPerMinute)
  const seconds = padTwo(rounded % UNITS.secondsPerMinute)
  return hours > 0 ? `${hours}:${padTwo(minutes)}:${seconds}` : `${minutes}:${seconds}`
}

export function formatDistance({
  meters,
  activity,
}: {
  meters: number
  activity: ActivityType
}) {
  const unit = ACTIVITIES[activity].distanceUnit
  const value =
    unit === 'km'
      ? (meters / UNITS.metersPerKm).toFixed(KM_DECIMALS)
      : formatGrouped(meters)
  return { value, unit }
}

export function formatDistanceInput({
  meters,
  activity,
}: {
  meters: number
  activity: ActivityType
}) {
  if (ACTIVITIES[activity].distanceUnit === 'm') return String(Math.round(meters))
  return String(Number((meters / UNITS.metersPerKm).toFixed(KM_DECIMALS)))
}

export function formatDate(date: Date) {
  return `${padTwo(date.getDate())}.${padTwo(date.getMonth() + 1)}.${date.getFullYear()}`
}

export function formatList(items: string[]) {
  const last = items.at(-1) ?? ''
  const rest = items.slice(0, -1)
  return rest.length === 0 ? last : `${rest.join(', ')} and ${last}`
}
