import type { StickerData } from '~/domain/sticker-data'
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

const MIN_CONTENT_WIDTH = 240

const GAP = {
  afterHeader: 14,
  afterHero: 10,
  beforeStats: 20,
  rowPadding: 11,
  labelToValue: 24,
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
  hero: {
    size: 96,
    lineHeight: 86,
    weight: FONT_WEIGHT.extraBold,
    tracking: -0.05,
    opacity: OPACITY.full,
  },
  heroUnit: {
    size: 28,
    lineHeight: 28,
    weight: FONT_WEIGHT.bold,
    tracking: -0.01,
    opacity: OPACITY.full,
  },
  heroLabel: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  statLabel: {
    size: 10,
    lineHeight: 12,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  statValue: {
    size: 22,
    lineHeight: 22,
    weight: FONT_WEIGHT.bold,
    tracking: -0.02,
    opacity: OPACITY.full,
  },
  statUnit: {
    size: 11,
    lineHeight: 11,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.01,
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

type StatRow = { label: MeasuredText; value: MeasuredText }

function layoutRow({
  row,
  index,
  top,
  right,
}: {
  row: StatRow
  index: number
  top: number
  right: number
}) {
  const contentTop = top + RULE_THICKNESS + GAP.rowPadding
  const baseline = Math.max(row.label.baseline, row.value.baseline)
  const labelY = contentTop + baseline - row.label.baseline
  const valueY = contentTop + baseline - row.value.baseline
  const contentBottom = Math.max(labelY + row.label.height, valueY + row.value.height)
  const blocks: Block[] = [
    {
      kind: 'rule',
      id: `rule-${index}`,
      x: STICKER_PADDING,
      y: top,
      width: right - STICKER_PADDING,
      height: RULE_THICKNESS,
    },
    textBlock({
      id: `stat-label-${index}`,
      text: row.label,
      x: STICKER_PADDING,
      y: labelY,
    }),
    textBlock({
      id: `stat-value-${index}`,
      text: row.value,
      x: right - row.value.width,
      y: valueY,
    }),
  ]
  return { blocks, bottom: contentBottom + GAP.rowPadding }
}

export function layoutEditorialSticker(data: StickerData): StickerLayout {
  const ink = INK_COLORS[data.ink]

  const header = headerRow({
    activity: data.activity,
    title: measureText([{ text: data.title.toUpperCase(), spec: TEXT.title }]),
  })
  const hero = measureText(
    valueRuns({ stat: data.hero, valueSpec: TEXT.hero, unitSpec: TEXT.heroUnit }),
  )
  const heroLabel = measureText([
    { text: data.hero.label.toUpperCase(), spec: TEXT.heroLabel },
  ])
  const date =
    data.date === null ? null : measureText([{ text: data.date, spec: TEXT.date }])
  const rows: StatRow[] = data.stats.map((stat) => ({
    label: measureText([{ text: stat.label.toUpperCase(), spec: TEXT.statLabel }]),
    value: measureText(
      valueRuns({ stat, valueSpec: TEXT.statValue, unitSpec: TEXT.statUnit }),
    ),
  }))

  const contentWidth = Math.max(
    MIN_CONTENT_WIDTH,
    header.width,
    hero.width,
    heroLabel.width,
    date?.width ?? 0,
    ...rows.map((row) => row.label.width + GAP.labelToValue + row.value.width),
  )
  const right = STICKER_PADDING + contentWidth

  const heroY = STICKER_PADDING + header.height + GAP.afterHeader
  const heroLabelY = heroY + hero.height + GAP.afterHero
  const heroBottom = heroLabelY + heroLabel.height

  const rowBlocks: Block[] = []
  let rowTop = heroBottom + GAP.beforeStats
  for (const [index, row] of rows.entries()) {
    const placed = layoutRow({ row, index, top: rowTop, right })
    rowBlocks.push(...placed.blocks)
    rowTop = placed.bottom
  }
  const contentBottom = rows.length > 0 ? rowTop : heroBottom
  const dateY = contentBottom + GAP.beforeDate

  const blocks: Block[] = [
    ...header.place({ x: STICKER_PADDING, y: STICKER_PADDING }),
    textBlock({ id: 'hero', text: hero, x: STICKER_PADDING, y: heroY }),
    textBlock({ id: 'hero-label', text: heroLabel, x: STICKER_PADDING, y: heroLabelY }),
    ...rowBlocks,
    ...(date
      ? [textBlock({ id: 'date', text: date, x: STICKER_PADDING, y: dateY })]
      : []),
  ]

  return {
    width: right + STICKER_PADDING,
    height: (date ? dateY + date.height : contentBottom) + STICKER_PADDING,
    ink,
    blocks,
  }
}
