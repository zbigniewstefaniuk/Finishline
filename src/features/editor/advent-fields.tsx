import type { Dispatch } from 'react'
import { FieldLegend, FieldSet } from '~/components/ui/field'
import { ADVENT_COUNTS, type AdventCount } from '~/domain/advent'
import { ChoiceChips } from './choice-chips'
import { DateField } from './date-field'
import { EditorNoticeBanner } from './editor-notice'
import type { EditorAction, EditorNotice } from './editor-state'
import { FieldRow } from './field-row'

const ADVENT_DATE_INPUT_ID = 'advent-date'

export const COUNT_LABELS = {
  day: 'Day',
  countdown: 'Countdown',
} as const satisfies Record<AdventCount, string>

export function AdventFields({
  date,
  count,
  notice,
  dispatch,
}: {
  date: Date
  count: AdventCount
  notice: EditorNotice | null
  dispatch: Dispatch<EditorAction>
}) {
  return (
    <FieldSet className="gap-0">
      <FieldLegend variant="label" className="mt-1 mb-0.5 text-muted-foreground">
        Advent
      </FieldLegend>
      <EditorNoticeBanner notice={notice} dispatch={dispatch} />
      <FieldRow label="Date" htmlFor={ADVENT_DATE_INPUT_ID} hasSeparator>
        <DateField
          id={ADVENT_DATE_INPUT_ID}
          value={date}
          onChange={(picked) => dispatch({ type: 'set-date', date: picked })}
        />
      </FieldRow>
      <FieldRow label="Number" hasSeparator={false}>
        <ChoiceChips
          values={ADVENT_COUNTS}
          labels={COUNT_LABELS}
          value={count}
          label="Door number"
          onChange={(picked) => dispatch({ type: 'set-advent-count', count: picked })}
        />
      </FieldRow>
    </FieldSet>
  )
}
