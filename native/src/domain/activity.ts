export const ACTIVITY_TYPES = [
  'pool-swim',
  'open-water-swim',
  'run',
  'trail-run',
  'walk',
  'hike',
  'ride',
  'row',
  'ski',
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export type PaceStyle = 'per-100m' | 'per-500m' | 'per-km' | 'speed'

type DistanceUnit = 'm' | 'km'

type ActivityDefinition = {
  label: string
  distanceUnit: DistanceUnit
  pace: PaceStyle
  tracksElevation: boolean
}

export const ACTIVITIES = {
  'pool-swim': {
    label: 'Pool swim',
    distanceUnit: 'm',
    pace: 'per-100m',
    tracksElevation: false,
  },
  'open-water-swim': {
    label: 'Open water',
    distanceUnit: 'm',
    pace: 'per-100m',
    tracksElevation: false,
  },
  run: { label: 'Run', distanceUnit: 'km', pace: 'per-km', tracksElevation: true },
  'trail-run': {
    label: 'Trail run',
    distanceUnit: 'km',
    pace: 'per-km',
    tracksElevation: true,
  },
  walk: { label: 'Walk', distanceUnit: 'km', pace: 'per-km', tracksElevation: true },
  hike: { label: 'Hike', distanceUnit: 'km', pace: 'per-km', tracksElevation: true },
  ride: { label: 'Ride', distanceUnit: 'km', pace: 'speed', tracksElevation: true },
  row: { label: 'Row', distanceUnit: 'm', pace: 'per-500m', tracksElevation: false },
  ski: { label: 'Ski', distanceUnit: 'km', pace: 'speed', tracksElevation: true },
} as const satisfies Record<ActivityType, ActivityDefinition>

export const UNITS = {
  metersPerKm: 1000,
  swimPaceMeters: 100,
  rowSplitMeters: 500,
  secondsPerMinute: 60,
  secondsPerHour: 3600,
} as const
