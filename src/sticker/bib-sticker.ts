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

const BIB = {
  lineWidth: 1.75,
  radius: 12,
  padding: 18,
  minInnerWidth: 188,
} as const

const PIN_HOLE = {
  size: 6,
  inset: 9,
  lineWidth: 1.5,
} as const

const GAP = {
  afterHeader: 12,
  afterHero: 4,
  aroundRule: 14,
  statValueToLabel: 5,
  statColumns: 20,
} as const

const TEXT = {
  title: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.full,
  },
  date: {
    size: 11,
    lineHeight: 13,
    weight: FONT_WEIGHT.medium,
    tracking: 0.16,
    opacity: OPACITY.date,
  },
  hero: {
    size: 68,
    lineHeight: 64,
    weight: FONT_WEIGHT.extraBold,
    tracking: -0.05,
    opacity: OPACITY.full,
  },
  heroUnit: {
    size: 20,
    lineHeight: 20,
    weight: FONT_WEIGHT.bold,
    tracking: -0.01,
    opacity: OPACITY.full,
  },
  heroLabel: {
    size: 10,
    lineHeight: 12,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  statValue: {
    size: 15,
    lineHeight: 15,
    weight: FONT_WEIGHT.bold,
    tracking: -0.01,
    opacity: OPACITY.full,
  },
  statUnit: {
    size: 10,
    lineHeight: 10,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.01,
    opacity: OPACITY.full,
  },
  statLabel: {
    size: 9,
    lineHeight: 11,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
} as const satisfies Record<string, TextSpec>

type StatColumn = { value: MeasuredText; label: MeasuredText; width: number }

function pinHoles({ width, height }: { width: number; height: number }): Block[] {
  const near = STICKER_PADDING + PIN_HOLE.inset
  const farX = STICKER_PADDING + width - PIN_HOLE.inset - PIN_HOLE.size
  const farY = STICKER_PADDING + height - PIN_HOLE.inset - PIN_HOLE.size
  const corners = [
    { x: near, y: near },
    { x: farX, y: near },
    { x: near, y: farY },
    { x: farX, y: farY },
  ]
  return corners.map(({ x, y }, index): Block => ({
    kind: 'frame',
    id: `pin-hole-${index}`,
    x,
    y,
    width: PIN_HOLE.size,
    height: PIN_HOLE.size,
    radius: PIN_HOLE.size / 2,
    lineWidth: PIN_HOLE.lineWidth,
  }))
}

function statBlocks({
  columns,
  left,
  width,
  valueY,
  labelY,
}: {
  columns: StatColumn[]
  left: number
  width: number
  valueY: number
  labelY: number
}) {
  const slotWidth = width / columns.length
  return columns.flatMap((column, index) => {
    const center = left + slotWidth * (index + 0.5)
    return [
      textBlock({
        id: `stat-value-${index}`,
        text: column.value,
        x: center - column.value.width / 2,
        y: valueY,
      }),
      textBlock({
        id: `stat-label-${index}`,
        text: column.label,
        x: center - column.label.width / 2,
        y: labelY,
      }),
    ]
  })
}

export function layoutBibSticker(data: StickerData): StickerLayout {
  const ink = INK_COLORS[data.ink]
  const header = headerRow({
    activity: data.activity,
    title: measureText([
      { text: data.title.toUpperCase(), spec: TEXT.title },
      ...(data.date === null ? [] : [{ text: ` · ${data.date}`, spec: TEXT.date }]),
    ]),
  })
  const hero = measureText(
    valueRuns({ stat: data.hero, valueSpec: TEXT.hero, unitSpec: TEXT.heroUnit }),
  )
  const heroLabel = measureText([
    { text: data.hero.label.toUpperCase(), spec: TEXT.heroLabel },
  ])
  const columns = data.stats.map((stat) => {
    const value = measureText(
      valueRuns({ stat, valueSpec: TEXT.statValue, unitSpec: TEXT.statUnit }),
    )
    const label = measureText([{ text: stat.label.toUpperCase(), spec: TEXT.statLabel }])
    return { value, label, width: Math.max(value.width, label.width) }
  })

  const hasStats = columns.length > 0
  const widestStat = Math.max(0, ...columns.map((column) => column.width))
  const statsWidth = columns.length * (widestStat + GAP.statColumns)
  const innerWidth = Math.max(
    BIB.minInnerWidth,
    header.width,
    hero.width,
    heroLabel.width,
    statsWidth,
  )
  const innerLeft = STICKER_PADDING + BIB.padding
  const centerX = innerLeft + innerWidth / 2

  const headerY = STICKER_PADDING + BIB.padding
  const heroY = headerY + header.height + GAP.afterHeader
  const heroLabelY = heroY + hero.height + GAP.afterHero
  const heroBottom = heroLabelY + heroLabel.height
  const ruleY = heroBottom + GAP.aroundRule
  const statValueY = ruleY + RULE_THICKNESS + GAP.aroundRule
  const valueHeight = Math.max(0, ...columns.map((column) => column.value.height))
  const statLabelY = statValueY + valueHeight + GAP.statValueToLabel
  const labelHeight = Math.max(0, ...columns.map((column) => column.label.height))
  const contentBottom = hasStats ? statLabelY + labelHeight : heroBottom

  const frameWidth = innerWidth + BIB.padding * 2
  const frameHeight = contentBottom + BIB.padding - STICKER_PADDING

  const blocks: Block[] = [
    {
      kind: 'frame',
      id: 'bib',
      x: STICKER_PADDING,
      y: STICKER_PADDING,
      width: frameWidth,
      height: frameHeight,
      radius: BIB.radius,
      lineWidth: BIB.lineWidth,
    },
    ...pinHoles({ width: frameWidth, height: frameHeight }),
    ...header.place({ x: centerX - header.width / 2, y: headerY }),
    textBlock({ id: 'hero', text: hero, x: centerX - hero.width / 2, y: heroY }),
    textBlock({
      id: 'hero-label',
      text: heroLabel,
      x: centerX - heroLabel.width / 2,
      y: heroLabelY,
    }),
    ...(hasStats
      ? [
          {
            kind: 'rule' as const,
            id: 'rule',
            x: innerLeft,
            y: ruleY,
            width: innerWidth,
            height: RULE_THICKNESS,
          },
          ...statBlocks({
            columns,
            left: innerLeft,
            width: innerWidth,
            valueY: statValueY,
            labelY: statLabelY,
          }),
        ]
      : []),
  ]

  return {
    width: frameWidth + STICKER_PADDING * 2,
    height: frameHeight + STICKER_PADDING * 2,
    ink,
    blocks,
  }
}
