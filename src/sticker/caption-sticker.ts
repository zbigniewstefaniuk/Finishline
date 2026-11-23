import type { StickerData } from '~/domain/sticker-data'
import {
  FONT_WEIGHT,
  INK_COLORS,
  OPACITY,
  STICKER_PADDING,
  headerRow,
  measureText,
  valueRuns,
  type Run,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

const SEPARATOR = ' · '

const TEXT = {
  title: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.full,
  },
  separator: {
    size: 14,
    lineHeight: 16,
    weight: FONT_WEIGHT.medium,
    tracking: 0,
    opacity: OPACITY.label,
  },
  value: {
    size: 16,
    lineHeight: 18,
    weight: FONT_WEIGHT.bold,
    tracking: -0.01,
    opacity: OPACITY.full,
  },
  unit: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.01,
    opacity: OPACITY.full,
  },
  date: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.medium,
    tracking: 0.16,
    opacity: OPACITY.date,
  },
} as const satisfies Record<string, TextSpec>

export function layoutCaptionSticker(data: StickerData): StickerLayout {
  const separator: Run = { text: SEPARATOR, spec: TEXT.separator }
  const runs: Run[] = [{ text: data.title.toUpperCase(), spec: TEXT.title }]
  for (const stat of [data.hero, ...data.stats]) {
    runs.push(
      separator,
      ...valueRuns({ stat, valueSpec: TEXT.value, unitSpec: TEXT.unit }),
    )
  }
  if (data.date !== null) runs.push(separator, { text: data.date, spec: TEXT.date })
  const line = headerRow({ activity: data.activity, title: measureText(runs) })

  return {
    width: line.width + STICKER_PADDING * 2,
    height: line.height + STICKER_PADDING * 2,
    ink: INK_COLORS[data.ink],
    blocks: line.place({ x: STICKER_PADDING, y: STICKER_PADDING }),
  }
}
