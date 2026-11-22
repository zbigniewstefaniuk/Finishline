import { ACTIVITIES, type ActivityType } from './activity'

export type Workout = {
  activity: ActivityType
  distanceMeters: number
  durationSeconds: number
  date: Date
  avgHeartRate?: number
  calories?: number
  elevationGainMeters?: number
}

export const STAT_KEYS = ['time', 'pace', 'heart-rate', 'calories', 'elevation'] as const

export type StatKey = (typeof STAT_KEYS)[number]

export const MAX_SECONDARY_STATS = 3

export function statsFor(activity: ActivityType) {
  return STAT_KEYS.filter(
    (stat) => stat !== 'elevation' || ACTIVITIES[activity].tracksElevation,
  )
}
