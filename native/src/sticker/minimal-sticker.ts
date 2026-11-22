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

const MIN_RULE_WIDTH = 220
const DENSE_STAT_COUNT = 3

const GAP = {
  afterIcon: 12,
  afterTitle: 12,
  afterHero: 8,
  beforeRule: 20,
  afterRule: 18,
  beforeStatLabel: 7,
  beforeDate: 22,
  columns: 44,
  denseColumns: 28,
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
    size: 72,
    lineHeight: 72,
    weight: FontWeight.ExtraBold,
    tracking: -0.045,
    opacity: OPACITY.full,
  },
  heroUnit: {
    size: 26,
    lineHeight: 26,
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
  statValue: {
    size: 28,
    lineHeight: 28,
    weight: FontWeight.Bold,
    tracking: -0.02,
    opacity: OPACITY.full,
  },
  denseStatValue: {
    size: 24,
    lineHeight: 24,
    weight: FontWeight.Bold,
    tracking: -0.02,
    opacity: OPACITY.full,
  },
  statUnit: {
    size: 12,
    lineHeight: 12,
    weight: FontWeight.SemiBold,
    tracking: 0.01,
    opacity: OPACITY.full,
  },
  statLabel: {
    size: 10,
    lineHeight: 12,
    weight: FontWeight.SemiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
  date: {
    size: 12,
    lineHeight: 14,
    weight: FontWeight.Medium,
    tracking: 0.16,
    opacity: OPACITY.date,
  },
} as const satisfies Record<string, TextSpec>

export function layoutMinimalSticker({
  data,
  fonts,
}: {
  data: StickerData
  fonts: SkTypefaceFontProvider
}): StickerLayout {
  const ink = INK_COLORS[data.ink]
  const measure = (runs: Run[]) => measureText({ runs, fonts, ink })
  const isDense = data.stats.length >= DENSE_STAT_COUNT
  const valueSpec = isDense ? TEXT.denseStatValue : TEXT.statValue
  const columnGap = isDense ? GAP.denseColumns : GAP.columns

  const title = measure([{ text: data.title.toUpperCase(), spec: TEXT.title }])
  const hero = measure(
    valueRuns({ stat: data.hero, valueSpec: TEXT.hero, unitSpec: TEXT.heroUnit }),
  )
  const heroLabel = measure([
    { text: data.hero.label.toUpperCase(), spec: TEXT.heroLabel },
  ])
  const date = data.date === null ? null : measure([{ text: data.date, spec: TEXT.date }])
  const columns = data.stats.map((stat) => {
    const value = measure(valueRuns({ stat, valueSpec, unitSpec: TEXT.statUnit }))
    const label = measure([{ text: stat.label.toUpperCase(), spec: TEXT.statLabel }])
    return { value, label, width: Math.max(value.width, label.width) }
  })

  const hasStats = columns.length > 0
  const rowWidth =
    columns.reduce((sum, column) => sum + column.width, 0) +
    columnGap * Math.max(columns.length - 1, 0)
  const ruleWidth = hasStats ? Math.max(rowWidth, MIN_RULE_WIDTH) : 0
  const contentWidth = Math.max(
    ICON_BOX.width,
    title.width,
    hero.width,
    heroLabel.width,
    ruleWidth,
    date?.width ?? 0,
  )
  const width = contentWidth + STICKER_PADDING * 2
  const centerX = width / 2
  const centered = (text: MeasuredText) => centerX - text.width / 2

  const iconY = STICKER_PADDING
  const titleY = iconY + ICON_BOX.height + GAP.afterIcon
  const heroY = titleY + title.height + GAP.afterTitle
  const heroLabelY = heroY + hero.height + GAP.afterHero
  const heroBottom = heroLabelY + heroLabel.height
  const ruleY = heroBottom + GAP.beforeRule
  const statValueY = ruleY + RULE_THICKNESS + GAP.afterRule
  const valueHeight = Math.max(0, ...columns.map((column) => column.value.height))
  const statLabelY = statValueY + valueHeight + GAP.beforeStatLabel
  const labelHeight = Math.max(0, ...columns.map((column) => column.label.height))
  const contentBottom = hasStats ? statLabelY + labelHeight : heroBottom
  const dateY = contentBottom + GAP.beforeDate
  const height = (date ? dateY + date.height : contentBottom) + STICKER_PADDING

  const rowLeft = centerX - rowWidth / 2
  const columnBlocks = columns.flatMap((column, index) => {
    const left =
      rowLeft +
      columns
        .slice(0, index)
        .reduce((sum, previous) => sum + previous.width + columnGap, 0)
    const columnCenter = left + column.width / 2
    return [
      textBlock({
        id: `stat-value-${index}`,
        text: column.value,
        x: columnCenter - column.value.width / 2,
        y: statValueY,
      }),
      textBlock({
        id: `stat-label-${index}`,
        text: column.label,
        x: columnCenter - column.label.width / 2,
        y: statLabelY,
      }),
    ]
  })

  const blocks: Block[] = [
    iconBlock({ activity: data.activity, x: centerX - ICON_BOX.width / 2, y: iconY }),
    textBlock({ id: 'title', text: title, x: centered(title), y: titleY }),
    textBlock({ id: 'hero', text: hero, x: centered(hero), y: heroY }),
    textBlock({
      id: 'hero-label',
      text: heroLabel,
      x: centered(heroLabel),
      y: heroLabelY,
    }),
    ...(hasStats
      ? [
          {
            kind: 'rule' as const,
            id: 'rule',
            x: centerX - ruleWidth / 2,
            y: ruleY,
            width: ruleWidth,
            height: RULE_THICKNESS,
          },
          ...columnBlocks,
        ]
      : []),
    ...(date ? [textBlock({ id: 'date', text: date, x: centered(date), y: dateY })] : []),
  ]

  return { width, height, ink, blocks }
}
