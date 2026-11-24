import { describe, expect, it } from 'vitest'
import {
  createEditorState,
  editorReducer,
  readForm,
  stickerSourceOf,
  type EditorAction,
  type EditorState,
} from './editor-state'

const TODAY = new Date(2026, 10, 22)

function apply(...actions: EditorAction[]): EditorState {
  return actions.reduce(editorReducer, createEditorState(TODAY))
}

describe('editorReducer', () => {
  it('starts from the spec sample: 1,250 m pool swim in 49:05 with time and pace', () => {
    const state = createEditorState(TODAY)
    expect(state.lastWorkout).toEqual({
      activity: 'pool-swim',
      distanceMeters: 1250,
      durationSeconds: 2945,
      date: TODAY,
      avgHeartRate: undefined,
      calories: undefined,
    })
    expect(state.sticker.stats).toEqual(['time', 'pace'])
  })

  it('converts the distance into the new unit when switching from meters to km', () => {
    expect(apply({ type: 'set-activity', activity: 'run' }).form.distance).toBe('1.25')
  })

  it('converts kilometers back into whole meters for a pool swim', () => {
    const state = apply(
      { type: 'set-activity', activity: 'run' },
      { type: 'set-field', field: 'distance', value: '10.02' },
      { type: 'set-activity', activity: 'pool-swim' },
    )
    expect(state.form.distance).toBe('10020')
  })

  it('keeps unparseable distance text as typed when switching activity', () => {
    const state = apply(
      { type: 'set-field', field: 'distance', value: '12,5,0' },
      { type: 'set-activity', activity: 'ride' },
    )
    expect(state.form.distance).toBe('12,5,0')
  })

  it('keeps the last valid workout while a field is mid-edit', () => {
    const before = createEditorState(TODAY)
    const state = editorReducer(before, {
      type: 'set-field',
      field: 'time',
      value: '49:',
    })
    expect(state.lastWorkout).toBe(before.lastWorkout)
  })

  it('refuses a fourth stat', () => {
    const state = apply(
      { type: 'toggle-stat', stat: 'heart-rate' },
      { type: 'toggle-stat', stat: 'calories' },
    )
    expect(state.sticker.stats).toEqual(['time', 'pace', 'heart-rate'])
  })

  it('removes a picked stat on a second toggle', () => {
    expect(apply({ type: 'toggle-stat', stat: 'time' }).sticker.stats).toEqual(['pace'])
  })

  it('drops a picked elevation stat when switching to a sport without elevation', () => {
    const state = apply(
      { type: 'set-activity', activity: 'hike' },
      { type: 'toggle-stat', stat: 'elevation' },
      { type: 'set-activity', activity: 'open-water-swim' },
    )
    expect(state.sticker.stats).toEqual(['time', 'pace'])
  })

  it('updates the sticker title, date visibility, ink, style and season', () => {
    const state = apply(
      { type: 'set-title', title: 'Lake Zurich' },
      { type: 'toggle-date' },
      { type: 'set-ink', ink: 'dark' },
      { type: 'set-style', style: 'editorial' },
      { type: 'set-season', season: 'advent' },
    )
    expect(state.sticker).toEqual({
      stats: ['time', 'pace'],
      title: 'Lake Zurich',
      showsDate: false,
      ink: 'dark',
      style: 'editorial',
      season: 'advent',
      adventCount: 'day',
    })
  })
})

describe('screenshot scan', () => {
  const scannedRun = {
    activity: 'trail-run',
    distanceMeters: 12_410,
    durationSeconds: 4722,
    date: new Date(2026, 10, 21),
    avgHeartRate: 152,
    elevationGainMeters: 845,
  } as const

  it('fills the found fields in the scanned sport and names them in order', () => {
    const state = apply({ type: 'apply-scan', scan: scannedRun })
    expect(state.form).toEqual({
      activity: 'trail-run',
      distance: '12.41',
      time: '1:18:42',
      heartRate: '152',
      calories: '',
      elevation: '845',
      date: new Date(2026, 10, 21),
    })
    expect(state.notice).toMatchObject({
      kind: 'filled',
      fields: ['activity', 'distance', 'time', 'date', 'heartRate', 'elevation'],
    })
    expect(state.lastWorkout?.elevationGainMeters).toBe(845)
  })

  it('keeps the current sport and converts nothing it did not find', () => {
    const state = apply({ type: 'apply-scan', scan: { durationSeconds: 2700 } })
    expect(state.form.activity).toBe('pool-swim')
    expect(state.form.distance).toBe('1250')
    expect(state.form.time).toBe('45:00')
  })

  it('skips a scanned elevation for a sport without elevation', () => {
    const state = apply({
      type: 'apply-scan',
      scan: { activity: 'open-water-swim', distanceMeters: 1850, elevationGainMeters: 4 },
    })
    expect(state.form.elevation).toBe('')
    expect(state.notice).toMatchObject({ fields: ['activity', 'distance'] })
  })

  it('reports a screenshot with nothing usable and leaves the form alone', () => {
    const before = createEditorState(TODAY)
    const state = editorReducer(before, { type: 'apply-scan', scan: {} })
    expect(state.form).toBe(before.form)
    expect(state.notice).toEqual({ kind: 'nothing-found' })
  })

  it('undoes the fill, restoring the form and any stat the sport switch dropped', () => {
    const before = apply(
      { type: 'set-activity', activity: 'hike' },
      { type: 'set-field', field: 'elevation', value: '300' },
      { type: 'toggle-stat', stat: 'elevation' },
    )
    const filled = editorReducer(before, {
      type: 'apply-scan',
      scan: { activity: 'row', distanceMeters: 5000 },
    })
    expect(filled.sticker.stats).toEqual(['time', 'pace'])
    const undone = editorReducer(filled, { type: 'undo' })
    expect(undone.form).toEqual(before.form)
    expect(undone.sticker).toEqual(before.sticker)
    expect(undone.notice).toBeNull()
  })

  it('drops the undo once anything else is edited, but not for a preview change', () => {
    const filled = apply({ type: 'apply-scan', scan: scannedRun })
    const previewed = editorReducer(filled, {
      type: 'set-background',
      background: 'light',
    })
    expect(previewed.notice).toBe(filled.notice)
    const edited = editorReducer(previewed, {
      type: 'set-field',
      field: 'calories',
      value: '9',
    })
    expect(edited.notice).toBeNull()
    expect(editorReducer(edited, { type: 'undo' })).toBe(edited)
  })

  it('dismisses the notice without touching the form', () => {
    const filled = apply({ type: 'apply-scan', scan: scannedRun })
    const dismissed = editorReducer(filled, { type: 'dismiss-notice' })
    expect(dismissed.notice).toBeNull()
    expect(dismissed.form).toBe(filled.form)
  })
})

describe('start new', () => {
  const NEXT_DAY = new Date(2026, 10, 23)

  it('resets the workout and sticker to empty defaults but keeps the preview background', () => {
    const before = apply(
      { type: 'set-activity', activity: 'hike' },
      { type: 'set-field', field: 'elevation', value: '300' },
      { type: 'set-title', title: 'Uetliberg' },
      { type: 'set-ink', ink: 'dark' },
      { type: 'set-style', style: 'strip' },
      { type: 'set-season', season: 'advent' },
      { type: 'set-background', background: 'light' },
    )
    const state = editorReducer(before, { type: 'start-new', today: NEXT_DAY })
    expect(state.form).toEqual({
      activity: 'pool-swim',
      distance: '',
      time: '',
      heartRate: '',
      calories: '',
      elevation: '',
      date: NEXT_DAY,
    })
    expect(state.sticker).toEqual({
      stats: ['time', 'pace'],
      title: '',
      showsDate: true,
      ink: 'light',
      style: 'minimal',
      season: 'off',
      adventCount: 'day',
    })
    expect(state.background).toBe('light')
    expect(state.lastWorkout).toBeNull()
    expect(state.notice).toMatchObject({ kind: 'started-new' })
  })

  it('undoes a new sticker back to the exact previous one', () => {
    const before = apply(
      { type: 'set-activity', activity: 'run' },
      { type: 'set-title', title: 'Parkrun' },
    )
    const fresh = editorReducer(before, { type: 'start-new', today: NEXT_DAY })
    const undone = editorReducer(fresh, { type: 'undo' })
    expect(undone.form).toBe(before.form)
    expect(undone.sticker).toBe(before.sticker)
    expect(undone.lastWorkout).toBe(before.lastWorkout)
    expect(undone.notice).toBeNull()
  })

  it('offers no undo once the new sticker is edited', () => {
    const fresh = apply({ type: 'start-new', today: NEXT_DAY })
    const edited = editorReducer(fresh, {
      type: 'set-field',
      field: 'distance',
      value: '800',
    })
    expect(edited.notice).toBeNull()
    expect(editorReducer(edited, { type: 'undo' })).toBe(edited)
  })
})

describe('readForm', () => {
  const form = createEditorState(TODAY).form

  it('treats empty optional fields as absent, not invalid', () => {
    expect(readForm(form).errors).toEqual({
      distance: undefined,
      time: undefined,
      heartRate: undefined,
      calories: undefined,
    })
  })

  it('blocks the workout and explains an invalid heart rate', () => {
    const result = readForm({ ...form, heartRate: '142.5' })
    expect(result.workout).toBeNull()
    expect(result.errors.heartRate).toBeDefined()
  })

  it('reads elevation gain for a hike and explains an invalid one', () => {
    const hike = { ...form, activity: 'hike' as const, distance: '18.4' }
    expect(readForm({ ...hike, elevation: '1214' }).workout?.elevationGainMeters).toBe(
      1214,
    )
    expect(readForm({ ...hike, elevation: '12.5' }).errors.elevation).toBeDefined()
  })

  it('ignores leftover elevation text on a sport without elevation', () => {
    const result = readForm({ ...form, elevation: 'oops' })
    expect(result.errors.elevation).toBeUndefined()
    expect(result.workout?.elevationGainMeters).toBeUndefined()
  })

  it('reports no error for an empty required field but still has no workout', () => {
    const result = readForm({ ...form, distance: '' })
    expect(result.workout).toBeNull()
    expect(result.errors.distance).toBeUndefined()
  })
})

describe('advent mode', () => {
  const SEVENTH = new Date(2026, 11, 7)

  it('turns the date into an Advent door with the picked count and ink', () => {
    const state = apply(
      { type: 'set-mode', mode: 'advent' },
      { type: 'set-date', date: SEVENTH },
      { type: 'set-ink', ink: 'dark' },
      { type: 'set-advent-count', count: 'countdown' },
    )
    expect(stickerSourceOf(state)).toEqual({
      kind: 'advent',
      data: {
        count: 'countdown',
        ink: 'dark',
        door: { top: 'Christmas in', number: '18', bottom: 'Days' },
      },
    })
  })

  it('needs no workout to show a sticker', () => {
    const state = apply(
      { type: 'set-field', field: 'distance', value: '' },
      { type: 'set-mode', mode: 'advent' },
    )
    expect(stickerSourceOf(state)?.kind).toBe('advent')
  })

  it('swipes between the counts in Advent and between the styles for a workout', () => {
    const advent = apply(
      { type: 'set-mode', mode: 'advent' },
      { type: 'swipe-preview', gesture: 'swipe-left' },
      { type: 'swipe-preview', gesture: 'swipe-left' },
    )
    expect(advent.sticker.adventCount).toBe('countdown')
    expect(advent.sticker.style).toBe('minimal')

    const workout = apply(
      { type: 'swipe-preview', gesture: 'swipe-right' },
      { type: 'swipe-preview', gesture: 'swipe-left' },
    )
    expect(workout.sticker.style).toBe('strip')
  })

  it('picks a page from the preview dots in the current mode', () => {
    const advent = apply(
      { type: 'set-mode', mode: 'advent' },
      { type: 'select-preview-page', index: 1 },
    )
    expect(advent.sticker.adventCount).toBe('countdown')
    expect(advent.sticker.style).toBe('minimal')

    const workout = apply({ type: 'select-preview-page', index: 2 })
    expect(workout.sticker.style).toBe('editorial')
  })

  it('keeps the mode on New and goes back to the workout after a screenshot', () => {
    const advent = apply({ type: 'set-mode', mode: 'advent' })
    const started = editorReducer(advent, { type: 'start-new', today: SEVENTH })
    expect(started.mode).toBe('advent')

    const scanned = editorReducer(advent, {
      type: 'apply-scan',
      scan: { activity: 'run', distanceMeters: 5000, durationSeconds: 1500 },
    })
    expect(scanned.mode).toBe('workout')
  })
})
