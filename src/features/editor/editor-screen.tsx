import { Suspense, use, useDeferredValue, useReducer, type Dispatch } from 'react'
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
    <main className="editor">
      <header className="editor-header">
        <h1 className="editor-title">Finishline</h1>
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
      <section className="card">
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
      </section>
    </main>
  )
}
