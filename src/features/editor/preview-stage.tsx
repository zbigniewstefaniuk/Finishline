import type { Dispatch } from 'react'
import type { StickerImage } from '~/sticker/render-sticker'
import {
  PREVIEW_BACKGROUNDS,
  type EditorAction,
  type PreviewBackground,
} from './editor-state'

const BACKGROUND_LABELS = {
  dark: 'Dark',
  light: 'Light',
} as const satisfies Record<PreviewBackground, string>

export function PreviewStage({
  image,
  hasWorkout,
  background,
  dispatch,
}: {
  image: StickerImage | null
  hasWorkout: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
}) {
  return (
    <section className="stage" data-background={background} aria-label="Sticker preview">
      <div className="stage-sticker">
        {image ? (
          <img src={image.url} width={image.width} height={image.height} alt="Sticker" />
        ) : null}
        {hasWorkout ? null : (
          <p className="stage-hint">
            {'Enter a distance and time,\nor upload a screenshot.'}
          </p>
        )}
      </div>
      <div className="stage-switcher" role="radiogroup" aria-label="Preview background">
        {PREVIEW_BACKGROUNDS.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={key === background}
            className="stage-switcher-option"
            onClick={() => dispatch({ type: 'set-background', background: key })}
          >
            {BACKGROUND_LABELS[key]}
          </button>
        ))}
      </div>
    </section>
  )
}
