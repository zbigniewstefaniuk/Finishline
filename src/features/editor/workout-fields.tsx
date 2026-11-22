import type { Dispatch, HTMLAttributes } from 'react'
import { ACTIVITIES } from '~/domain/activity'
import { formatPace, paceStyleOf } from '~/domain/pace'
import type { Workout } from '~/domain/workout'
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

function NumberInput({
  field,
  label,
  value,
  placeholder,
  inputMode,
  dispatch,
}: {
  field: TextField
  label: string
  value: string
  placeholder: string
  inputMode: InputMode
  dispatch: Dispatch<EditorAction>
}) {
  return (
    <input
      aria-label={label}
      className="field-input"
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
    <div>
      <h2 className="section-heading">Workout</h2>
      <EditorNoticeBanner notice={notice} dispatch={dispatch} />
      <FieldRow label="Distance" unit={distanceUnit} error={errors.distance} hasSeparator>
        <NumberInput
          field="distance"
          label="Distance"
          value={form.distance}
          placeholder="0"
          inputMode={distanceUnit === 'm' ? 'numeric' : 'decimal'}
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow label="Time" unit="" error={errors.time} hasSeparator>
        <NumberInput
          field="time"
          label="Time"
          value={form.time}
          placeholder="mm:ss"
          inputMode="text"
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow label="Date" hasSeparator>
        <DateField
          value={form.date}
          onChange={(date) => dispatch({ type: 'set-date', date })}
        />
      </FieldRow>
      <FieldRow label="Avg heart rate" unit="bpm" error={errors.heartRate} hasSeparator>
        <NumberInput
          field="heartRate"
          label="Average heart rate"
          value={form.heartRate}
          placeholder="Optional"
          inputMode="numeric"
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow label="Calories" unit="kcal" error={errors.calories} hasSeparator>
        <NumberInput
          field="calories"
          label="Calories"
          value={form.calories}
          placeholder="Optional"
          inputMode="numeric"
          dispatch={dispatch}
        />
      </FieldRow>
      {ACTIVITIES[form.activity].tracksElevation ? (
        <FieldRow label="Elevation gain" unit="m" error={errors.elevation} hasSeparator>
          <NumberInput
            field="elevation"
            label="Elevation gain"
            value={form.elevation}
            placeholder="Optional"
            inputMode="numeric"
            dispatch={dispatch}
          />
        </FieldRow>
      ) : null}
      <FieldRow label={paceStyle.label} unit={paceStyle.unit} hasSeparator={false}>
        <span className="badge">Auto</span>
        <span className="computed" data-empty={workout === null || undefined}>
          {pace}
        </span>
      </FieldRow>
    </div>
  )
}
