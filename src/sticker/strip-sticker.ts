import type { StickerData } from '~/domain/sticker-data'
import { ICON_BOX } from './activity-icons'
import {
  FONT_WEIGHT,
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
  type Placeable,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

const GAP = {
  aroundRule: 16,
  iconToTitle: 8,
  titleToDate: 8,
  valueToLabel: 6,
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
    size: 10,
    lineHeight: 12,
    weight: FONT_WEIGHT.medium,
    tracking: 0.16,
    opacity: OPACITY.date,
  },
  hero: {
    size: 36,
    lineHeight: 36,
    weight: FONT_WEIGHT.extraBold,
    tracking: -0.04,
    opacity: OPACITY.full,
  },
  heroUnit: {
    size: 15,
    lineHeight: 15,
    weight: FONT_WEIGHT.bold,
    tracking: 0,
    opacity: OPACITY.full,
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
  label: {
    size: 10,
    lineHeight: 12,
    weight: FONT_WEIGHT.semiBold,
    tracking: 0.24,
    opacity: OPACITY.label,
  },
} as const satisfies Record<string, TextSpec>

function valueColumn({
  id,
  value,
  label,
}: {
  id: string
  value: MeasuredText
  label: MeasuredText
}): Placeable {
  return {
    width: Math.max(value.width, label.width),
    height: value.height + GAP.valueToLabel + label.height,
    place: ({ x, y }) => [
      textBlock({ id: `${id}-value`, text: value, x, y }),
      textBlock({
        id: `${id}-label`,
        text: label,
        x,
        y: y + value.height + GAP.valueToLabel,
      }),
    ],
  }
}

function identityColumn({
  data,
  title,
  date,
}: {
  data: StickerData
  title: MeasuredText
  date: MeasuredText | null
}): Placeable {
  const titleOffset = ICON_BOX.height + GAP.iconToTitle
  const dateOffset = titleOffset + title.height + GAP.titleToDate
  return {
    width: Math.max(ICON_BOX.width, title.width, date?.width ?? 0),
    height: date ? dateOffset + date.height : titleOffset + title.height,
    place: ({ x, y }) => [
      iconBlock({ activity: data.activity, x, y }),
      textBlock({ id: 'title', text: title, x, y: y + titleOffset }),
      ...(date ? [textBlock({ id: 'date', text: date, x, y: y + dateOffset })] : []),
    ],
  }
}

export function layoutStripSticker(data: StickerData): StickerLayout {
  const ink = INK_COLORS[data.ink]
  const label = (text: string) =>
    measureText([{ text: text.toUpperCase(), spec: TEXT.label }])

  const columns = [
    identityColumn({
      data,
      title: measureText([{ text: data.title.toUpperCase(), spec: TEXT.title }]),
      date:
        data.date === null ? null : measureText([{ text: data.date, spec: TEXT.date }]),
    }),
    valueColumn({
      id: 'hero',
      value: measureText(
        valueRuns({ stat: data.hero, valueSpec: TEXT.hero, unitSpec: TEXT.heroUnit }),
      ),
      label: label(data.hero.label),
    }),
    ...data.stats.map((stat, index) =>
      valueColumn({
        id: `stat-${index}`,
        value: measureText(
          valueRuns({ stat, valueSpec: TEXT.statValue, unitSpec: TEXT.statUnit }),
        ),
        label: label(stat.label),
      }),
    ),
  ]

  const rowHeight = Math.max(...columns.map((column) => column.height))
  const rowBottom = STICKER_PADDING + rowHeight
  const ruleStep = GAP.aroundRule * 2 + RULE_THICKNESS
  const lefts = columns.map((_column, index) =>
    columns
      .slice(0, index)
      .reduce((left, previous) => left + previous.width + ruleStep, STICKER_PADDING),
  )

  const blocks = columns.flatMap((column, index) => {
    const left = lefts[index] ?? STICKER_PADDING
    const content = column.place({ x: left, y: rowBottom - column.height })
    if (index === 0) return content
    const rule: Block = {
      kind: 'rule',
      id: `rule-${index}`,
      x: left - GAP.aroundRule - RULE_THICKNESS,
      y: STICKER_PADDING,
      width: RULE_THICKNESS,
      height: rowHeight,
    }
    return [rule, ...content]
  })

  const lastLeft = lefts.at(-1) ?? STICKER_PADDING
  const lastWidth = columns.at(-1)?.width ?? 0
  return {
    width: lastLeft + lastWidth + STICKER_PADDING,
    height: rowBottom + STICKER_PADDING,
    ink,
    blocks,
  }
}
