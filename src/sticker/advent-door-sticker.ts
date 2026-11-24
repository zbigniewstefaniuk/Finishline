import type { AdventStickerData } from '~/domain/sticker-data'
import { SNOW_MARGIN, snowBlocks, snowCapPath } from './snow'
import {
  FONT_WEIGHT,
  INK_COLORS,
  OPACITY,
  STICKER_PADDING,
  measureText,
  textBlock,
  type Block,
  type MeasuredText,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

const DOOR = {
  width: 192,
  height: 224,
  radius: 20,
  lineWidth: 1.75,
  paddingY: 24,
  numberInset: 16,
  snowInset: 7,
  snowDepth: 1.35,
} as const

const TEXT = {
  top: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.28,
    opacity: OPACITY.full,
  },
  number: {
    size: 120,
    lineHeight: 100,
    weight: FONT_WEIGHT.extraBold,
    tracking: -0.05,
    opacity: OPACITY.full,
  },
  bottom: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
} as const satisfies Record<string, TextSpec>

function fittedNumber(text: string) {
  const measured = measureText([{ text, spec: TEXT.number }])
  const maxWidth = DOOR.width - DOOR.numberInset * 2
  if (measured.width <= maxWidth) return measured
  const scale = maxWidth / measured.width
  const spec = {
    ...TEXT.number,
    size: TEXT.number.size * scale,
    lineHeight: TEXT.number.lineHeight * scale,
  }
  return measureText([{ text, spec }])
}

export function layoutAdventDoorSticker(data: AdventStickerData): StickerLayout {
  const top = measureText([{ text: data.door.top.toUpperCase(), spec: TEXT.top }])
  const number = fittedNumber(data.door.number)
  const bottom = measureText([
    { text: data.door.bottom.toUpperCase(), spec: TEXT.bottom },
  ])

  const doorX = SNOW_MARGIN.side + STICKER_PADDING
  const doorY = SNOW_MARGIN.top
  const width = DOOR.width + doorX * 2
  const height = doorY + DOOR.height + STICKER_PADDING
  const centerX = width / 2
  const centered = (text: MeasuredText) => centerX - text.width / 2
  const strokeInset = DOOR.lineWidth / 2

  const blocks: Block[] = [
    ...snowBlocks({ width, height }),
    {
      kind: 'frame',
      id: 'door',
      x: doorX + strokeInset,
      y: doorY + strokeInset,
      width: DOOR.width - DOOR.lineWidth,
      height: DOOR.height - DOOR.lineWidth,
      radius: DOOR.radius,
      lineWidth: DOOR.lineWidth,
    },
    {
      kind: 'fill-path',
      id: 'door-snow',
      x: doorX + DOOR.snowInset,
      y: doorY + strokeInset,
      d: snowCapPath({ width: DOOR.width - DOOR.snowInset * 2, depth: DOOR.snowDepth }),
      opacity: OPACITY.full,
    },
    textBlock({ id: 'door-top', text: top, x: centered(top), y: doorY + DOOR.paddingY }),
    textBlock({
      id: 'door-number',
      text: number,
      x: centered(number),
      y: doorY + (DOOR.height - number.height) / 2,
    }),
    textBlock({
      id: 'door-bottom',
      text: bottom,
      x: centered(bottom),
      y: doorY + DOOR.height - DOOR.paddingY - bottom.height,
    }),
  ]

  return { width, height, ink: INK_COLORS[data.ink], blocks }
}
