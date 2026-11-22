import type { Dispatch } from 'react'
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
    <div className="notice" role="status">
      <p className="notice-message">{message}</p>
      <button type="button" className="notice-action" onClick={() => dispatch(action)}>
        {actionLabel}
      </button>
    </div>
  )
}
