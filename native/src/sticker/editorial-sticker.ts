import { FontWeight, type SkTypefaceFontProvider } from '@shopify/react-native-skia'
import type { StickerData } from '~/domain/sticker-data'
import { ICON_BOX } from './activity-icons'
import {
  INK_COLORS,
  OPACITY,
  RULE_THICKNESS,
  STICKER_PADDING,
  iconBlock,
  measureText,
  textBlock,
  valueRuns,
  type Block,
  type MeasuredText,
  type Run,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

const MIN_CONTENT_WIDTH = 240

const GAP = {
  iconToTitle: 10,
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
    weight: FontWeight.SemiBold,
    tracking: 0.28,
    opacity: OPACITY.full,
  },
  hero: {
    size: 96,
    lineHeight: 86,
    weight: FontWeight.ExtraBold,
    tracking: -0.05,
    opacity: OPACITY.full,
  },
  heroUnit: {
    size: 28,
    lineHeight: 28,
    weight: FontWeight.Bold,
    tracking: -0.01,
    opacity: OPACITY.full,
  },
  heroLabel: {
    size: 11,
    lineHeight: 13,
    weight: FontWeight.SemiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  statLabel: {
    size: 10,
    lineHeight: 12,
    weight: FontWeight.SemiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  statValue: {
    size: 22,
    lineHeight: 22,
    weight: FontWeight.Bold,
    tracking: -0.02,
    opacity: OPACITY.full,
  },
  statUnit: {
    size: 11,
    lineHeight: 11,
    weight: FontWeight.SemiBold,
    tracking: 0.01,
    opacity: OPACITY.full,
  },
  date: {
    size: 12,
    lineHeight: 14,
    weight: FontWeight.Medium,
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

export function layoutEditorialSticker({
  data,
  fonts,
}: {
  data: StickerData
  fonts: SkTypefaceFontProvider
}): StickerLayout {
  const ink = INK_COLORS[data.ink]
  const measure = (runs: Run[]) => measureText({ runs, fonts, ink })

  const title = measure([{ text: data.title.toUpperCase(), spec: TEXT.title }])
  const hero = measure(
    valueRuns({ stat: data.hero, valueSpec: TEXT.hero, unitSpec: TEXT.heroUnit }),
  )
  const heroLabel = measure([
    { text: data.hero.label.toUpperCase(), spec: TEXT.heroLabel },
  ])
  const date = data.date === null ? null : measure([{ text: data.date, spec: TEXT.date }])
  const rows: StatRow[] = data.stats.map((stat) => ({
    label: measure([{ text: stat.label.toUpperCase(), spec: TEXT.statLabel }]),
    value: measure(
      valueRuns({ stat, valueSpec: TEXT.statValue, unitSpec: TEXT.statUnit }),
    ),
  }))

  const headerWidth = ICON_BOX.width + GAP.iconToTitle + title.width
  const contentWidth = Math.max(
    MIN_CONTENT_WIDTH,
    headerWidth,
    hero.width,
    heroLabel.width,
    date?.width ?? 0,
    ...rows.map((row) => row.label.width + GAP.labelToValue + row.value.width),
  )
  const right = STICKER_PADDING + contentWidth

  const headerHeight = Math.max(ICON_BOX.height, title.height)
  const headerTop = STICKER_PADDING
  const heroY = headerTop + headerHeight + GAP.afterHeader
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
    iconBlock({
      activity: data.activity,
      x: STICKER_PADDING,
      y: headerTop + (headerHeight - ICON_BOX.height) / 2,
    }),
    textBlock({
      id: 'title',
      text: title,
      x: STICKER_PADDING + ICON_BOX.width + GAP.iconToTitle,
      y: headerTop + (headerHeight - title.height) / 2,
    }),
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
