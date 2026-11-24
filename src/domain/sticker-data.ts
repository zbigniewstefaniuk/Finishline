import { ACTIVITIES, type ActivityType } from './activity'
import { formatClock, formatDate, formatDistance, formatGrouped } from './format'
import { formatPace, paceStyleOf } from './pace'
import { MAX_SECONDARY_STATS, STAT_KEYS, type StatKey, type Workout } from './workout'

export const STICKER_INKS = ['light', 'dark'] as const

export type StickerInk = (typeof STICKER_INKS)[number]

export const STICKER_STYLES = [
  'minimal',
  'strip',
  'editorial',
  'grid',
  'stack',
  'caption',
  'bib',
] as const

export type StickerStyle = (typeof STICKER_STYLES)[number]

export const STICKER_SEASONS = ['off', 'advent'] as const

export type StickerSeason = (typeof STICKER_SEASONS)[number]

const ADVENT = { monthIndex: 11, lastDay: 24 } as const

export const STICKER_TITLE_MAX_LENGTH = 24

export type StickerOptions = {
  stats: StatKey[]
  title: string
  showsDate: boolean
  ink: StickerInk
  style: StickerStyle
  season: StickerSeason
}

export type StickerStat = {
  value: string
  unit: string
  label: string
}

export type StickerData = {
  activity: ActivityType
  title: string
  hero: StickerStat
  stats: StickerStat[]
  date: string | null
  badge: string | null
  ink: StickerInk
  style: StickerStyle
}

export function seasonBadge({ season, date }: { season: StickerSeason; date: Date }) {
  if (season === 'off') return null
  const day = date.getDate()
  const isAdventDay = date.getMonth() === ADVENT.monthIndex && day <= ADVENT.lastDay
  return isAdventDay ? `Advent · Day ${day}` : 'Advent'
}

export function statLabel({ stat, activity }: { stat: StatKey; activity: ActivityType }) {
  switch (stat) {
    case 'time': {
      return 'Time'
    }
    case 'pace': {
      return paceStyleOf(activity).label
    }
    case 'heart-rate': {
      return 'Avg HR'
    }
    case 'calories': {
      return 'Calories'
    }
    case 'elevation': {
      return 'Elevation'
    }
  }
}

export function describeStat({
  stat,
  workout,
}: {
  stat: StatKey
  workout: Workout
}): StickerStat | null {
  const label = statLabel({ stat, activity: workout.activity })
  switch (stat) {
    case 'time': {
      return { value: formatClock(workout.durationSeconds), unit: '', label }
    }
    case 'pace': {
      const value = formatPace({
        activity: workout.activity,
        meters: workout.distanceMeters,
        seconds: workout.durationSeconds,
      })
      return { value, unit: paceStyleOf(workout.activity).unit, label }
    }
    case 'heart-rate': {
      if (workout.avgHeartRate === undefined) return null
      return { value: formatGrouped(workout.avgHeartRate), unit: 'bpm', label }
    }
    case 'calories': {
      if (workout.calories === undefined) return null
      return { value: formatGrouped(workout.calories), unit: 'kcal', label }
    }
    case 'elevation': {
      if (workout.elevationGainMeters === undefined) return null
      return { value: formatGrouped(workout.elevationGainMeters), unit: 'm', label }
    }
  }
}

export function buildStickerData({
  workout,
  options,
}: {
  workout: Workout
  options: StickerOptions
}): StickerData {
  const distance = formatDistance({
    meters: workout.distanceMeters,
    activity: workout.activity,
  })
  return {
    activity: workout.activity,
    title: options.title.trim() || ACTIVITIES[workout.activity].label,
    hero: { value: distance.value, unit: distance.unit, label: 'Distance' },
    stats: STAT_KEYS.filter((stat) => options.stats.includes(stat))
      .map((stat) => describeStat({ stat, workout }))
      .filter((stat) => stat !== null)
      .slice(0, MAX_SECONDARY_STATS),
    date: options.showsDate ? formatDate(workout.date) : null,
    badge: seasonBadge({ season: options.season, date: workout.date }),
    ink: options.ink,
    style: options.style,
  }
}
