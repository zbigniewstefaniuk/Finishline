import type { Dispatch } from 'react'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { STICKER_STYLES, type StickerStyle } from '~/domain/sticker-data'
import { cn } from '~/lib/utils'
import type { StickerImage } from '~/sticker/render-sticker'
import {
  PREVIEW_BACKGROUNDS,
  type EditorAction,
  type PreviewBackground,
} from './editor-state'
import { swipedStyle } from './preview-gestures'
import { usePreviewGestures } from './use-preview-gestures'

const BACKGROUND_LABELS = {
  dark: 'Dark',
  light: 'Light',
} as const satisfies Record<PreviewBackground, string>

export function PreviewStage({
  image,
  renderedStyle,
  stickerStyle,
  hasWorkout,
  background,
  dispatch,
  onLongPress,
}: {
  image: StickerImage | null
  renderedStyle: StickerStyle | null
  stickerStyle: StickerStyle
  hasWorkout: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
  onLongPress: () => void
}) {
  const otherBackground = PREVIEW_BACKGROUNDS.find((key) => key !== background)
  const gestures = usePreviewGestures({
    onSwipe: (gesture) =>
      dispatch({
        type: 'set-style',
        style: swipedStyle({ style: stickerStyle, gesture }),
      }),
    onDoubleTap: () => {
      if (otherBackground)
        dispatch({ type: 'set-background', background: otherBackground })
    },
    onLongPress,
  })

  return (
    <section
      className="stage relative mx-4 h-80 overflow-hidden rounded-4xl"
      data-background={background}
      aria-label="Sticker preview. Swipe to change style, double-tap to switch background, hold to copy."
    >
      <div
        className="absolute inset-0 touch-pan-y select-none"
        onContextMenu={(event) => event.preventDefault()}
        {...gestures.handlers}
      >
        <div
          aria-hidden="true"
          className="absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5"
        >
          {STICKER_STYLES.map((style) => (
            <span
              key={style}
              className={cn(
                'h-1.5 w-1.5 rounded-full bg-(--pill-muted) transition-all',
                style === stickerStyle && 'w-4 bg-(--pill-ink)',
              )}
            />
          ))}
        </div>
        <div
          className={cn(
            'absolute inset-x-6 top-6 bottom-16 flex items-center justify-center',
            gestures.dragX === 0 && 'transition-transform duration-200',
          )}
          style={{
            transform: `translateX(${gestures.dragX}px) scale(${gestures.isHolding ? 0.96 : 1})`,
          }}
        >
          {image ? (
            <img
              key={renderedStyle}
              src={image.url}
              width={image.width}
              height={image.height}
              alt="Sticker"
              draggable={false}
              className="pointer-events-none h-auto max-h-full max-w-full object-contain motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
            />
          ) : null}
          {hasWorkout ? null : (
            <p className="text-center text-[15px] leading-relaxed whitespace-pre-line text-(--pill-muted)">
              {'Enter a distance and time,\nor upload a screenshot.'}
            </p>
          )}
        </div>
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
