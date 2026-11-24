import { useState, type Dispatch } from 'react'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { cn } from '~/lib/utils'
import type { StickerImage } from '~/sticker/render-sticker'
import {
  PREVIEW_BACKGROUNDS,
  type EditorAction,
  type PreviewBackground,
} from './editor-state'
import { entrySide, type EntrySide } from './preview-gestures'
import { usePreviewGestures } from './use-preview-gestures'

const BACKGROUND_LABELS = {
  dark: 'Dark',
  light: 'Light',
} as const satisfies Record<PreviewBackground, string>

export type PreviewPager = {
  label: string
  pages: { key: string; label: string }[]
  current: string
}

export function PreviewStage({
  image,
  renderedPage,
  pager,
  isEmpty,
  background,
  dispatch,
  onLongPress,
}: {
  image: StickerImage | null
  renderedPage: string | null
  pager: PreviewPager
  isEmpty: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
  onLongPress: () => void
}) {
  const otherBackground = PREVIEW_BACKGROUNDS.find((key) => key !== background)
  const [entry, setEntry] = useState<{
    page: string | null
    side: EntrySide | null
  }>({ page: renderedPage, side: null })
  if (renderedPage !== entry.page) {
    setEntry({
      page: renderedPage,
      side: entrySide({
        pages: pager.pages.map((page) => page.key),
        from: entry.page,
        to: renderedPage,
      }),
    })
  }
  const isSwitchingPage = image !== null && renderedPage !== pager.current
  const gestures = usePreviewGestures({
    onSwipe: (gesture) => dispatch({ type: 'swipe-preview', gesture }),
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
              !isSwitchingPage &&
              'transition-transform duration-200',
          )}
          style={{
            transform: `translateX(${gestures.dragX}px) scale(${gestures.isHolding ? 0.96 : 1})`,
          }}
        >
          {image && !isSwitchingPage ? (
            <img
              key={renderedPage}
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
          {isEmpty ? (
            <p className="text-center text-[15px] leading-relaxed whitespace-pre-line text-(--pill-muted)">
              {'Enter a distance and time,\nor upload a screenshot.'}
            </p>
          ) : null}
        </div>
      </div>
      <div
        role="group"
        aria-label={pager.label}
        className="absolute top-0.75 left-1/2 flex -translate-x-1/2"
      >
        {pager.pages.map((page, index) => (
          <button
            key={page.key}
            type="button"
            aria-label={page.label}
            aria-pressed={page.key === pager.current}
            className="group flex h-6 cursor-pointer items-center rounded-full px-0.75 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
            onClick={() => dispatch({ type: 'select-preview-page', index })}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full bg-(--pill-muted) transition-all group-hover:bg-(--pill-ink)',
                page.key === pager.current && 'w-4 bg-(--pill-ink)',
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
