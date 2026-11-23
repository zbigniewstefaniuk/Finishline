import type { StickerData, StickerStat } from '~/domain/sticker-data'
import {
  FONT_WEIGHT,
  INK_COLORS,
  OPACITY,
  RULE_THICKNESS,
  STICKER_PADDING,
  headerRow,
  measureText,
  textBlock,
  valueRuns,
  type Block,
  type MeasuredText,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

const MIN_COLUMN_WIDTH = 96

const GAP = {
  afterHeader: 16,
  aroundRule: 14,
  labelToValue: 7,
  beforeDate: 16,
} as const

const TEXT = {
  title: {
    size: 13,
    lineHeight: 16,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.28,
    opacity: OPACITY.full,
  },
  label: {
    size: 10,
    lineHeight: 12,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  value: {
    size: 30,
    lineHeight: 30,
    weight: FONT_WEIGHT.extraBold,
    tracking: -0.03,
    opacity: OPACITY.full,
  },
  unit: {
    size: 13,
    lineHeight: 13,
    weight: FONT_WEIGHT.bold,
    tracking: 0,
    opacity: OPACITY.full,
  },
  date: {
    size: 12,
    lineHeight: 14,
    weight: FONT_WEIGHT.medium,
    tracking: 0.16,
    opacity: OPACITY.date,
  },
} as const satisfies Record<string, TextSpec>

type Cell = { label: MeasuredText; value: MeasuredText; width: number }

function measureCell(stat: StickerStat): Cell {
  const label = measureText([{ text: stat.label.toUpperCase(), spec: TEXT.label }])
  const value = measureText(
    valueRuns({ stat, valueSpec: TEXT.value, unitSpec: TEXT.unit }),
  )
  return { label, value, width: Math.max(label.width, value.width) }
}

function rowsOf(cells: Cell[]) {
  const heroSpansRow = cells.length % 2 === 1
  const paired = heroSpansRow ? cells.slice(1) : cells
  const pairs = Array.from({ length: paired.length / 2 }, (_pair, index) =>
    paired.slice(index * 2, index * 2 + 2),
  )
  return heroSpansRow ? [cells.slice(0, 1), ...pairs] : pairs
}

export function layoutGridSticker(data: StickerData): StickerLayout {
  const ink = INK_COLORS[data.ink]
  const header = headerRow({
    activity: data.activity,
    title: measureText([{ text: data.title.toUpperCase(), spec: TEXT.title }]),
  })
  const date =
    data.date === null ? null : measureText([{ text: data.date, spec: TEXT.date }])
  const rows = rowsOf([data.hero, ...data.stats].map(measureCell))
  const cells = rows.flat()

  const hasColumns = rows.some((row) => row.length === 2)
  const widestCell = Math.max(...cells.map((cell) => cell.width))
  const columnStep = GAP.aroundRule * 2 + RULE_THICKNESS
  const gridWidth = hasColumns
    ? Math.max(MIN_COLUMN_WIDTH, widestCell) * 2 + columnStep
    : widestCell
  const contentWidth = Math.max(header.width, gridWidth, date?.width ?? 0)
  const columnWidth = (contentWidth - columnStep) / 2
  const right = STICKER_PADDING + contentWidth

  const cellHeight = Math.max(
    ...cells.map((cell) => cell.label.height + GAP.labelToValue + cell.value.height),
  )
  const gridTop = STICKER_PADDING + header.height + GAP.afterHeader
  const rowStep = cellHeight + GAP.aroundRule * 2 + RULE_THICKNESS
  const lastRow = rows.length - 1

  const gridBlocks: Block[] = []
  for (const [rowIndex, row] of rows.entries()) {
    const top = gridTop + rowIndex * rowStep
    if (rowIndex > 0) {
      gridBlocks.push({
        kind: 'rule',
        id: `rule-row-${rowIndex}`,
        x: STICKER_PADDING,
        y: top - GAP.aroundRule - RULE_THICKNESS,
        width: contentWidth,
        height: RULE_THICKNESS,
      })
    }
    if (row.length === 2) {
      const ruleTop = rowIndex === 0 ? top : top - GAP.aroundRule
      const ruleBottom = top + cellHeight + (rowIndex === lastRow ? 0 : GAP.aroundRule)
      gridBlocks.push({
        kind: 'rule',
        id: `rule-column-${rowIndex}`,
        x: STICKER_PADDING + columnWidth + GAP.aroundRule,
        y: ruleTop,
        width: RULE_THICKNESS,
        height: ruleBottom - ruleTop,
      })
    }
    for (const [columnIndex, cell] of row.entries()) {
      const x = columnIndex === 0 ? STICKER_PADDING : right - columnWidth
      gridBlocks.push(
        textBlock({
          id: `label-${rowIndex}-${columnIndex}`,
          text: cell.label,
          x,
          y: top,
        }),
        textBlock({
          id: `value-${rowIndex}-${columnIndex}`,
          text: cell.value,
          x,
          y: top + cell.label.height + GAP.labelToValue,
        }),
      )
    }
  }

  const gridBottom = gridTop + lastRow * rowStep + cellHeight
  const dateY = gridBottom + GAP.beforeDate

  return {
    width: right + STICKER_PADDING,
    height: (date ? dateY + date.height : gridBottom) + STICKER_PADDING,
    ink,
    blocks: [
      ...header.place({ x: STICKER_PADDING, y: STICKER_PADDING }),
      ...gridBlocks,
      ...(date
        ? [textBlock({ id: 'date', text: date, x: STICKER_PADDING, y: dateY })]
        : []),
    ],
  }
}
