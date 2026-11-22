import type { Dispatch, HTMLAttributes } from 'react'
import { Badge } from '~/components/ui/badge'
import { FieldLegend, FieldSet } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { ACTIVITIES } from '~/domain/activity'
import { formatPace, paceStyleOf } from '~/domain/pace'
import type { Workout } from '~/domain/workout'
import { cn } from '~/lib/utils'
import { DateField } from './date-field'
import { EditorNoticeBanner } from './editor-notice'
import type {
  EditorAction,
  EditorForm,
  EditorNotice,
  FieldErrors,
  TextField,
} from './editor-state'
import { FieldRow, blurOnEnter } from './field-row'

type InputMode = HTMLAttributes<HTMLInputElement>['inputMode']

const WORKOUT_INPUT_IDS = {
  distance: 'workout-distance',
  time: 'workout-time',
  date: 'workout-date',
  heartRate: 'workout-heart-rate',
  calories: 'workout-calories',
  elevation: 'workout-elevation',
} as const

function NumberInput({
  field,
  value,
  placeholder,
  inputMode,
  isInvalid,
  dispatch,
}: {
  field: TextField
  value: string
  placeholder: string
  inputMode: InputMode
  isInvalid: boolean
  dispatch: Dispatch<EditorAction>
}) {
  return (
    <Input
      id={WORKOUT_INPUT_IDS[field]}
      aria-invalid={isInvalid}
      className="h-9 w-32 text-right text-base font-medium tabular-nums"
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      enterKeyHint="done"
      autoComplete="off"
      onChange={(event) =>
        dispatch({ type: 'set-field', field, value: event.target.value })
      }
      onKeyDown={blurOnEnter}
    />
  )
}

export function WorkoutFields({
  form,
  errors,
  workout,
  notice,
  dispatch,
}: {
  form: EditorForm
  errors: FieldErrors
  workout: Workout | null
  notice: EditorNotice | null
  dispatch: Dispatch<EditorAction>
}) {
  const distanceUnit = ACTIVITIES[form.activity].distanceUnit
  const paceStyle = paceStyleOf(form.activity)
  const pace = workout
    ? formatPace({
        activity: workout.activity,
        meters: workout.distanceMeters,
        seconds: workout.durationSeconds,
      })
    : '–'

  return (
    <FieldSet className="gap-0">
      <FieldLegend variant="label" className="mt-1 mb-0.5 text-muted-foreground">
        Workout
      </FieldLegend>
      <EditorNoticeBanner notice={notice} dispatch={dispatch} />
      <FieldRow
        label="Distance"
        htmlFor={WORKOUT_INPUT_IDS.distance}
        unit={distanceUnit}
        error={errors.distance}
        hasSeparator
      >
        <NumberInput
          field="distance"
          isInvalid={errors.distance !== undefined}
          value={form.distance}
          placeholder="0"
          inputMode={distanceUnit === 'm' ? 'numeric' : 'decimal'}
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow
        label="Time"
        htmlFor={WORKOUT_INPUT_IDS.time}
        unit=""
        error={errors.time}
        hasSeparator
      >
        <NumberInput
          field="time"
          isInvalid={errors.time !== undefined}
          value={form.time}
          placeholder="mm:ss"
          inputMode="text"
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow label="Date" htmlFor={WORKOUT_INPUT_IDS.date} hasSeparator>
        <DateField
          id={WORKOUT_INPUT_IDS.date}
          value={form.date}
          onChange={(date) => dispatch({ type: 'set-date', date })}
        />
      </FieldRow>
      <FieldRow
        label="Avg heart rate"
        htmlFor={WORKOUT_INPUT_IDS.heartRate}
        unit="bpm"
        error={errors.heartRate}
        hasSeparator
      >
        <NumberInput
          field="heartRate"
          isInvalid={errors.heartRate !== undefined}
          value={form.heartRate}
          placeholder="Optional"
          inputMode="numeric"
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow
        label="Calories"
        htmlFor={WORKOUT_INPUT_IDS.calories}
        unit="kcal"
        error={errors.calories}
        hasSeparator
      >
        <NumberInput
          field="calories"
          isInvalid={errors.calories !== undefined}
          value={form.calories}
          placeholder="Optional"
          inputMode="numeric"
          dispatch={dispatch}
        />
      </FieldRow>
      {ACTIVITIES[form.activity].tracksElevation ? (
        <FieldRow
          label="Elevation gain"
          htmlFor={WORKOUT_INPUT_IDS.elevation}
          unit="m"
          error={errors.elevation}
          hasSeparator
        >
          <NumberInput
            field="elevation"
            isInvalid={errors.elevation !== undefined}
            value={form.elevation}
            placeholder="Optional"
            inputMode="numeric"
            dispatch={dispatch}
          />
        </FieldRow>
      ) : null}
      <FieldRow label={paceStyle.label} unit={paceStyle.unit} hasSeparator={false}>
        <Badge variant="secondary">Auto</Badge>
        <span
          className={cn(
            'text-base font-medium tabular-nums',
            workout === null && 'text-muted-foreground',
          )}
        >
          {pace}
        </span>
      </FieldRow>
    </FieldSet>
  )
}
