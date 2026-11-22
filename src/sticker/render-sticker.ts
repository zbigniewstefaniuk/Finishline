import type { StickerData, StickerStyle } from '~/domain/sticker-data'
import { layoutEditorialSticker } from './editorial-sticker'
import { layoutMinimalSticker } from './minimal-sticker'
import { canvasContext, drawSticker, type StickerLayout } from './sticker-drawing'
import { layoutStripSticker } from './strip-sticker'

const EXPORT_SCALE = 3

const STICKER_LAYOUTS = {
  minimal: layoutMinimalSticker,
  strip: layoutStripSticker,
  editorial: layoutEditorialSticker,
} as const satisfies Record<StickerStyle, (data: StickerData) => StickerLayout>

export type StickerImage = { url: string; width: number; height: number }

export function renderSticker(data: StickerData): StickerImage {
  const layout = STICKER_LAYOUTS[data.style](data)
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
