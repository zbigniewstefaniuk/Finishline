import { ACTIVITIES, UNITS, type ActivityType } from './activity'
import { readScanDate } from './scan-date'

export type OcrBox = { x: number; y: number; width: number; height: number }

export type OcrLine = { text: string; box: OcrBox }

export type WorkoutScan = {
  activity?: ActivityType
  distanceMeters?: number
  durationSeconds?: number
  date?: Date
  avgHeartRate?: number
  calories?: number
  elevationGainMeters?: number
}

const METERS_PER_UNIT = {
  km: 1000,
  mi: 1609.344,
  m: 1,
  yd: 0.9144,
  ft: 0.3048,
} as const

type LengthUnit = keyof typeof METERS_PER_UNIT

type Token =
  | { kind: 'length'; meters: number; unit: LengthUnit }
  | { kind: 'clock'; seconds: number }
  | { kind: 'heart-rate' | 'energy' | 'number'; value: number }
  | { kind: 'ignored' }

type Field = 'distance' | 'time' | 'heart-rate' | 'calories' | 'elevation'

type Label = { field: Field | 'other'; rank: number }

type ReadLine = { box: OcrBox; date: Date | null; label: Label | null; tokens: Token[] }

type Span = { start: number; end: number }

type Range = { min: number; max: number }

type NumberStyle = 'decimal' | 'whole'

const NUMBER = String.raw`\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?`
const CLOCK = String.raw`\d{1,2}:\d{2}(?:[.,]\d+)?`
const NOT_INSIDE_NUMBER = String.raw`(?<![\d.,:'])`
const PACE_UNIT = String.raw`(?:km|mi|mile|100\s?m|500\s?m|100\s?yds?)\b`
const MILES = /\d\s*\/?\s*mi(?:les?)?\b/

const RANGES = {
  heartRate: { min: 30, max: 250 },
  calories: { min: 1, max: 20_000 },
  elevation: { min: 1, max: 10_000 },
} as const

const SAME_LINE_GAP = -1
const MAX_STACK_GAP_IN_LINES = 3

const ACTIVITY_KEYWORDS: [RegExp, ActivityType][] = [
  [/\bopen[ -]?water\b/, 'open-water-swim'],
  [/\b(?:pool|lap)\s+swim/, 'pool-swim'],
  [/\btrail\s+run/, 'trail-run'],
  [/\bhik(?:e|es|ing)\b/, 'hike'],
  [/\bwalk(?:s|ing)?\b/, 'walk'],
  [/\b(?:row|rows|rowing|rower|erg)\b/, 'row'],
  [/\b(?:ski|skis|skiing)\b/, 'ski'],
  [/\b(?:ride|rides|riding|cycling|bike|biking)\b/, 'ride'],
  [/\b(?:run|runs|running|jog|jogging)\b/, 'run'],
  [/\bswim(?:s|ming)?\b/, 'pool-swim'],
]

const PACE_ACTIVITIES: [RegExp, ActivityType][] = [
  [/\b(?:km\/h|kmh|kph|mph)\b/, 'ride'],
  [/\d\s*\/\s*100\s?(?:m|yds?)\b/, 'pool-swim'],
  [/\d\s*\/\s*500\s?m\b/, 'row'],
  [/\d\s*\/\s*(?:km|mi)\b/, 'run'],
]

const LABELS: [RegExp, Label][] = [
  [
    /\b(?:max|min|best|fastest|lap|laps|split|pace|speed|cadence|power|descent|loss|strokes?|swolf|steps|stride|temp|temperature|recovery|training|grade)\b/,
    { field: 'other', rank: 0 },
  ],
  [/\bdistance\b/, { field: 'distance', rank: 0 }],
  [/\bmoving time\b/, { field: 'time', rank: 0 }],
  [/\belapsed time\b/, { field: 'time', rank: 2 }],
  [/\b(?:time|duration)\b/, { field: 'time', rank: 1 }],
  [/\b(?:avg|average)\.?\s+(?:heart rate|hr)\b/, { field: 'heart-rate', rank: 0 }],
  [/\bheart rate\b/, { field: 'heart-rate', rank: 1 }],
  [/\btotal\s+(?:kilo)?calories\b/, { field: 'calories', rank: 1 }],
  [/\b(?:kilo)?calories\b|\bcal\b/, { field: 'calories', rank: 0 }],
  [
    /\b(?:elev(?:ation)?\.?\s*gain|total ascent|ascent|climb)\b/,
    { field: 'elevation', rank: 0 },
  ],
  [/\belev(?:ation)?\b/, { field: 'elevation', rank: 1 }],
]

function readNumber({ text, style }: { text: string; style: NumberStyle }) {
  const separators = text.match(/[.,]/g) ?? []
  const lastSeparator = Math.max(text.lastIndexOf('.'), text.lastIndexOf(','))
  if (lastSeparator === -1) return Number(text)
  const digits = (part: string) => part.replaceAll(/[.,]/g, '')
  const isMixed = new Set(separators).size > 1
  const isRepeated = separators.length > 1
  const isGroupedWhole =
    style === 'whole' && text.length - lastSeparator - 1 === 3 && !isMixed
  if (isRepeated && !isMixed) return Number(digits(text))
  if (isGroupedWhole) return Number(digits(text))
  return Number(
    `${digits(text.slice(0, lastSeparator))}.${text.slice(lastSeparator + 1)}`,
  )
}

function lengthUnitOf(unit: string): LengthUnit {
  if (unit.startsWith('k')) return 'km'
  if (unit.startsWith('mi')) return 'mi'
  if (unit.startsWith('y')) return 'yd'
  if (unit.startsWith('f')) return 'ft'
  return 'm'
}

function clockSeconds({
  hours = '0',
  minutes = '0',
  seconds = '0',
}: {
  hours?: string
  minutes?: string
  seconds?: string
}): Token {
  return {
    kind: 'clock',
    seconds: Math.round(
      Number(hours) * UNITS.secondsPerHour +
        Number(minutes) * UNITS.secondsPerMinute +
        readNumber({ text: seconds, style: 'decimal' }),
    ),
  }
}

type Matcher = { pattern: RegExp; read: (match: RegExpMatchArray) => Token | null }

const IGNORE = () => ({ kind: 'ignored' }) as const

const MATCHERS: Matcher[] = [
  { pattern: /\b\d{1,2}:\d{2}\s?[ap]\.?m\b\.?/g, read: () => null },
  { pattern: /\bat\s+\d{1,2}:\d{2}\b/g, read: () => null },
  {
    pattern: new RegExp(
      String.raw`(?:${CLOCK}|\d+'\s?\d{2}(?:''|")?)\s*(?:min)?\s*\/?\s*${PACE_UNIT}`,
      'g',
    ),
    read: IGNORE,
  },
  {
    pattern: new RegExp(String.raw`(?:${NUMBER})\s*(?:min)?\s*\/\s*${PACE_UNIT}`, 'g'),
    read: IGNORE,
  },
  {
    pattern: new RegExp(String.raw`(?:${NUMBER})\s*(?:km\/h|kmh|kph|mph)\b`, 'g'),
    read: IGNORE,
  },
  { pattern: new RegExp(String.raw`(?:${NUMBER})\s*%`, 'g'), read: IGNORE },
  {
    pattern: /\b(\d{2,3})\s*bpm\b/g,
    read: ([, value = '']) => ({ kind: 'heart-rate', value: Number(value) }),
  },
  {
    pattern: new RegExp(
      String.raw`${NOT_INSIDE_NUMBER}(${NUMBER})\s*(?:kcal|kilocalories|calories|cal)\b`,
      'g',
    ),
    read: ([, value = '']) => ({
      kind: 'energy',
      value: readNumber({ text: value, style: 'whole' }),
    }),
  },
  {
    pattern: /\b(\d{1,2}):([0-5]\d):([0-5]\d(?:[.,]\d+)?)\b/g,
    read: ([, hours, minutes, seconds]) => clockSeconds({ hours, minutes, seconds }),
  },
  {
    pattern:
      /\b(\d{1,2})\s*h(?:rs?)?\s*(\d{1,2})\s*m(?:in)?(?:\s*(\d{1,2})\s*s(?:ec)?)?\b/g,
    read: ([, hours, minutes, seconds]) => clockSeconds({ hours, minutes, seconds }),
  },
  {
    pattern: /\b(\d{1,3})\s*m(?:in)?\s*(\d{1,2})\s*s(?:ec)?\b/g,
    read: ([, minutes, seconds]) => clockSeconds({ minutes, seconds }),
  },
  {
    pattern: /\b(\d{1,3}):([0-5]\d(?:[.,]\d+)?)\b/g,
    read: ([, minutes, seconds]) => clockSeconds({ minutes, seconds }),
  },
  {
    pattern: /\b(\d{1,3})\s*min(?:utes)?\b/g,
    read: ([, minutes]) => clockSeconds({ minutes }),
  },
  {
    pattern: new RegExp(
      String.raw`${NOT_INSIDE_NUMBER}(${NUMBER})\s*(km|kilomet(?:er|re)s?|mi|miles?|m|met(?:er|re)s?|yds?|yards?|ft|feet)\b(?!\s*\/)`,
      'g',
    ),
    read: ([, value = '', unitText = '']) => {
      const unit = lengthUnitOf(unitText)
      const style = unit === 'km' || unit === 'mi' ? 'decimal' : 'whole'
      const meters = readNumber({ text: value, style }) * METERS_PER_UNIT[unit]
      return { kind: 'length', meters, unit }
    },
  },
  {
    pattern: new RegExp(String.raw`${NOT_INSIDE_NUMBER}(${NUMBER})(?![\d,:']|\.\d)`, 'g'),
    read: ([, value = '']) => ({
      kind: 'number',
      value: readNumber({ text: value, style: 'whole' }),
    }),
  },
]

function normalize(text: string) {
  return text
    .toLowerCase()
    .replaceAll(/[’‘′`]/g, "'")
    .replaceAll(/[”″“]/g, '"')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string) {
  let rest = normalize(text)
  const found: { index: number; token: Token }[] = []
  for (const { pattern, read } of MATCHERS) {
    for (const match of rest.matchAll(pattern)) {
      const token = read(match)
      if (token) found.push({ index: match.index, token })
    }
    rest = rest.replaceAll(pattern, (matched) => ' '.repeat(matched.length))
  }
  const tokens = found.sort((a, b) => a.index - b.index).map(({ token }) => token)
  return { tokens, rest: rest.replaceAll(/\s+/g, ' ').trim() }
}

function labelOf(text: string) {
  return LABELS.find(([pattern]) => pattern.test(text))?.[1] ?? null
}

function readLine({ line, today }: { line: OcrLine; today: Date }): ReadLine {
  const date = readScanDate({ text: line.text, today })
  if (date) return { box: line.box, date, label: null, tokens: [] }
  const { tokens, rest } = tokenize(line.text)
  return { box: line.box, date, label: labelOf(rest), tokens }
}

function fits({ field, token }: { field: Field | 'other'; token: Token }) {
  switch (field) {
    case 'other': {
      return true
    }
    case 'distance': {
      return (token.kind === 'length' && token.unit !== 'ft') || token.kind === 'number'
    }
    case 'time': {
      return token.kind === 'clock'
    }
    case 'heart-rate': {
      return token.kind === 'heart-rate' || token.kind === 'number'
    }
    case 'calories': {
      return token.kind === 'energy' || token.kind === 'number'
    }
    case 'elevation': {
      const isHeightUnit =
        token.kind === 'length' && (token.unit === 'm' || token.unit === 'ft')
      return isHeightUnit || token.kind === 'number'
    }
  }
}

function overlaps({ first, second }: { first: Span; second: Span }) {
  return Math.min(first.end, second.end) > Math.max(first.start, second.start)
}

function adjacencyGap({ label, value }: { label: OcrBox; value: OcrBox }) {
  const sharesColumn = overlaps({
    first: { start: label.x, end: label.x + label.width },
    second: { start: value.x, end: value.x + value.width },
  })
  const sharesRow = overlaps({
    first: { start: label.y, end: label.y + label.height },
    second: { start: value.y, end: value.y + value.height },
  })
  if (sharesColumn) {
    const isBelow = value.y > label.y
    const gap = isBelow
      ? value.y - (label.y + label.height)
      : label.y - (value.y + value.height)
    const isClose = gap <= MAX_STACK_GAP_IN_LINES * Math.min(label.height, value.height)
    return isClose ? Math.max(gap, 0) : null
  }
  const isRightOfLabel = value.x >= label.x + label.width
  return sharesRow && isRightOfLabel ? value.x - (label.x + label.width) : null
}

function pairLabels(lines: ReadLine[]) {
  const candidates: { label: number; value: number; gap: number }[] = []
  lines.forEach((line, labelIndex) => {
    const { label } = line
    if (!label) return
    if (line.tokens.length > 0) {
      candidates.push({ label: labelIndex, value: labelIndex, gap: SAME_LINE_GAP })
      return
    }
    lines.forEach((value, valueIndex) => {
      const isValueOnly = value.label === null && value.tokens.length > 0
      if (!isValueOnly) return
      if (!value.tokens.some((token) => fits({ field: label.field, token }))) return
      const gap = adjacencyGap({ label: line.box, value: value.box })
      if (gap !== null) candidates.push({ label: labelIndex, value: valueIndex, gap })
    })
  })

  const claimed = new Set<number>()
  const labelled: { field: Field; rank: number; token: Token }[] = []
  for (const pair of candidates.sort((a, b) => a.gap - b.gap)) {
    const isTaken = claimed.has(pair.label) || claimed.has(pair.value)
    const label = lines[pair.label]?.label
    if (isTaken || !label) continue
    claimed.add(pair.label)
    claimed.add(pair.value)
    if (label.field === 'other') continue
    const field = label.field
    const token = lines[pair.value]?.tokens.find((candidate) =>
      fits({ field, token: candidate }),
    )
    if (token) labelled.push({ field, rank: label.rank, token })
  }
  return { labelled, claimed }
}

function withoutStatusBar(lines: ReadLine[]) {
  const [first, ...rest] = lines
  const isStatusBarClock =
    first?.label === null &&
    first.tokens.length === 1 &&
    first.tokens[0]?.kind === 'clock'
  return isStatusBarClock ? rest : lines
}

function bareDistanceMeters({
  value,
  pageText,
  activity,
}: {
  value: number
  pageText: string
  activity: ActivityType | undefined
}) {
  if (activity === undefined) return undefined
  const unit = MILES.test(pageText) ? 'mi' : ACTIVITIES[activity].distanceUnit
  return value * METERS_PER_UNIT[unit]
}

function detectActivity(pageText: string) {
  const matches = ([pattern]: [RegExp, ActivityType]) => pattern.test(pageText)
  return (ACTIVITY_KEYWORDS.find(matches) ?? PACE_ACTIVITIES.find(matches))?.[1]
}

function withinRange({ value, range }: { value: number | undefined; range: Range }) {
  if (value === undefined) return undefined
  return value >= range.min && value <= range.max ? Math.round(value) : undefined
}

function numericValue(token: Token | undefined) {
  if (!token) return undefined
  switch (token.kind) {
    case 'length': {
      return token.meters
    }
    case 'clock': {
      return token.seconds
    }
    case 'ignored': {
      return undefined
    }
    case 'heart-rate':
    case 'energy':
    case 'number': {
      return token.value
    }
  }
}

export function parseWorkoutScan({
  lines,
  today,
}: {
  lines: OcrLine[]
  today: Date
}): WorkoutScan {
  const ordered = [...lines].sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
  const read = withoutStatusBar(ordered.map((line) => readLine({ line, today })))
  const { labelled, claimed } = pairLabels(read)
  const free = read.flatMap((line, index) => (claimed.has(index) ? [] : line.tokens))
  const pageText = normalize(ordered.map((line) => line.text).join(' '))
  const activity = detectActivity(pageText)
  const usesMeters = activity === undefined || ACTIVITIES[activity].distanceUnit === 'm'

  const byLabel = (field: Field) =>
    labelled.filter((entry) => entry.field === field).sort((a, b) => a.rank - b.rank)[0]
      ?.token

  const fallbackDistance =
    free.find(
      (token) => token.kind === 'length' && (token.unit === 'km' || token.unit === 'mi'),
    ) ??
    (usesMeters
      ? free.find(
          (token) =>
            token.kind === 'length' && (token.unit === 'm' || token.unit === 'yd'),
        )
      : undefined)

  const distance = byLabel('distance') ?? fallbackDistance

  return {
    activity,
    distanceMeters:
      distance?.kind === 'number'
        ? bareDistanceMeters({ value: distance.value, pageText, activity })
        : numericValue(distance),
    durationSeconds: numericValue(
      byLabel('time') ?? free.find((token) => token.kind === 'clock'),
    ),
    date: read.find((line) => line.date !== null)?.date ?? undefined,
    avgHeartRate: withinRange({
      value: numericValue(
        byLabel('heart-rate') ?? free.find((token) => token.kind === 'heart-rate'),
      ),
      range: RANGES.heartRate,
    }),
    calories: withinRange({
      value: numericValue(
        byLabel('calories') ?? free.find((token) => token.kind === 'energy'),
      ),
      range: RANGES.calories,
    }),
    elevationGainMeters: withinRange({
      value: numericValue(byLabel('elevation')),
      range: RANGES.elevation,
    }),
  }
}
