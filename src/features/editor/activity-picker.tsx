import { useEffect, useRef, type Dispatch } from 'react'
import { ACTIVITIES, ACTIVITY_TYPES, type ActivityType } from '~/domain/activity'
import type { EditorAction } from './editor-state'

export function ActivityPicker({
  value,
  dispatch,
}: {
  value: ActivityType
  dispatch: Dispatch<EditorAction>
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rowRef.current
      ?.querySelector(`[data-activity="${value}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [value])

  return (
    <div ref={rowRef} className="activity-row" role="tablist" aria-label="Sport">
      {ACTIVITY_TYPES.map((activity) => (
        <button
          key={activity}
          type="button"
          role="tab"
          aria-selected={activity === value}
          data-activity={activity}
          className="activity-pill"
          onClick={() => dispatch({ type: 'set-activity', activity })}
        >
          {ACTIVITIES[activity].label}
        </button>
      ))}
    </div>
  )
}
