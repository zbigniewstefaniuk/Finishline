import { useFonts } from '@shopify/react-native-skia'
import { Stack } from 'expo-router'
import { useReducer } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { buildStickerData } from '~/domain/sticker-data'
import { layoutSticker } from '~/sticker/layout-sticker'
import { STICKER_FONTS } from '~/sticker/sticker-fonts'
import { RADIUS, SPACE } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'
import { ActivityPicker } from './activity-picker'
import { createEditorState, editorReducer, readForm } from './editor-state'
import { EXPORT_BAR_HEIGHT, ExportBar } from './export-bar'
import { HeaderActions } from './header-actions'
import { PreviewStage } from './preview-stage'
import { StickerOptionsSection } from './sticker-options'
import { WorkoutFields } from './workout-fields'

const KEYBOARD_GAP = 24

export default function EditorScreen() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [state, dispatch] = useReducer(editorReducer, undefined, createEditorState)
  const fonts = useFonts(STICKER_FONTS)
  const { workout, errors } = readForm(state.form)
  const stickerData = state.lastWorkout
    ? buildStickerData({ workout: state.lastWorkout, options: state.sticker })
    : null
  const layout = fonts && stickerData ? layoutSticker({ data: stickerData, fonts }) : null

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{ headerRight: () => <HeaderActions dispatch={dispatch} /> }}
      />
      <PreviewStage
        layout={layout}
        hasWorkout={state.lastWorkout !== null}
        background={state.background}
        dispatch={dispatch}
      />
      <KeyboardAwareScrollView
        bottomOffset={KEYBOARD_GAP}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: EXPORT_BAR_HEIGHT + insets.bottom + SPACE.stack },
        ]}
      >
        <ActivityPicker value={state.form.activity} dispatch={dispatch} />
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <WorkoutFields
            form={state.form}
            errors={errors}
            workout={workout}
            notice={state.notice}
            dispatch={dispatch}
          />
          <StickerOptionsSection
            options={state.sticker}
            activity={state.form.activity}
            workout={state.lastWorkout}
            dispatch={dispatch}
          />
        </View>
      </KeyboardAwareScrollView>
      <ExportBar layout={workout ? layout : null} background={state.background} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 4,
  },
  content: {
    paddingTop: SPACE.stack,
    paddingHorizontal: SPACE.gutter,
  },
  card: {
    marginTop: SPACE.stack,
    paddingTop: 4,
    paddingBottom: SPACE.stack,
    paddingHorizontal: SPACE.gutter,
    borderRadius: RADIUS.card,
  },
})
