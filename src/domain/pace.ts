import { ACTIVITIES, UNITS, type ActivityType, type PaceStyle } from './activity'
import { formatClock } from './format'

const SPEED_DECIMALS = 1

const PACE_STYLES = {
  'per-100m': { label: 'Pace', unit: '/100m' },
  'per-500m': { label: 'Split', unit: '/500m' },
  'per-km': { label: 'Pace', unit: '/km' },
  speed: { label: 'Speed', unit: 'km/h' },
} as const satisfies Record<PaceStyle, { label: string; unit: string }>

export function paceStyleOf(activity: ActivityType) {
  return PACE_STYLES[ACTIVITIES[activity].pace]
}

function clockPer({
  meters,
  seconds,
  perMeters,
}: {
  meters: number
  seconds: number
  perMeters: number
}) {
  return formatClock(seconds / (meters / perMeters))
}

export function formatPace({
  activity,
  meters,
  seconds,
}: {
  activity: ActivityType
  meters: number
  seconds: number
}) {
  switch (ACTIVITIES[activity].pace) {
    case 'per-100m': {
      return clockPer({ meters, seconds, perMeters: UNITS.swimPaceMeters })
    }
    case 'per-500m': {
      return clockPer({ meters, seconds, perMeters: UNITS.rowSplitMeters })
    }
    case 'per-km': {
      return clockPer({ meters, seconds, perMeters: UNITS.metersPerKm })
    }
    case 'speed': {
      const hours = seconds / UNITS.secondsPerHour
      return (meters / UNITS.metersPerKm / hours).toFixed(SPEED_DECIMALS)
    }
  }
}
