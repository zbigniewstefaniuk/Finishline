import { Linking } from 'react-native'
import {
  ExerciseType,
  SdkAvailabilityStatus,
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  type Permission,
} from 'react-native-health-connect'
import type { ActivityType } from '~/domain/activity'
import {
  lookbackStart,
  refineActivity,
  type HealthWorkout,
} from '~/domain/health-workout'

export type HealthAccess = 'connected' | 'not-connected' | 'needs-update' | 'unavailable'

const HEALTH_CONNECT_STORE_URL = 'market://details?id=com.google.android.apps.healthdata'
const MAX_SESSIONS = 50

const READ_PERMISSIONS = [
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'TotalCaloriesBurned' },
  { accessType: 'read', recordType: 'ElevationGained' },
] satisfies Permission[]

const EXERCISE_ACTIVITIES = new Map<number, ActivityType>([
  [ExerciseType.SWIMMING_POOL, 'pool-swim'],
  [ExerciseType.SWIMMING_OPEN_WATER, 'open-water-swim'],
  [ExerciseType.RUNNING, 'run'],
  [ExerciseType.RUNNING_TREADMILL, 'run'],
  [ExerciseType.WALKING, 'walk'],
  [ExerciseType.HIKING, 'hike'],
  [ExerciseType.BIKING, 'ride'],
  [ExerciseType.BIKING_STATIONARY, 'ride'],
  [ExerciseType.ROWING, 'row'],
  [ExerciseType.ROWING_MACHINE, 'row'],
  [ExerciseType.SKIING, 'ski'],
])

function valueOrUndefined<T>(promise: Promise<T>) {
  return promise.then(
    (value) => value,
    () => undefined,
  )
}

async function canReadSessions() {
  const granted = await getGrantedPermissions()
  return granted.some(
    (permission) =>
      permission.accessType === 'read' && permission.recordType === 'ExerciseSession',
  )
}

export async function checkHealthAccess(): Promise<HealthAccess> {
  const status = await getSdkStatus()
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) return 'unavailable'
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    return 'needs-update'
  }
  await initialize()
  return (await canReadSessions()) ? 'connected' : 'not-connected'
}

export async function requestHealthAccess() {
  await initialize()
  await requestPermission(READ_PERMISSIONS)
  return canReadSessions()
}

export function openHealthConnect() {
  openHealthConnectSettings()
}

export async function openHealthConnectStore() {
  await Linking.openURL(HEALTH_CONNECT_STORE_URL)
}

async function readTotals({
  startTime,
  endTime,
  dataOrigin,
}: {
  startTime: string
  endTime: string
  dataOrigin?: string
}) {
  const filter = {
    timeRangeFilter: { operator: 'between', startTime, endTime } as const,
    dataOriginFilter: dataOrigin ? [dataOrigin] : undefined,
  }
  const [distance, heartRate, activeCalories, totalCalories, elevation] =
    await Promise.all([
      valueOrUndefined(aggregateRecord({ recordType: 'Distance', ...filter })),
      valueOrUndefined(aggregateRecord({ recordType: 'HeartRate', ...filter })),
      valueOrUndefined(
        aggregateRecord({ recordType: 'ActiveCaloriesBurned', ...filter }),
      ),
      valueOrUndefined(aggregateRecord({ recordType: 'TotalCaloriesBurned', ...filter })),
      valueOrUndefined(aggregateRecord({ recordType: 'ElevationGained', ...filter })),
    ])
  const activeKcal = activeCalories?.ACTIVE_CALORIES_TOTAL.inKilocalories
  const hasActiveCalories = activeKcal !== undefined && activeKcal > 0
  return {
    distanceMeters: distance?.DISTANCE.inMeters,
    avgHeartRate: heartRate?.BPM_AVG,
    calories: hasActiveCalories ? activeKcal : totalCalories?.ENERGY_TOTAL.inKilocalories,
    elevationGainMeters: elevation?.ELEVATION_GAINED_TOTAL.inMeters,
  }
}

export async function readRecentWorkouts(now: Date): Promise<HealthWorkout[]> {
  const { records } = await readRecords('ExerciseSession', {
    timeRangeFilter: {
      operator: 'between',
      startTime: lookbackStart(now).toISOString(),
      endTime: now.toISOString(),
    },
    ascendingOrder: false,
    pageSize: MAX_SESSIONS,
  })
  const supported = records.flatMap((record) => {
    const activity = EXERCISE_ACTIVITIES.get(record.exerciseType)
    return activity ? [{ record, activity }] : []
  })
  return Promise.all(
    supported.map(async ({ record, activity }) => {
      const totals = await readTotals({
        startTime: record.startTime,
        endTime: record.endTime,
        dataOrigin: record.metadata?.dataOrigin,
      })
      const workout: HealthWorkout = {
        id: record.metadata?.id ?? `${record.startTime}-${record.exerciseType}`,
        activity: refineActivity({ activity, title: record.title }),
        title: record.title,
        startTime: new Date(record.startTime),
        endTime: new Date(record.endTime),
        distanceMeters: totals.distanceMeters,
        avgHeartRate: totals.avgHeartRate,
        calories: totals.calories,
        elevationGainMeters: totals.elevationGainMeters,
      }
      return workout
    }),
  )
}
