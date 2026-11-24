import type { StickerData, StickerStyle } from '~/domain/sticker-data'
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

export function renderSticker(data: StickerData): StickerImage {
  const { layout: layoutSticker, badgeAlign } = STICKER_LAYOUTS[data.style]
  const plain = layoutSticker(data)
  const layout =
    data.badge === null
      ? plain
      : withSeasonBadge({ layout: plain, label: data.badge, align: badgeAlign })
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
