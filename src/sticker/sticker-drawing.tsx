import {
  Group,
  Paragraph,
  Path,
  Rect,
  Skia,
  type FontWeight,
  type SkParagraph,
  type SkTextStyle,
  type SkTypefaceFontProvider,
} from '@shopify/react-native-skia'
import type { ActivityType } from '~/domain/activity'
import type { StickerInk, StickerStat } from '~/domain/sticker-data'
import { ACTIVITY_ICONS, ICON_BOX, ICON_SECONDARY_OPACITY } from './activity-icons'
import { STICKER_FONT_FAMILY } from './sticker-fonts'

export const INK_COLORS = {
  light: '#F2EEE5',
  dark: '#151514',
} as const satisfies Record<StickerInk, string>

export const STICKER_PADDING = 20
export const RULE_THICKNESS = 1

export const OPACITY = {
  full: 1,
  label: 0.7,
  rule: 0.35,
  date: 0.55,
} as const

const LAYOUT_WIDTH = 2000
const THIN_SPACE = ' '

export type TextSpec = {
  size: number
  lineHeight: number
  weight: FontWeight
  tracking: number
  opacity: number
}

export type Run = { text: string; spec: TextSpec }

export type MeasuredText = {
  paragraph: SkParagraph
  width: number
  height: number
  baseline: number
}

export type Block =
  | { kind: 'text'; id: string; paragraph: SkParagraph; x: number; y: number }
  | { kind: 'icon'; id: string; x: number; y: number; primary: string; secondary: string }
  | { kind: 'rule'; id: string; x: number; y: number; width: number; height: number }

export type StickerLayout = {
  width: number
  height: number
  ink: string
  blocks: Block[]
}

function textStyle({ spec, ink }: { spec: TextSpec; ink: string }): SkTextStyle {
  return {
    color: Skia.Color(ink).map((channel, index) =>
      index === 3 ? spec.opacity : channel,
    ),
    fontFamilies: [STICKER_FONT_FAMILY],
    fontSize: spec.size,
    fontStyle: { weight: spec.weight },
    letterSpacing: spec.tracking * spec.size,
    heightMultiplier: spec.lineHeight / spec.size,
    halfLeading: true,
  }
}

export function measureText({
  runs,
  fonts,
  ink,
}: {
  runs: Run[]
  fonts: SkTypefaceFontProvider
  ink: string
}): MeasuredText {
  const builder = Skia.ParagraphBuilder.Make({}, fonts)
  for (const run of runs) {
    builder
      .pushStyle(textStyle({ spec: run.spec, ink }))
      .addText(run.text)
      .pop()
  }
  const paragraph = builder.build()
  paragraph.layout(LAYOUT_WIDTH)
  const lastSpec = runs.at(-1)?.spec
  const trailingTracking = lastSpec ? lastSpec.tracking * lastSpec.size : 0
  const height = paragraph.getHeight()
  return {
    paragraph,
    width: paragraph.getLongestLine() - trailingTracking,
    height,
    baseline: paragraph.getLineMetrics()[0]?.baseline ?? height,
  }
}

export function valueRuns({
  stat,
  valueSpec,
  unitSpec,
}: {
  stat: StickerStat
  valueSpec: TextSpec
  unitSpec: TextSpec
}): Run[] {
  const value = { text: stat.value, spec: valueSpec }
  if (!stat.unit) return [value]
  return [value, { text: THIN_SPACE + stat.unit, spec: unitSpec }]
}

export function textBlock({
  id,
  text,
  x,
  y,
}: {
  id: string
  text: MeasuredText
  x: number
  y: number
}): Block {
  return { kind: 'text', id, paragraph: text.paragraph, x, y }
}

export function iconBlock({
  activity,
  x,
  y,
}: {
  activity: ActivityType
  x: number
  y: number
}): Block {
  return { kind: 'icon', id: 'icon', x, y, ...ACTIVITY_ICONS[activity] }
}

export function StickerDrawing({ layout }: { layout: StickerLayout }) {
  return (
    <Group>
      {layout.blocks.map((block) => {
        switch (block.kind) {
          case 'text': {
            return (
              <Paragraph
                key={block.id}
                paragraph={block.paragraph}
                x={block.x}
                y={block.y}
                width={LAYOUT_WIDTH}
              />
            )
          }
          case 'icon': {
            return (
              <Group
                key={block.id}
                transform={[{ translateX: block.x }, { translateY: block.y }]}
                style="stroke"
                strokeWidth={ICON_BOX.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
                color={layout.ink}
              >
                <Path path={block.primary} />
                <Path path={block.secondary} opacity={ICON_SECONDARY_OPACITY} />
              </Group>
            )
          }
          case 'rule': {
            return (
              <Rect
                key={block.id}
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                color={layout.ink}
                opacity={OPACITY.rule}
              />
            )
          }
        }
      })}
    </Group>
  )
}
