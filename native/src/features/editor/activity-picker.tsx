import { useEffect, useRef, type Dispatch } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type ScrollViewInstance,
} from 'react-native'
import { ACTIVITIES, ACTIVITY_TYPES, type ActivityType } from '~/domain/activity'
import { PRESSED_OPACITY, RADIUS, SPACE } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'
import type { EditorAction } from './editor-state'

const SCROLL_EVENT_THROTTLE_MS = 16

type Span = { x: number; width: number }

export function ActivityPicker({
  value,
  dispatch,
}: {
  value: ActivityType
  dispatch: Dispatch<EditorAction>
}) {
  const theme = useTheme()
  const scrollRef = useRef<ScrollViewInstance>(null)
  const pillSpans = useRef(new Map<ActivityType, Span>())
  const viewport = useRef<Span>({ x: 0, width: 0 })

  useEffect(() => {
    const pill = pillSpans.current.get(value)
    if (!pill) return
    const { x, width } = viewport.current
    const isOutOfView = pill.x < x || pill.x + pill.width > x + width
    if (!isOutOfView) return
    scrollRef.current?.scrollTo({ x: Math.max(0, pill.x - SPACE.gutter), animated: true })
  }, [value])

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      accessibilityRole="tablist"
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
      onScroll={(event) => {
        viewport.current.x = event.nativeEvent.contentOffset.x
      }}
      onLayout={(event) => {
        viewport.current.width = event.nativeEvent.layout.width
      }}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      {ACTIVITY_TYPES.map((activity) => {
        const isActive = activity === value
        return (
          <Pressable
            key={activity}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => dispatch({ type: 'set-activity', activity })}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout
              pillSpans.current.set(activity, { x, width })
            }}
            style={({ pressed }) => [
              styles.pill,
              { backgroundColor: isActive ? theme.tint : theme.surface },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, { color: isActive ? theme.ink : theme.muted }]}>
              {ACTIVITIES[activity].label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
    marginHorizontal: -SPACE.gutter,
  },
  content: {
    gap: 8,
    paddingHorizontal: SPACE.gutter,
  },
  pill: {
    height: SPACE.touch,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
