import { Suspense, use, useDeferredValue, useReducer, type Dispatch } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { buildStickerData, type StickerData } from '~/domain/sticker-data'
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
import { PreviewStage } from './preview-stage'
import { StickerOptionsSection } from './sticker-options'
import { WorkoutFields } from './workout-fields'

type StickerOutputProps = {
  data: StickerData | null
  canExport: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
}

function StickerOutput({ data, canExport, background, dispatch }: StickerOutputProps) {
  use(STICKER_FONTS_READY)
  const image = data ? renderSticker(data) : null
  return (
    <>
      <PreviewStage
        image={image}
        hasWorkout={data !== null}
        background={background}
        dispatch={dispatch}
      />
      <ExportBar image={canExport ? image : null} />
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

  return (
    <main className="mx-auto max-w-130 pt-[env(safe-area-inset-top)] pb-[calc(6.25rem+env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="font-heading text-lg font-semibold">Finishline</h1>
        <HeaderActions dispatch={dispatch} />
      </header>
      <Suspense
        fallback={
          <>
            <PreviewStage
              image={null}
              hasWorkout={stickerData !== null}
              background={state.background}
              dispatch={dispatch}
            />
            <ExportBar image={null} />
          </>
        }
      >
        <StickerOutput
          data={deferredStickerData}
          canExport={workout !== null}
          background={state.background}
          dispatch={dispatch}
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
          <StickerOptionsSection
            options={state.sticker}
            activity={state.form.activity}
            workout={state.lastWorkout}
            dispatch={dispatch}
          />
        </CardContent>
      </Card>
    </main>
  )
}
