import {
  Suspense,
  use,
  useDeferredValue,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { ADVENT_COUNTS } from '~/domain/advent'
import { STICKER_STYLES, type StickerSource } from '~/domain/sticker-data'
import { renderSticker } from '~/sticker/render-sticker'
import { STICKER_FONTS_READY } from '~/sticker/sticker-fonts'
import { ActivityPicker } from './activity-picker'
import { AdventFields, COUNT_LABELS } from './advent-fields'
import { ChoiceChips } from './choice-chips'
import {
  EDITOR_MODES,
  createEditorState,
  editorReducer,
  readForm,
  stickerSourceOf,
  type EditorAction,
  type EditorMode,
  type EditorState,
  type PreviewBackground,
} from './editor-state'
import { ExportBar } from './export-bar'
import { HeaderActions } from './header-actions'
import { OptionsDrawer } from './options-drawer'
import { PreviewStage, type PreviewPager } from './preview-stage'
import { STYLE_LABELS } from './sticker-options'
import { useStickerCopy } from './use-sticker-copy'
import { WorkoutFields } from './workout-fields'

const MODE_LABELS = {
  workout: 'Workout',
  advent: 'Advent',
} as const satisfies Record<EditorMode, string>

function pagerOf({ mode, sticker }: EditorState): PreviewPager {
  if (mode === 'advent') {
    return {
      label: 'Door number',
      pages: ADVENT_COUNTS.map((key) => ({ key, label: COUNT_LABELS[key] })),
      current: sticker.adventCount,
    }
  }
  return {
    label: 'Sticker style',
    pages: STICKER_STYLES.map((key) => ({ key, label: STYLE_LABELS[key] })),
    current: sticker.style,
  }
}

type StickerOutputProps = {
  source: StickerSource | null
  pager: PreviewPager
  canExport: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
  optionsDrawer: ReactNode
}

function StickerOutput({
  source,
  pager,
  canExport,
  background,
  dispatch,
  optionsDrawer,
}: StickerOutputProps) {
  use(STICKER_FONTS_READY)
  const image = source ? renderSticker(source) : null
  const renderedPage =
    source?.kind === 'advent' ? source.data.count : (source?.data.style ?? null)
  const exportable = canExport ? image : null
  const stickerCopy = useStickerCopy(exportable)
  return (
    <>
      <PreviewStage
        image={image}
        renderedPage={renderedPage}
        pager={pager}
        isEmpty={source === null}
        background={background}
        dispatch={dispatch}
        onLongPress={() => {
          if (exportable) void stickerCopy.copy(exportable)
        }}
      />
      <ExportBar
        image={exportable}
        copyState={stickerCopy.state}
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
  const isAdvent = state.mode === 'advent'
  const stickerSource = stickerSourceOf(state)
  const deferredStickerSource = useDeferredValue(stickerSource)
  const pager = pagerOf(state)
  const optionsDrawer = (
    <OptionsDrawer
      mode={state.mode}
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
      <div className="px-4 pb-3">
        <ChoiceChips
          values={EDITOR_MODES}
          labels={MODE_LABELS}
          value={state.mode}
          label="Sticker mode"
          onChange={(mode) => dispatch({ type: 'set-mode', mode })}
        />
      </div>
      <Suspense
        fallback={
          <>
            <PreviewStage
              image={null}
              renderedPage={null}
              pager={pager}
              isEmpty={stickerSource === null}
              background={state.background}
              dispatch={dispatch}
              onLongPress={() => undefined}
            />
            <ExportBar image={null} copyState="copy" onCopy={() => undefined}>
              {optionsDrawer}
            </ExportBar>
          </>
        }
      >
        <StickerOutput
          source={deferredStickerSource}
          pager={pager}
          canExport={isAdvent || workout !== null}
          background={state.background}
          dispatch={dispatch}
          optionsDrawer={optionsDrawer}
        />
      </Suspense>
      {isAdvent ? null : (
        <ActivityPicker value={state.form.activity} dispatch={dispatch} />
      )}
      <Card className="mx-4 mt-4">
        <CardContent>
          {isAdvent ? (
            <AdventFields
              date={state.form.date}
              count={state.sticker.adventCount}
              notice={state.notice}
              dispatch={dispatch}
            />
          ) : (
            <WorkoutFields
              form={state.form}
              errors={errors}
              workout={workout}
              notice={state.notice}
              dispatch={dispatch}
            />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
