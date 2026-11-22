import type { Dispatch } from 'react'
import { Button } from '~/components/ui/button'
import { formatList } from '~/domain/format'
import type { EditorAction, EditorNotice, FilledField } from './editor-state'

const FIELD_NAMES = {
  activity: 'sport',
  distance: 'distance',
  time: 'time',
  date: 'date',
  heartRate: 'avg HR',
  calories: 'calories',
  elevation: 'elevation',
} as const satisfies Record<FilledField, string>

function describeNotice(notice: EditorNotice) {
  switch (notice.kind) {
    case 'filled': {
      return {
        message: `Filled ${formatList(notice.fields.map((field) => FIELD_NAMES[field]))} from your screenshot.`,
        actionLabel: 'Undo',
        action: { type: 'undo' },
      } as const
    }
    case 'started-new': {
      return {
        message: 'Started a new sticker.',
        actionLabel: 'Undo',
        action: { type: 'undo' },
      } as const
    }
    case 'nothing-found': {
      return {
        message: 'No workout stats found in that screenshot.',
        actionLabel: 'Dismiss',
        action: { type: 'dismiss-notice' },
      } as const
    }
  }
}

export function EditorNoticeBanner({
  notice,
  dispatch,
}: {
  notice: EditorNotice | null
  dispatch: Dispatch<EditorAction>
}) {
  if (!notice) return null
  const { message, actionLabel, action } = describeNotice(notice)
  return (
    <div
      role="status"
      className="mt-2.5 mb-1 flex items-center gap-3 rounded-2xl bg-muted py-2 pr-2 pl-3.5"
    >
      <p className="flex-1 text-sm">{message}</p>
      <Button variant="ghost" size="sm" onClick={() => dispatch(action)}>
        {actionLabel}
      </Button>
    </div>
  )
}
