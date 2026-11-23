import { useState, type Dispatch } from 'react'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { STICKER_STYLES, type StickerStyle } from '~/domain/sticker-data'
import { cn } from '~/lib/utils'
import type { StickerImage } from '~/sticker/render-sticker'
import {
  PREVIEW_BACKGROUNDS,
  type EditorAction,
  type PreviewBackground,
} from './editor-state'
import { entrySide, swipedStyle, type EntrySide } from './preview-gestures'
import { STYLE_LABELS } from './sticker-options'
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
  const [entry, setEntry] = useState<{
    style: StickerStyle | null
    side: EntrySide | null
  }>({ style: renderedStyle, side: null })
  if (renderedStyle !== entry.style) {
    setEntry({
      style: renderedStyle,
      side: entrySide({ from: entry.style, to: renderedStyle }),
    })
  }
  const isSwitchingStyle = image !== null && renderedStyle !== stickerStyle
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
        className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onContextMenu={(event) => event.preventDefault()}
        {...gestures.handlers}
      >
        <div
          className={cn(
            'absolute inset-x-6 top-6 bottom-16 flex items-center justify-center',
            gestures.dragX === 0 &&
              !isSwitchingStyle &&
              'transition-transform duration-200',
          )}
          style={{
            transform: `translateX(${gestures.dragX}px) scale(${gestures.isHolding ? 0.96 : 1})`,
          }}
        >
          {image && !isSwitchingStyle ? (
            <img
              key={renderedStyle}
              src={image.url}
              width={image.width}
              height={image.height}
              alt="Sticker"
              draggable={false}
              className={cn(
                'pointer-events-none h-auto max-h-full max-w-full object-contain motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95',
                entry.side === 'right' && 'motion-safe:slide-in-from-right-8',
                entry.side === 'left' && 'motion-safe:slide-in-from-left-8',
              )}
            />
          ) : null}
          {hasWorkout ? null : (
            <p className="text-center text-[15px] leading-relaxed whitespace-pre-line text-(--pill-muted)">
              {'Enter a distance and time,\nor upload a screenshot.'}
            </p>
          )}
        </div>
      </div>
      <div
        role="group"
        aria-label="Sticker style"
        className="absolute top-0.75 left-1/2 flex -translate-x-1/2"
      >
        {STICKER_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            aria-label={STYLE_LABELS[style]}
            aria-pressed={style === stickerStyle}
            className="group flex h-6 cursor-pointer items-center rounded-full px-0.75 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
            onClick={() => dispatch({ type: 'set-style', style })}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full bg-(--pill-muted) transition-all group-hover:bg-(--pill-ink)',
                style === stickerStyle && 'w-4 bg-(--pill-ink)',
              )}
            />
          </button>
        ))}
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
