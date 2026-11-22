import { useEffect, useRef, type Dispatch } from 'react'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
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
    <div
      ref={rowRef}
      className="mt-4 overflow-x-auto px-4 scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ToggleGroup
        aria-label="Sport"
        variant="outline"
        value={[value]}
        onValueChange={(next: unknown[]) => {
          const activity = ACTIVITY_TYPES.find((type) => next.includes(type))
          if (activity) dispatch({ type: 'set-activity', activity })
        }}
      >
        {ACTIVITY_TYPES.map((activity) => (
          <ToggleGroupItem
            key={activity}
            value={activity}
            data-activity={activity}
            className="h-11 px-4 text-[15px]"
          >
            {ACTIVITIES[activity].label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
