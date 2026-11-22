import { setImageAsync } from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { saveToPhotos } from '~/share/save-to-photos'
import { shareSticker } from '~/share/share-sticker'
import { exportStickerBase64, exportStickerPng } from '~/sticker/export-sticker'
import type { StickerLayout } from '~/sticker/sticker-drawing'
import { PRESSED_OPACITY, RADIUS, SPACE, type PreviewBackground } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'

type ExportStatus = 'idle' | 'copying' | 'copied' | 'saving' | 'saved' | 'sharing'

const DONE_FLASH_MS = 1600
const BUTTON_HEIGHT = 52
const BAR_PADDING = 12

export const EXPORT_BAR_HEIGHT = BUTTON_HEIGHT + BAR_PADDING * 2

const COPY_LABELS = {
  idle: 'Copy',
  copying: 'Copying…',
  copied: 'Copied',
  saving: 'Copy',
  saved: 'Copy',
  sharing: 'Copy',
} as const satisfies Record<ExportStatus, string>

const SAVE_LABELS = {
  idle: 'Save',
  copying: 'Save',
  copied: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  sharing: 'Save',
} as const satisfies Record<ExportStatus, string>

const SHARE_LABELS = {
  idle: 'Share to Stories',
  copying: 'Share to Stories',
  copied: 'Share to Stories',
  saving: 'Share to Stories',
  saved: 'Share to Stories',
  sharing: 'Opening…',
} as const satisfies Record<ExportStatus, string>

function showPhotosDenied() {
  Alert.alert(
    'Photos access is off',
    'Allow Finishline to add photos in Settings to save stickers.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => void Linking.openSettings() },
    ],
  )
}

function showFailure({ title, error }: { title: string; error: unknown }) {
  Alert.alert(title, error instanceof Error ? error.message : 'Please try again.')
}

function SecondaryAction({
  label,
  isDone,
  isDisabled,
  onPress,
}: {
  label: string
  isDone: boolean
  isDisabled: boolean
  onPress: () => void
}) {
  const theme = useTheme()
  const idleColor = isDisabled ? theme.faint : theme.ink
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles.secondary,
        { backgroundColor: theme.raised },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: isDone ? theme.success : idleColor }]}>
        {label}
      </Text>
    </Pressable>
  )
}

export function ExportBar({
  layout,
  background,
}: {
  layout: StickerLayout | null
  background: PreviewBackground
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [status, setStatus] = useState<ExportStatus>('idle')

  useEffect(() => {
    const isFlashing = status === 'saved' || status === 'copied'
    if (!isFlashing) return
    const timer = setTimeout(() => setStatus('idle'), DONE_FLASH_MS)
    return () => clearTimeout(timer)
  }, [status])

  const isBusy = status === 'copying' || status === 'saving' || status === 'sharing'
  const isDisabled = layout === null || isBusy

  async function copy(sticker: StickerLayout) {
    setStatus('copying')
    try {
      await setImageAsync(await exportStickerBase64(sticker))
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setStatus('copied')
    } catch (error) {
      setStatus('idle')
      showFailure({ title: 'Could not copy the sticker', error })
    }
  }

  async function save(sticker: StickerLayout) {
    setStatus('saving')
    try {
      const result = await saveToPhotos(await exportStickerPng(sticker))
      if (result === 'denied') {
        setStatus('idle')
        showPhotosDenied()
        return
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setStatus('saved')
    } catch (error) {
      setStatus('idle')
      showFailure({ title: 'Could not save the sticker', error })
    }
  }

  async function share(sticker: StickerLayout) {
    setStatus('sharing')
    try {
      await shareSticker({ fileUri: await exportStickerPng(sticker), background })
    } catch (error) {
      showFailure({ title: 'Could not share the sticker', error })
    }
    setStatus('idle')
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.ground,
          paddingBottom: insets.bottom + BAR_PADDING,
        },
      ]}
    >
      <SecondaryAction
        label={COPY_LABELS[status]}
        isDone={status === 'copied'}
        isDisabled={isDisabled}
        onPress={() => {
          if (layout) void copy(layout)
        }}
      />
      <SecondaryAction
        label={SAVE_LABELS[status]}
        isDone={status === 'saved'}
        isDisabled={isDisabled}
        onPress={() => {
          if (layout) void save(layout)
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={() => {
          if (layout) void share(layout)
        }}
        style={({ pressed }) => [
          styles.button,
          styles.primary,
          { backgroundColor: isDisabled ? theme.raised : theme.primary },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[styles.label, { color: isDisabled ? theme.faint : theme.onPrimary }]}
        >
          {SHARE_LABELS[status]}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingTop: BAR_PADDING,
    paddingHorizontal: SPACE.gutter,
  },
  button: {
    height: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.control,
  },
  secondary: {
    flex: 1,
  },
  primary: {
    flex: 1.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
