import { useState, type Dispatch } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { parseWorkoutScan } from '~/domain/workout-scan'
import { readScreenshotLines } from '~/scan/read-screenshot'
import { HIT_SLOP, PRESSED_OPACITY, RADIUS } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'
import type { EditorAction } from './editor-state'

type UploadStatus = 'idle' | 'reading'

function HeaderPill({
  label,
  accessibilityLabel,
  isBusy,
  onPress,
}: {
  label: string
  accessibilityLabel: string
  isBusy: boolean
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: isBusy, disabled: isBusy }}
      disabled={isBusy}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: theme.raised },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: isBusy ? theme.muted : theme.ink }]}>
        {label}
      </Text>
    </Pressable>
  )
}

export function HeaderActions({ dispatch }: { dispatch: Dispatch<EditorAction> }) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const isReading = uploadStatus === 'reading'

  async function upload() {
    setUploadStatus('reading')
    try {
      const lines = await readScreenshotLines()
      if (lines) {
        dispatch({
          type: 'apply-scan',
          scan: parseWorkoutScan({ lines, today: new Date() }),
        })
      }
    } catch (error) {
      Alert.alert(
        'Could not read the screenshot',
        error instanceof Error ? error.message : 'Please try again.',
      )
    }
    setUploadStatus('idle')
  }

  return (
    <View style={styles.row}>
      <HeaderPill
        label="New"
        accessibilityLabel="Start a new sticker"
        isBusy={false}
        onPress={() => dispatch({ type: 'start-new', today: new Date() })}
      />
      <HeaderPill
        label={isReading ? 'Reading…' : 'Upload'}
        accessibilityLabel="Upload a workout screenshot to fill in the stats"
        isBusy={isReading}
        onPress={() => void upload()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    height: 36,
    paddingHorizontal: 16,
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
