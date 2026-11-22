import type { Dispatch } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native'
import { ACTIVITIES } from '~/domain/activity'
import { formatPace, paceStyleOf } from '~/domain/pace'
import type { Workout } from '~/domain/workout'
import { RADIUS } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'
import { DateField } from './date-field'
import type {
  EditorAction,
  EditorForm,
  EditorNotice,
  FieldErrors,
  TextField,
} from './editor-state'
import { FieldRow } from './field-row'
import { EditorNoticeBanner } from './editor-notice'

const INPUT_WIDTH = 120

const TIME_KEYBOARD: KeyboardTypeOptions =
  Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'

function NumberInput({
  field,
  label,
  value,
  placeholder,
  keyboardType,
  dispatch,
}: {
  field: TextField
  label: string
  value: string
  placeholder?: string
  keyboardType: KeyboardTypeOptions
  dispatch: Dispatch<EditorAction>
}) {
  const theme = useTheme()
  return (
    <TextInput
      accessibilityLabel={label}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={theme.faint}
      keyboardType={keyboardType}
      returnKeyType="done"
      selectionColor={theme.ink}
      onChangeText={(text) => dispatch({ type: 'set-field', field, value: text })}
      style={[styles.input, { color: theme.ink }]}
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
  const theme = useTheme()
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
    <View>
      <Text style={[styles.heading, { color: theme.muted }]}>Workout</Text>
      <EditorNoticeBanner notice={notice} dispatch={dispatch} />
      <FieldRow label="Distance" unit={distanceUnit} error={errors.distance} hasSeparator>
        <NumberInput
          field="distance"
          label="Distance"
          value={form.distance}
          placeholder="0"
          keyboardType={distanceUnit === 'm' ? 'number-pad' : 'decimal-pad'}
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow label="Time" unit="" error={errors.time} hasSeparator>
        <NumberInput
          field="time"
          label="Time"
          value={form.time}
          placeholder="mm:ss"
          keyboardType={TIME_KEYBOARD}
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
          keyboardType="number-pad"
          dispatch={dispatch}
        />
      </FieldRow>
      <FieldRow label="Calories" unit="kcal" error={errors.calories} hasSeparator>
        <NumberInput
          field="calories"
          label="Calories"
          value={form.calories}
          placeholder="Optional"
          keyboardType="number-pad"
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
            keyboardType="number-pad"
            dispatch={dispatch}
          />
        </FieldRow>
      ) : null}
      <FieldRow label={paceStyle.label} unit={paceStyle.unit} hasSeparator={false}>
        <View style={styles.paceValue}>
          <Text
            style={[styles.badge, { backgroundColor: theme.tint, color: theme.muted }]}
          >
            Auto
          </Text>
          <Text style={[styles.computed, { color: workout ? theme.ink : theme.muted }]}>
            {pace}
          </Text>
        </View>
      </FieldRow>
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 14,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    width: INPUT_WIDTH,
    padding: 0,
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  paceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    fontSize: 12,
    fontWeight: '600',
  },
  computed: {
    fontSize: 17,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
})
