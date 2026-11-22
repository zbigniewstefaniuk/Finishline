import type { Dispatch } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatList } from '~/domain/format'
import { HIT_SLOP, PRESSED_OPACITY, RADIUS } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'
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
  const theme = useTheme()
  if (!notice) return null
  const { message, actionLabel, action } = describeNotice(notice)
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: theme.raised }]}
    >
      <Text style={[styles.message, { color: theme.ink }]}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={HIT_SLOP}
        onPress={() => dispatch(action)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={[styles.action, { color: theme.ink }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADIUS.segment,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
