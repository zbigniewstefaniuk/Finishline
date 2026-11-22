import type { SkTypefaceFontProvider } from '@shopify/react-native-skia'
import type { StickerData, StickerStyle } from '~/domain/sticker-data'
import { layoutEditorialSticker } from './editorial-sticker'
import { layoutMinimalSticker } from './minimal-sticker'
import type { StickerLayout } from './sticker-drawing'
import { layoutStripSticker } from './strip-sticker'

type LayoutInput = { data: StickerData; fonts: SkTypefaceFontProvider }

const STICKER_LAYOUTS = {
  minimal: layoutMinimalSticker,
  strip: layoutStripSticker,
  editorial: layoutEditorialSticker,
} as const satisfies Record<StickerStyle, (input: LayoutInput) => StickerLayout>

export function layoutSticker({ data, fonts }: LayoutInput) {
  return STICKER_LAYOUTS[data.style]({ data, fonts })
}
