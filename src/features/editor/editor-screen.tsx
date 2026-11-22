import {
  Suspense,
  use,
  useDeferredValue,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { Card, CardContent } from '~/components/ui/card'
import {
  buildStickerData,
  type StickerData,
  type StickerStyle,
} from '~/domain/sticker-data'
import { renderSticker } from '~/sticker/render-sticker'
import { STICKER_FONTS_READY } from '~/sticker/sticker-fonts'
import { ActivityPicker } from './activity-picker'
import {
  createEditorState,
  editorReducer,
  readForm,
  type EditorAction,
  type PreviewBackground,
} from './editor-state'
import { ExportBar } from './export-bar'
import { HeaderActions } from './header-actions'
import { OptionsDrawer } from './options-drawer'
import { PreviewStage } from './preview-stage'
import { useStickerCopy } from './use-sticker-copy'
import { WorkoutFields } from './workout-fields'

type StickerOutputProps = {
  data: StickerData | null
  stickerStyle: StickerStyle
  canExport: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
  optionsDrawer: ReactNode
}

function StickerOutput({
  data,
  stickerStyle,
  canExport,
  background,
  dispatch,
  optionsDrawer,
}: StickerOutputProps) {
  use(STICKER_FONTS_READY)
  const image = data ? renderSticker(data) : null
  const exportable = canExport ? image : null
  const stickerCopy = useStickerCopy()
  return (
    <>
      <PreviewStage
        image={image}
        renderedStyle={data?.style ?? null}
        stickerStyle={stickerStyle}
        hasWorkout={data !== null}
        background={background}
        dispatch={dispatch}
        onLongPress={() => {
          if (exportable) void stickerCopy.copy(exportable)
        }}
      />
      <ExportBar
        image={exportable}
        copyStatus={stickerCopy.status}
        onCopy={(sticker) => void stickerCopy.copy(sticker)}
      >
        {optionsDrawer}
      </ExportBar>
    </>
  )
}

export function EditorScreen() {
  const [state, dispatch] = useReducer(editorReducer, undefined, createEditorState)
  const { workout, errors } = readForm(state.form)
  const stickerData = state.lastWorkout
    ? buildStickerData({ workout: state.lastWorkout, options: state.sticker })
    : null
  const deferredStickerData = useDeferredValue(stickerData)
  const optionsDrawer = (
    <OptionsDrawer
      options={state.sticker}
      activity={state.form.activity}
      workout={state.lastWorkout}
      dispatch={dispatch}
    />
  )

  return (
    <main className="mx-auto max-w-130 pt-[env(safe-area-inset-top)] pb-[calc(9.5rem+env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="font-heading text-lg font-semibold">Finishline</h1>
        <HeaderActions dispatch={dispatch} />
      </header>
      <Suspense
        fallback={
          <>
            <PreviewStage
              image={null}
              renderedStyle={null}
              stickerStyle={state.sticker.style}
              hasWorkout={stickerData !== null}
              background={state.background}
              dispatch={dispatch}
              onLongPress={() => undefined}
            />
            <ExportBar image={null} copyStatus="idle" onCopy={() => undefined}>
              {optionsDrawer}
            </ExportBar>
          </>
        }
      >
        <StickerOutput
          data={deferredStickerData}
          stickerStyle={state.sticker.style}
          canExport={workout !== null}
          background={state.background}
          dispatch={dispatch}
          optionsDrawer={optionsDrawer}
        />
      </Suspense>
      <ActivityPicker value={state.form.activity} dispatch={dispatch} />
      <Card className="mx-4 mt-4">
        <CardContent>
          <WorkoutFields
            form={state.form}
            errors={errors}
            workout={workout}
            notice={state.notice}
            dispatch={dispatch}
          />
        </CardContent>
      </Card>
    </main>
  )
}
