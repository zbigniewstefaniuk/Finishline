import type { Dispatch } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { ACTIVITIES, type ActivityType } from '~/domain/activity'
import { formatList } from '~/domain/format'
import {
  STICKER_INKS,
  STICKER_STYLES,
  STICKER_TITLE_MAX_LENGTH,
  describeStat,
  statLabel,
  type StickerInk,
  type StickerStyle,
  type StickerOptions,
} from '~/domain/sticker-data'
import { MAX_SECONDARY_STATS, statsFor, type Workout } from '~/domain/workout'
import { PRESSED_OPACITY, RADIUS, SPACE } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'
import type { EditorAction } from './editor-state'
import { ChoiceChips } from './choice-chips'
import { FieldRow } from './field-row'

const TITLE_INPUT_WIDTH = 190

const INK_LABELS = {
  light: 'Light',
  dark: 'Dark',
} as const satisfies Record<StickerInk, string>

const STYLE_LABELS = {
  minimal: 'Minimal',
  strip: 'Strip',
  editorial: 'Editorial',
} as const satisfies Record<StickerStyle, string>

function chipHint({ isFull, missing }: { isFull: boolean; missing: string[] }) {
  if (isFull) return 'Three stats is the most that fits on the sticker.'
  if (missing.length === 0) return ''
  const verb = missing.length > 1 ? 'need values' : 'needs a value'
  return `${formatList(missing)} ${verb} above.`
}

function Chip({
  label,
  isPicked,
  isDisabled,
  onPress,
}: {
  label: string
  isPicked: boolean
  isDisabled: boolean
  onPress: () => void
}) {
  const theme = useTheme()
  const idleColor = isDisabled ? theme.faint : theme.muted
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isPicked, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: isPicked ? theme.tint : theme.raised },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipLabel, { color: isPicked ? theme.ink : idleColor }]}>
        {isPicked ? `✓  ${label}` : label}
      </Text>
    </Pressable>
  )
}

export function StickerOptionsSection({
  options,
  activity,
  workout,
  dispatch,
}: {
  options: StickerOptions
  activity: ActivityType
  workout: Workout | null
  dispatch: Dispatch<EditorAction>
}) {
  const theme = useTheme()
  const isFull = options.stats.length >= MAX_SECONDARY_STATS
  const chips = statsFor(activity).map((stat) => {
    const isPicked = options.stats.includes(stat)
    const hasValue = workout !== null && describeStat({ stat, workout }) !== null
    return {
      stat,
      label: statLabel({ stat, activity }),
      isPicked,
      hasValue,
      isDisabled: !isPicked && (!hasValue || isFull),
    }
  })
  const missing = chips
    .filter((chip) => !chip.hasValue && !chip.isPicked)
    .map((chip) => chip.label)

  return (
    <View>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: theme.muted }]}>On the sticker</Text>
        <Text style={[styles.heading, styles.count, { color: theme.muted }]}>
          {`${options.stats.length} of ${MAX_SECONDARY_STATS}`}
        </Text>
      </View>
      <View style={styles.chips}>
        {chips.map((chip) => (
          <Chip
            key={chip.stat}
            label={chip.label}
            isPicked={chip.isPicked}
            isDisabled={chip.isDisabled}
            onPress={() => dispatch({ type: 'toggle-stat', stat: chip.stat })}
          />
        ))}
        <Chip
          label="Date"
          isPicked={options.showsDate}
          isDisabled={false}
          onPress={() => dispatch({ type: 'toggle-date' })}
        />
      </View>
      <Text style={[styles.hint, { color: theme.muted }]}>
        {chipHint({ isFull, missing })}
      </Text>
      <View style={[styles.styleRow, { borderBottomColor: theme.hairline }]}>
        <Text style={[styles.rowLabel, { color: theme.ink }]}>Style</Text>
        <ChoiceChips
          values={STICKER_STYLES}
          labels={STYLE_LABELS}
          value={options.style}
          accessibilityLabel="Sticker style"
          onChange={(style) => dispatch({ type: 'set-style', style })}
        />
      </View>
      <FieldRow label="Title" hasSeparator>
        <TextInput
          accessibilityLabel="Sticker title"
          value={options.title}
          placeholder={ACTIVITIES[activity].label}
          placeholderTextColor={theme.faint}
          maxLength={STICKER_TITLE_MAX_LENGTH}
          autoCorrect={false}
          returnKeyType="done"
          selectionColor={theme.ink}
          onChangeText={(title) => dispatch({ type: 'set-title', title })}
          style={[styles.titleInput, { color: theme.ink }]}
        />
      </FieldRow>
      <FieldRow label="Ink" hasSeparator={false}>
        <ChoiceChips
          values={STICKER_INKS}
          labels={INK_LABELS}
          value={options.ink}
          accessibilityLabel="Sticker ink"
          onChange={(ink) => dispatch({ type: 'set-ink', ink })}
        />
      </FieldRow>
    </View>
  )
}

const styles = StyleSheet.create({
  headingRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  heading: {
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: SPACE.touch,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    minHeight: 18,
    fontSize: 13,
  },
  titleInput: {
    width: TITLE_INPUT_WIDTH,
    padding: 0,
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'right',
  },
  styleRow: {
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 16,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
