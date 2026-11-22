const MONTH_NAMES = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

const MONTH = String.raw`(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec)`
const DAY = String.raw`(\d{1,2})(?:st|nd|rd|th)?`
const YEAR = String.raw`(?:,?\s+(\d{4}))?`

const DATE_PATTERNS = {
  iso: /\b(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/,
  numeric: /\b(\d{1,2})[./](\d{1,2})[./](\d{4}|\d{2})\b/,
  monthFirst: new RegExp(String.raw`\b${MONTH}\.?\s+${DAY}\b${YEAR}`),
  dayFirst: new RegExp(String.raw`\b${DAY}\s+${MONTH}\b\.?${YEAR}`),
  today: /\btoday\b/,
  yesterday: /\byesterday\b/,
} as const

const CENTURY = 2000
const TWO_DIGIT_YEAR_LENGTH = 2
const MONTHS_PER_YEAR = 12

type CalendarParts = { year: number | null; month: number; day: number }

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function monthNumber(name: string) {
  return MONTH_NAMES.findIndex((month) => name.startsWith(month)) + 1
}

function toDate({ parts, today }: { parts: CalendarParts; today: Date }) {
  const year = parts.year ?? today.getFullYear()
  const date = new Date(year, parts.month - 1, parts.day)
  const isRealDay = date.getMonth() === parts.month - 1 && date.getDate() === parts.day
  if (!isRealDay) return null
  const isFuture = date > today
  if (!isFuture) return date
  if (parts.year !== null) return null
  return new Date(year - 1, parts.month - 1, parts.day)
}

function numericParts([, first = '', second = '', yearText = '']: RegExpExecArray) {
  const year =
    yearText.length === TWO_DIGIT_YEAR_LENGTH
      ? CENTURY + Number(yearText)
      : Number(yearText)
  const isMonthFirst = Number(second) > MONTHS_PER_YEAR
  return {
    year,
    month: Number(isMonthFirst ? first : second),
    day: Number(isMonthFirst ? second : first),
  }
}

function readParts(text: string): CalendarParts | null {
  const iso = DATE_PATTERNS.iso.exec(text)
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) }
  const numeric = DATE_PATTERNS.numeric.exec(text)
  if (numeric) return numericParts(numeric)
  const monthFirst = DATE_PATTERNS.monthFirst.exec(text)
  if (monthFirst) {
    const [, month = '', day, year] = monthFirst
    return {
      year: year ? Number(year) : null,
      month: monthNumber(month),
      day: Number(day),
    }
  }
  const dayFirst = DATE_PATTERNS.dayFirst.exec(text)
  if (dayFirst) {
    const [, day, month = '', year] = dayFirst
    return {
      year: year ? Number(year) : null,
      month: monthNumber(month),
      day: Number(day),
    }
  }
  return null
}

export function readScanDate({ text, today }: { text: string; today: Date }) {
  const lower = text.toLowerCase()
  const todayStart = startOfDay(today)
  if (DATE_PATTERNS.today.test(lower)) return todayStart
  if (DATE_PATTERNS.yesterday.test(lower)) {
    return new Date(
      todayStart.getFullYear(),
      todayStart.getMonth(),
      todayStart.getDate() - 1,
    )
  }
  const parts = readParts(lower)
  return parts ? toDate({ parts, today: todayStart }) : null
}
