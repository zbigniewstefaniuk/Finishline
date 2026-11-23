import type { StickerData } from '~/domain/sticker-data'
import {
  FONT_WEIGHT,
  INK_COLORS,
  OPACITY,
  STICKER_PADDING,
  headerRow,
  measureText,
  textBlock,
  valueRuns,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

const GAP = {
  afterHeader: 14,
  betweenRows: 6,
  valueToLabel: 12,
  beforeDate: 14,
} as const

const TEXT = {
  title: {
    size: 13,
    lineHeight: 16,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.28,
    opacity: OPACITY.full,
  },
  value: {
    size: 40,
    lineHeight: 40,
    weight: FONT_WEIGHT.extraBold,
    tracking: -0.035,
    opacity: OPACITY.full,
  },
  unit: {
    size: 16,
    lineHeight: 16,
    weight: FONT_WEIGHT.bold,
    tracking: 0,
    opacity: OPACITY.full,
  },
  label: {
    size: 10,
    lineHeight: 12,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  date: {
    size: 12,
    lineHeight: 14,
    weight: FONT_WEIGHT.medium,
    tracking: 0.16,
    opacity: OPACITY.date,
  },
} as const satisfies Record<string, TextSpec>

export function layoutStackSticker(data: StickerData): StickerLayout {
  const ink = INK_COLORS[data.ink]
  const header = headerRow({
    activity: data.activity,
    title: measureText([{ text: data.title.toUpperCase(), spec: TEXT.title }]),
  })
  const date =
    data.date === null ? null : measureText([{ text: data.date, spec: TEXT.date }])
  const rows = [data.hero, ...data.stats].map((stat) => ({
    value: measureText(valueRuns({ stat, valueSpec: TEXT.value, unitSpec: TEXT.unit })),
    label: measureText([{ text: stat.label.toUpperCase(), spec: TEXT.label }]),
  }))

  const valueColumnWidth = Math.max(...rows.map((row) => row.value.width))
  const labelX = STICKER_PADDING + valueColumnWidth + GAP.valueToLabel
  const labelColumnWidth = Math.max(...rows.map((row) => row.label.width))
  const contentWidth = Math.max(
    header.width,
    valueColumnWidth + GAP.valueToLabel + labelColumnWidth,
    date?.width ?? 0,
  )

  const rowsTop = STICKER_PADDING + header.height + GAP.afterHeader
  const rowTops = rows.map((_row, index) =>
    rows
      .slice(0, index)
      .reduce((top, previous) => top + previous.value.height + GAP.betweenRows, rowsTop),
  )
  const lastRow = rows.at(-1)
  const rowsBottom = (rowTops.at(-1) ?? rowsTop) + (lastRow?.value.height ?? 0)
  const dateY = rowsBottom + GAP.beforeDate

  const rowBlocks = rows.flatMap((row, index) => {
    const top = rowTops[index] ?? rowsTop
    return [
      textBlock({ id: `value-${index}`, text: row.value, x: STICKER_PADDING, y: top }),
      textBlock({
        id: `label-${index}`,
        text: row.label,
        x: labelX,
        y: top + row.value.baseline - row.label.baseline,
      }),
    ]
  })

  return {
    width: contentWidth + STICKER_PADDING * 2,
    height: (date ? dateY + date.height : rowsBottom) + STICKER_PADDING,
    ink,
    blocks: [
      ...header.place({ x: STICKER_PADDING, y: STICKER_PADDING }),
      ...rowBlocks,
      ...(date
        ? [textBlock({ id: 'date', text: date, x: STICKER_PADDING, y: dateY })]
        : []),
    ],
  }
}
