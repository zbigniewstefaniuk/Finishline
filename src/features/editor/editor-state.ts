import { ACTIVITIES, type ActivityType } from '~/domain/activity'
import { ADVENT_COUNTS, adventDoor, type AdventCount } from '~/domain/advent'
import { formatClock, formatDistanceInput } from '~/domain/format'
import { parseDistanceMeters, parseDuration, parseWholeNumber } from '~/domain/parse'
import {
  STICKER_STYLES,
  buildStickerData,
  type StickerInk,
  type StickerOptions,
  type StickerSeason,
  type StickerSource,
  type StickerStyle,
} from '~/domain/sticker-data'
import {
  MAX_SECONDARY_STATS,
  statsFor,
  type StatKey,
  type Workout,
} from '~/domain/workout'
import type { WorkoutScan } from '~/domain/workout-scan'
import type { SwipeGesture } from './preview-gestures'

export const PREVIEW_BACKGROUNDS = ['dark', 'light'] as const

export type PreviewBackground = (typeof PREVIEW_BACKGROUNDS)[number]

export const EDITOR_MODES = ['workout', 'advent'] as const

export type EditorMode = (typeof EDITOR_MODES)[number]

export type TextField = 'distance' | 'time' | 'heartRate' | 'calories' | 'elevation'

export type EditorForm = {
  activity: ActivityType
  distance: string
  time: string
  heartRate: string
  calories: string
  elevation: string
  date: Date
}

export type FilledField = 'activity' | 'date' | TextField

type Snapshot = {
  form: EditorForm
  sticker: StickerOptions
  lastWorkout: Workout | null
}

export type EditorNotice =
  | { kind: 'filled'; fields: FilledField[]; previous: Snapshot }
  | { kind: 'nothing-found' }
  | { kind: 'started-new'; previous: Snapshot }

export type EditorState = {
  mode: EditorMode
  form: EditorForm
  sticker: StickerOptions
  background: PreviewBackground
  lastWorkout: Workout | null
  notice: EditorNotice | null
}

export type EditorAction =
  | { type: 'set-activity'; activity: ActivityType }
  | { type: 'set-field'; field: TextField; value: string }
  | { type: 'set-date'; date: Date }
  | { type: 'toggle-stat'; stat: StatKey }
  | { type: 'toggle-date' }
  | { type: 'set-title'; title: string }
  | { type: 'set-ink'; ink: StickerInk }
  | { type: 'set-style'; style: StickerStyle }
  | { type: 'set-season'; season: StickerSeason }
  | { type: 'set-advent-count'; count: AdventCount }
  | { type: 'swipe-preview'; gesture: SwipeGesture }
  | { type: 'select-preview-page'; index: number }
  | { type: 'set-mode'; mode: EditorMode }
  | { type: 'set-background'; background: PreviewBackground }
  | { type: 'apply-scan'; scan: WorkoutScan }
  | { type: 'start-new'; today: Date }
  | { type: 'undo' }
  | { type: 'dismiss-notice' }

type EditAction = Exclude<
  EditorAction,
  {
    type:
      | 'set-mode'
      | 'set-background'
      | 'apply-scan'
      | 'start-new'
      | 'undo'
      | 'dismiss-notice'
  }
>

export type FieldErrors = Partial<Record<TextField, string>>

const FIELD_ERRORS = {
  distance: 'Enter a number, like 1250 or 10.02',
  time: 'Use mm:ss or h:mm:ss',
  heartRate: 'Enter whole beats per minute, like 142',
  calories: 'Enter whole calories, like 412',
  elevation: 'Enter whole meters, like 512',
} as const satisfies Record<TextField, string>

const DEFAULT_STICKER: StickerOptions = {
  stats: ['time', 'pace'],
  title: '',
  showsDate: true,
  ink: 'light',
  style: 'minimal',
  season: 'off',
  adventCount: 'day',
}

const FILL_ORDER: FilledField[] = [
  'activity',
  'distance',
  'time',
  'date',
  'heartRate',
  'calories',
  'elevation',
]

function errorWhenInvalid({
  text,
  value,
  field,
}: {
  text: string
  value: number | null
  field: TextField
}) {
  const isInvalid = text.trim() !== '' && value === null
  return isInvalid ? FIELD_ERRORS[field] : undefined
}

export function readForm(form: EditorForm) {
  const distanceMeters = parseDistanceMeters({
    text: form.distance,
    activity: form.activity,
  })
  const durationSeconds = parseDuration(form.time)
  const avgHeartRate = parseWholeNumber(form.heartRate)
  const calories = parseWholeNumber(form.calories)
  const elevationText = ACTIVITIES[form.activity].tracksElevation ? form.elevation : ''
  const elevationGainMeters = parseWholeNumber(elevationText)
  const errors: FieldErrors = {
    distance: errorWhenInvalid({
      text: form.distance,
      value: distanceMeters,
      field: 'distance',
    }),
    time: errorWhenInvalid({ text: form.time, value: durationSeconds, field: 'time' }),
    heartRate: errorWhenInvalid({
      text: form.heartRate,
      value: avgHeartRate,
      field: 'heartRate',
    }),
    calories: errorWhenInvalid({
      text: form.calories,
      value: calories,
      field: 'calories',
    }),
    elevation: errorWhenInvalid({
      text: elevationText,
      value: elevationGainMeters,
      field: 'elevation',
    }),
  }
  const hasOptionalErrors =
    errors.heartRate !== undefined ||
    errors.calories !== undefined ||
    errors.elevation !== undefined
  const isIncomplete =
    distanceMeters === null || durationSeconds === null || hasOptionalErrors
  const workout: Workout | null = isIncomplete
    ? null
    : {
        activity: form.activity,
        distanceMeters,
        durationSeconds,
        date: form.date,
        avgHeartRate: avgHeartRate ?? undefined,
        calories: calories ?? undefined,
        elevationGainMeters: elevationGainMeters ?? undefined,
      }
  return { workout, errors }
}

function blankForm(today: Date): EditorForm {
  return {
    activity: 'pool-swim',
    distance: '',
    time: '',
    heartRate: '',
    calories: '',
    elevation: '',
    date: today,
  }
}

export function createEditorState(today = new Date()): EditorState {
  const form: EditorForm = { ...blankForm(today), distance: '1250', time: '49:05' }
  return {
    mode: 'workout',
    form,
    sticker: DEFAULT_STICKER,
    background: 'dark',
    lastWorkout: readForm(form).workout,
    notice: null,
  }
}

export function stickerSourceOf({
  mode,
  form,
  sticker,
  lastWorkout,
}: EditorState): StickerSource | null {
  if (mode === 'advent') {
    const { adventCount: count, ink } = sticker
    return {
      kind: 'advent',
      data: { count, ink, door: adventDoor({ count, date: form.date }) },
    }
  }
  if (!lastWorkout) return null
  return {
    kind: 'workout',
    data: buildStickerData({ workout: lastWorkout, options: sticker }),
  }
}

function previewPageIndex({ mode, sticker }: EditorState) {
  if (mode === 'advent') return ADVENT_COUNTS.indexOf(sticker.adventCount)
  return STICKER_STYLES.indexOf(sticker.style)
}

function selectPreviewPage({
  state,
  index,
}: {
  state: EditorState
  index: number
}): StickerOptions {
  const { sticker } = state
  if (state.mode === 'advent') {
    return { ...sticker, adventCount: ADVENT_COUNTS[index] ?? sticker.adventCount }
  }
  return { ...sticker, style: STICKER_STYLES[index] ?? sticker.style }
}

function snapshotOf({ form, sticker, lastWorkout }: EditorState): Snapshot {
  return { form, sticker, lastWorkout }
}

function withForm({
  state,
  form,
}: {
  state: EditorState
  form: EditorForm
}): EditorState {
  return { ...state, form, lastWorkout: readForm(form).workout ?? state.lastWorkout }
}

function switchActivity({
  form,
  activity,
}: {
  form: EditorForm
  activity: ActivityType
}) {
  const meters = parseDistanceMeters({ text: form.distance, activity: form.activity })
  const distance =
    meters === null ? form.distance : formatDistanceInput({ meters, activity })
  return { ...form, activity, distance }
}

function changeActivity({
  state,
  activity,
}: {
  state: EditorState
  activity: ActivityType
}) {
  const available = statsFor(activity)
  return {
    form: switchActivity({ form: state.form, activity }),
    sticker: {
      ...state.sticker,
      stats: state.sticker.stats.filter((stat) => available.includes(stat)),
    },
  }
}

function toggleStat({ stats, stat }: { stats: StatKey[]; stat: StatKey }) {
  if (stats.includes(stat)) return stats.filter((picked) => picked !== stat)
  if (stats.length >= MAX_SECONDARY_STATS) return stats
  return [...stats, stat]
}

function scannedValues({
  scan,
  activity,
}: {
  scan: WorkoutScan
  activity: ActivityType
}) {
  const values: Partial<EditorForm> = {}
  if (scan.distanceMeters !== undefined) {
    values.distance = formatDistanceInput({ meters: scan.distanceMeters, activity })
  }
  if (scan.durationSeconds !== undefined) values.time = formatClock(scan.durationSeconds)
  if (scan.date) values.date = scan.date
  if (scan.avgHeartRate !== undefined) values.heartRate = String(scan.avgHeartRate)
  if (scan.calories !== undefined) values.calories = String(scan.calories)
  const hasElevation =
    scan.elevationGainMeters !== undefined && ACTIVITIES[activity].tracksElevation
  if (hasElevation) values.elevation = String(scan.elevationGainMeters)
  return values
}

function applyScan({ state, scan }: { state: EditorState; scan: WorkoutScan }) {
  const activity = scan.activity ?? state.form.activity
  const values = scannedValues({ scan, activity })
  const fields = FILL_ORDER.filter((field) =>
    field === 'activity' ? scan.activity !== undefined : values[field] !== undefined,
  )
  if (fields.length === 0) {
    return { ...state, notice: { kind: 'nothing-found' } } satisfies EditorState
  }
  const switched = changeActivity({ state, activity })
  return {
    ...withForm({
      state: { ...state, sticker: switched.sticker },
      form: { ...switched.form, ...values },
    }),
    mode: 'workout',
    notice: { kind: 'filled', fields, previous: snapshotOf(state) },
  } satisfies EditorState
}

function startNew({ state, today }: { state: EditorState; today: Date }): EditorState {
  return {
    mode: state.mode,
    form: blankForm(today),
    sticker: DEFAULT_STICKER,
    background: state.background,
    lastWorkout: null,
    notice: { kind: 'started-new', previous: snapshotOf(state) },
  }
}

function undo(state: EditorState): EditorState {
  const { notice } = state
  const isUndoable = notice?.kind === 'filled' || notice?.kind === 'started-new'
  if (!isUndoable) return state
  return { ...state, ...notice.previous, notice: null }
}

function edit({
  state,
  action,
}: {
  state: EditorState
  action: EditAction
}): EditorState {
  switch (action.type) {
    case 'set-activity': {
      const { form, sticker } = changeActivity({ state, activity: action.activity })
      return withForm({ state: { ...state, sticker }, form })
    }
    case 'set-field': {
      return withForm({ state, form: { ...state.form, [action.field]: action.value } })
    }
    case 'set-date': {
      return withForm({ state, form: { ...state.form, date: action.date } })
    }
    case 'toggle-stat': {
      const stats = toggleStat({ stats: state.sticker.stats, stat: action.stat })
      return { ...state, sticker: { ...state.sticker, stats } }
    }
    case 'toggle-date': {
      return {
        ...state,
        sticker: { ...state.sticker, showsDate: !state.sticker.showsDate },
      }
    }
    case 'set-title': {
      return { ...state, sticker: { ...state.sticker, title: action.title } }
    }
    case 'set-ink': {
      return { ...state, sticker: { ...state.sticker, ink: action.ink } }
    }
    case 'set-style': {
      return { ...state, sticker: { ...state.sticker, style: action.style } }
    }
    case 'set-season': {
      return { ...state, sticker: { ...state.sticker, season: action.season } }
    }
    case 'set-advent-count': {
      return { ...state, sticker: { ...state.sticker, adventCount: action.count } }
    }
    case 'swipe-preview': {
      const step = action.gesture === 'swipe-left' ? 1 : -1
      const index = previewPageIndex(state) + step
      return { ...state, sticker: selectPreviewPage({ state, index }) }
    }
    case 'select-preview-page': {
      return { ...state, sticker: selectPreviewPage({ state, index: action.index }) }
    }
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'set-mode': {
      return { ...state, mode: action.mode }
    }
    case 'set-background': {
      return { ...state, background: action.background }
    }
    case 'apply-scan': {
      return applyScan({ state, scan: action.scan })
    }
    case 'start-new': {
      return startNew({ state, today: action.today })
    }
    case 'undo': {
      return undo(state)
    }
    case 'dismiss-notice': {
      return { ...state, notice: null }
    }
    case 'set-activity':
    case 'set-field':
    case 'set-date':
    case 'toggle-stat':
    case 'toggle-date':
    case 'set-title':
    case 'set-ink':
    case 'set-style':
    case 'set-season':
    case 'set-advent-count':
    case 'swipe-preview':
    case 'select-preview-page': {
      return { ...edit({ state, action }), notice: null }
    }
  }
}
