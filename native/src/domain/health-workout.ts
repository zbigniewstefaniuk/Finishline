import { ACTIVITIES, type ActivityType } from './activity'
import { formatClock, formatDate, formatDistance } from './format'
import type { WorkoutScan } from './workout-scan'

const MS_PER_SECOND = 1000
const TRAIL_PATTERN = /\btrail\b/i

export const HEALTH_LOOKBACK_DAYS = 30

export type HealthWorkout = {
  id: string
  activity: ActivityType
  title?: string
  startTime: Date
  endTime: Date
  distanceMeters?: number
  avgHeartRate?: number
  calories?: number
  elevationGainMeters?: number
}

function positiveRounded(value: number | undefined) {
  if (value === undefined) return undefined
  const rounded = Math.round(value)
  return rounded > 0 ? rounded : undefined
}

function distanceOf(workout: HealthWorkout) {
  const meters = workout.distanceMeters
  return meters !== undefined && meters > 0 ? meters : undefined
}

function durationSecondsOf(workout: HealthWorkout) {
  const elapsed = workout.endTime.getTime() - workout.startTime.getTime()
  return Math.round(elapsed / MS_PER_SECOND)
}

export function lookbackStart(now: Date) {
  const start = new Date(now)
  start.setDate(start.getDate() - HEALTH_LOOKBACK_DAYS)
  return start
}

export function refineActivity({
  activity,
  title,
}: {
  activity: ActivityType
  title?: string
}): ActivityType {
  const isTrailRun =
    activity === 'run' && title !== undefined && TRAIL_PATTERN.test(title)
  return isTrailRun ? 'trail-run' : activity
}

export function toWorkoutScan(workout: HealthWorkout): WorkoutScan {
  const durationSeconds = durationSecondsOf(workout)
  return {
    activity: workout.activity,
    distanceMeters: distanceOf(workout),
    durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
    date: workout.startTime,
    avgHeartRate: positiveRounded(workout.avgHeartRate),
    calories: positiveRounded(workout.calories),
    elevationGainMeters: ACTIVITIES[workout.activity].tracksElevation
      ? positiveRounded(workout.elevationGainMeters)
      : undefined,
  }
}

export function describeHealthWorkout(workout: HealthWorkout) {
  const trimmedTitle = workout.title?.trim() ?? ''
  const title = trimmedTitle === '' ? ACTIVITIES[workout.activity].label : trimmedTitle
  const meters = distanceOf(workout)
  const distance =
    meters === undefined
      ? undefined
      : formatDistance({ meters, activity: workout.activity })
  const parts = [
    formatDate(workout.startTime),
    distance ? `${distance.value} ${distance.unit}` : undefined,
    formatClock(durationSecondsOf(workout)),
  ].filter((part) => part !== undefined)
  return { title, detail: parts.join(' · ') }
}
