import type { StickerData, StickerSource, StickerStyle } from '~/domain/sticker-data'
import { layoutAdventDoorSticker } from './advent-door-sticker'
import { layoutBibSticker } from './bib-sticker'
import { layoutCaptionSticker } from './caption-sticker'
import { layoutEditorialSticker } from './editorial-sticker'
import { layoutGridSticker } from './grid-sticker'
import { layoutMinimalSticker } from './minimal-sticker'
import { withSeasonBadge, type BadgeAlign } from './season-badge'
import { canvasContext, drawSticker, type StickerLayout } from './sticker-drawing'
import { layoutStackSticker } from './stack-sticker'
import { layoutStripSticker } from './strip-sticker'

const EXPORT_SCALE = 3

const STICKER_LAYOUTS = {
  minimal: { layout: layoutMinimalSticker, badgeAlign: 'center' },
  strip: { layout: layoutStripSticker, badgeAlign: 'start' },
  editorial: { layout: layoutEditorialSticker, badgeAlign: 'start' },
  grid: { layout: layoutGridSticker, badgeAlign: 'start' },
  stack: { layout: layoutStackSticker, badgeAlign: 'start' },
  caption: { layout: layoutCaptionSticker, badgeAlign: 'start' },
  bib: { layout: layoutBibSticker, badgeAlign: 'center' },
} as const satisfies Record<
  StickerStyle,
  { layout: (data: StickerData) => StickerLayout; badgeAlign: BadgeAlign }
>

export type StickerImage = { url: string; width: number; height: number }

function layoutWorkoutSticker(data: StickerData) {
  const { layout: layoutSticker, badgeAlign } = STICKER_LAYOUTS[data.style]
  const plain = layoutSticker(data)
  if (data.badge === null) return plain
  return withSeasonBadge({ layout: plain, label: data.badge, align: badgeAlign })
}

export function renderSticker(source: StickerSource): StickerImage {
  const layout =
    source.kind === 'advent'
      ? layoutAdventDoorSticker(source.data)
      : layoutWorkoutSticker(source.data)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(layout.width * EXPORT_SCALE)
  canvas.height = Math.ceil(layout.height * EXPORT_SCALE)
  const context = canvasContext(canvas)
  context.scale(EXPORT_SCALE, EXPORT_SCALE)
  drawSticker({ context, layout })
  return {
    url: canvas.toDataURL('image/png'),
    width: layout.width,
    height: layout.height,
  }
}
