export const ADVENT_COUNTS = ['day', 'countdown'] as const

export type AdventCount = (typeof ADVENT_COUNTS)[number]

export type AdventDoor = { top: string; number: string; bottom: string }

const CHRISTMAS = { monthIndex: 11, day: 25 } as const
const ADVENT_LAST_DAY = 24
const DAY_MS = 86_400_000
const DATE_LOCALE = 'en-GB'
const MONTH_NAME = new Intl.DateTimeFormat(DATE_LOCALE, { month: 'long' })
const WEEKDAY_NAME = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: 'long' })

export function adventDay(date: Date) {
  const isAdvent =
    date.getMonth() === CHRISTMAS.monthIndex && date.getDate() <= ADVENT_LAST_DAY
  return isAdvent ? date.getDate() : null
}

function christmasOf(year: number) {
  return new Date(year, CHRISTMAS.monthIndex, CHRISTMAS.day)
}

export function daysToChristmas(date: Date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const thisChristmas = christmasOf(day.getFullYear())
  const christmas =
    day > thisChristmas ? christmasOf(day.getFullYear() + 1) : thisChristmas
  return Math.round((christmas.getTime() - day.getTime()) / DAY_MS)
}

export function adventDoor({
  count,
  date,
}: {
  count: AdventCount
  date: Date
}): AdventDoor {
  const day = date.getDate()
  const month = MONTH_NAME.format(date)
  const isChristmas = date.getMonth() === CHRISTMAS.monthIndex && day === CHRISTMAS.day
  if (isChristmas) return { top: 'Christmas', number: String(day), bottom: month }
  if (count === 'countdown') {
    const days = daysToChristmas(date)
    return {
      top: 'Christmas in',
      number: String(days),
      bottom: days === 1 ? 'Day' : 'Days',
    }
  }
  const top = adventDay(date) === null ? WEEKDAY_NAME.format(date) : 'Advent'
  return { top, number: String(day), bottom: month }
}
