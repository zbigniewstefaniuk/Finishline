import { describe, expect, it } from 'vitest'
import {
  describeHealthWorkout,
  lookbackStart,
  refineActivity,
  toWorkoutScan,
  type HealthWorkout,
} from './health-workout'

function workout(overrides: Partial<HealthWorkout> = {}): HealthWorkout {
  return {
    id: 'session-1',
    activity: 'run',
    startTime: new Date(2026, 10, 21, 7, 12, 0),
    endTime: new Date(2026, 10, 21, 8, 1, 5),
    distanceMeters: 10_020.4,
    avgHeartRate: 151.6,
    calories: 640.2,
    elevationGainMeters: 85.7,
    ...overrides,
  }
}

describe('toWorkoutScan', () => {
  it('turns a session into form values with elapsed time and rounded totals', () => {
    expect(toWorkoutScan(workout())).toEqual({
      activity: 'run',
      distanceMeters: 10_020.4,
      durationSeconds: 2945,
      date: new Date(2026, 10, 21, 7, 12, 0),
      avgHeartRate: 152,
      calories: 640,
      elevationGainMeters: 86,
    })
  })

  it('treats zero totals from an empty aggregate as missing', () => {
    const scan = toWorkoutScan(
      workout({
        distanceMeters: 0,
        avgHeartRate: 0,
        calories: 0,
        elevationGainMeters: 0,
      }),
    )
    expect(scan.distanceMeters).toBeUndefined()
    expect(scan.avgHeartRate).toBeUndefined()
    expect(scan.calories).toBeUndefined()
    expect(scan.elevationGainMeters).toBeUndefined()
  })

  it('drops elevation for a pool swim even when the source reports it', () => {
    expect(
      toWorkoutScan(workout({ activity: 'pool-swim', elevationGainMeters: 3 }))
        .elevationGainMeters,
    ).toBeUndefined()
  })
})

describe('refineActivity', () => {
  it('turns a run titled as a trail run into a trail run', () => {
    expect(refineActivity({ activity: 'run', title: 'Sunday Trail Run' })).toBe(
      'trail-run',
    )
  })

  it('does not match words that only contain "trail"', () => {
    expect(refineActivity({ activity: 'run', title: 'Trailhead loop' })).toBe('run')
  })

  it('leaves other sports alone', () => {
    expect(refineActivity({ activity: 'ride', title: 'Trail ride' })).toBe('ride')
  })
})

describe('describeHealthWorkout', () => {
  it('uses the session title with date, distance and time', () => {
    expect(describeHealthWorkout(workout({ title: 'Morning Run' }))).toEqual({
      title: 'Morning Run',
      detail: '21.11.2026 · 10.02 km · 49:05',
    })
  })

  it('falls back to the sport name and skips a missing distance', () => {
    expect(
      describeHealthWorkout(
        workout({ title: '  ', activity: 'row', distanceMeters: undefined }),
      ),
    ).toEqual({ title: 'Row', detail: '21.11.2026 · 49:05' })
  })
})

describe('lookbackStart', () => {
  it('goes back 30 calendar days', () => {
    expect(lookbackStart(new Date(2026, 10, 22, 10, 0))).toEqual(
      new Date(2026, 9, 23, 10, 0),
    )
  })
})
