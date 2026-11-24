import { describe, expect, it } from 'vitest'
import { buildStickerData, seasonBadge, type StickerOptions } from './sticker-data'
import type { StatKey, Workout } from './workout'

function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    activity: 'pool-swim',
    distanceMeters: 1250,
    durationSeconds: 2945,
    date: new Date(2026, 10, 22),
    ...overrides,
  }
}

function options(overrides: Partial<StickerOptions> = {}): StickerOptions {
  return {
    stats: ['time', 'pace'],
    title: '',
    showsDate: true,
    ink: 'light',
    style: 'minimal',
    season: 'off',
    adventCount: 'day',
    ...overrides,
  }
}

function labels(stats: StatKey[], overrides: Partial<Workout> = {}) {
  return buildStickerData({
    workout: workout(overrides),
    options: options({ stats }),
  }).stats.map((stat) => stat.label)
}

describe('buildStickerData', () => {
  it('builds the default pool swim sticker', () => {
    expect(buildStickerData({ workout: workout(), options: options() })).toEqual({
      activity: 'pool-swim',
      title: 'Pool swim',
      hero: { value: '1,250', unit: 'm', label: 'Distance' },
      stats: [
        { value: '49:05', unit: '', label: 'Time' },
        { value: '3:56', unit: '/100m', label: 'Pace' },
      ],
      date: '22.11.2026',
      badge: null,
      ink: 'light',
      style: 'minimal',
    })
  })

  it('orders stats by the catalogue, not by the order they were picked', () => {
    expect(labels(['pace', 'time'])).toEqual(['Time', 'Pace'])
  })

  it('skips a picked stat the workout has no value for', () => {
    expect(labels(['time', 'heart-rate'])).toEqual(['Time'])
  })

  it('caps the sticker at three secondary stats', () => {
    expect(
      labels(['time', 'pace', 'heart-rate', 'calories'], {
        avgHeartRate: 142,
        calories: 412,
      }),
    ).toEqual(['Time', 'Pace', 'Avg HR'])
  })

  it('shows speed instead of pace for a ride', () => {
    const data = buildStickerData({
      workout: workout({
        activity: 'ride',
        distanceMeters: 42_600,
        durationSeconds: 5290,
      }),
      options: options({ stats: ['pace'] }),
    })
    expect(data.stats).toEqual([{ value: '29.0', unit: 'km/h', label: 'Speed' }])
  })

  it('returns no secondary stats when none are picked', () => {
    expect(labels([])).toEqual([])
  })

  it('shows elevation gain in grouped meters', () => {
    const data = buildStickerData({
      workout: workout({
        activity: 'hike',
        distanceMeters: 18_400,
        elevationGainMeters: 1214,
      }),
      options: options({ stats: ['elevation'] }),
    })
    expect(data.stats).toEqual([{ value: '1,214', unit: 'm', label: 'Elevation' }])
  })

  it('uses a custom title instead of the activity name, trimmed', () => {
    const data = buildStickerData({
      workout: workout({ activity: 'run', distanceMeters: 42_195 }),
      options: options({ title: '  Berlin Marathon ' }),
    })
    expect(data.title).toBe('Berlin Marathon')
  })

  it('falls back to the activity name when the custom title is blank', () => {
    const data = buildStickerData({
      workout: workout({ activity: 'open-water-swim' }),
      options: options({ title: '   ' }),
    })
    expect(data.title).toBe('Open water')
  })

  it('drops the date when it is hidden and carries the ink and style through', () => {
    const data = buildStickerData({
      workout: workout(),
      options: options({ showsDate: false, ink: 'dark', style: 'strip' }),
    })
    expect(data.date).toBeNull()
    expect(data.ink).toBe('dark')
    expect(data.style).toBe('strip')
  })
})

describe('seasonBadge', () => {
  it('shows no badge when the season is off', () => {
    expect(seasonBadge({ season: 'off', date: new Date(2026, 11, 7) })).toBeNull()
  })

  it('counts the Advent day from 1 to 24 December', () => {
    expect(seasonBadge({ season: 'advent', date: new Date(2026, 11, 1) })).toBe(
      'Advent · Day 1',
    )
    expect(seasonBadge({ season: 'advent', date: new Date(2026, 11, 24) })).toBe(
      'Advent · Day 24',
    )
  })

  it('drops the day outside Advent', () => {
    expect(seasonBadge({ season: 'advent', date: new Date(2026, 11, 25) })).toBe('Advent')
    expect(seasonBadge({ season: 'advent', date: new Date(2026, 10, 30) })).toBe('Advent')
  })

  it('puts the badge on the sticker from the workout date, even with the date hidden', () => {
    const data = buildStickerData({
      workout: workout({ date: new Date(2026, 11, 7) }),
      options: options({ season: 'advent', showsDate: false }),
    })
    expect(data.badge).toBe('Advent · Day 7')
  })
})
