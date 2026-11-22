import { RiCheckLine } from '@remixicon/react'
import type { Dispatch } from 'react'
import { Input } from '~/components/ui/input'
import { Toggle } from '~/components/ui/toggle'
import { ACTIVITIES, type ActivityType } from '~/domain/activity'
import { formatList } from '~/domain/format'
import {
  STICKER_INKS,
  STICKER_STYLES,
  STICKER_TITLE_MAX_LENGTH,
  describeStat,
  statLabel,
  type StickerInk,
  type StickerOptions,
  type StickerStyle,
} from '~/domain/sticker-data'
import { MAX_SECONDARY_STATS, statsFor, type Workout } from '~/domain/workout'
import { ChoiceChips } from './choice-chips'
import type { EditorAction } from './editor-state'
import { FieldRow, blurOnEnter } from './field-row'

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
  return (
    <Toggle
      variant="outline"
      className="h-11 px-4 text-[15px]"
      pressed={isPicked}
      disabled={isDisabled}
      onPressedChange={onPress}
    >
      {isPicked ? <RiCheckLine aria-hidden="true" /> : null}
      {label}
    </Toggle>
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
    <div>
      <div className="mt-5 mb-2.5 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">On the sticker</h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {`${options.stats.length} of ${MAX_SECONDARY_STATS}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
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
      </div>
      <p className="mt-3 min-h-5 text-sm text-muted-foreground">
        {chipHint({ isFull, missing })}
      </p>
      <div className="flex flex-col gap-2.5 border-b border-border py-3.5">
        <span className="text-base">Style</span>
        <ChoiceChips
          values={STICKER_STYLES}
          labels={STYLE_LABELS}
          value={options.style}
          label="Sticker style"
          onChange={(style) => dispatch({ type: 'set-style', style })}
        />
      </div>
      <FieldRow label="Title" hasSeparator>
        <Input
          aria-label="Sticker title"
          className="h-9 w-48 text-right text-base font-medium"
          value={options.title}
          placeholder={ACTIVITIES[activity].label}
          maxLength={STICKER_TITLE_MAX_LENGTH}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          onChange={(event) => dispatch({ type: 'set-title', title: event.target.value })}
          onKeyDown={blurOnEnter}
        />
      </FieldRow>
      <FieldRow label="Ink" hasSeparator={false}>
        <ChoiceChips
          values={STICKER_INKS}
          labels={INK_LABELS}
          value={options.ink}
          label="Sticker ink"
          onChange={(ink) => dispatch({ type: 'set-ink', ink })}
        />
      </FieldRow>
    </div>
  )
}
