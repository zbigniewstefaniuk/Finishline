import type { Dispatch } from 'react'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
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
    <section
      className="stage relative mx-4 h-80 overflow-hidden rounded-4xl"
      data-background={background}
      aria-label="Sticker preview"
    >
      <div className="absolute inset-x-6 top-2 bottom-16 flex items-center justify-center">
        {image ? (
          <img
            src={image.url}
            width={image.width}
            height={image.height}
            alt="Sticker"
            className="h-auto max-h-full max-w-full object-contain"
          />
        ) : null}
        {hasWorkout ? null : (
          <p className="text-center text-[15px] leading-relaxed whitespace-pre-line text-(--pill-muted)">
            {'Enter a distance and time,\nor upload a screenshot.'}
          </p>
        )}
      </div>
      <ToggleGroup
        aria-label="Preview background"
        spacing={0.5}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-(--pill-material) p-1"
        value={[background]}
        onValueChange={(next: unknown[]) => {
          const picked = PREVIEW_BACKGROUNDS.find((key) => next.includes(key))
          if (picked) dispatch({ type: 'set-background', background: picked })
        }}
      >
        {PREVIEW_BACKGROUNDS.map((key) => (
          <ToggleGroupItem
            key={key}
            value={key}
            className="h-9 rounded-full px-4 text-[13px] text-(--pill-muted) hover:bg-transparent hover:text-(--pill-ink) aria-pressed:bg-(--pill-active) aria-pressed:text-(--pill-ink)"
          >
            {BACKGROUND_LABELS[key]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
