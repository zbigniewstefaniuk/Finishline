import { SNOW_MARGIN, snowBlocks, snowCapPath, snowflakePath } from './snow'
import {
  FONT_WEIGHT,
  OPACITY,
  STICKER_PADDING,
  measureText,
  textBlock,
  type Block,
  type StickerLayout,
  type TextSpec,
} from './sticker-drawing'

export type BadgeAlign = 'center' | 'start'

const BADGE = {
  height: 24,
  lineWidth: 1.5,
  paddingStart: 11,
  paddingEnd: 14,
  glyphSize: 12,
  glyphRadius: 5.25,
  glyphLineWidth: 1.1,
  glyphGap: 8,
  gapBelow: 16,
  snowDepth: 1,
} as const

const BADGE_TEXT = {
  size: 10,
  lineHeight: 12,
  weight: FONT_WEIGHT.semiBold,
  tracking: 0.24,
  opacity: OPACITY.full,
} as const satisfies TextSpec

export function withSeasonBadge({
  layout,
  label,
  align,
}: {
  layout: StickerLayout
  label: string
  align: BadgeAlign
}): StickerLayout {
  const text = measureText([{ text: label.toUpperCase(), spec: BADGE_TEXT }])
  const badgeWidth =
    BADGE.paddingStart + BADGE.glyphSize + BADGE.glyphGap + text.width + BADGE.paddingEnd
  const contentWidth = Math.max(layout.width, badgeWidth + STICKER_PADDING * 2)
  const width = contentWidth + SNOW_MARGIN.side * 2
  const badgeX =
    align === 'center' ? (width - badgeWidth) / 2 : SNOW_MARGIN.side + STICKER_PADDING
  const badgeY = SNOW_MARGIN.top
  const layoutX = align === 'center' ? (width - layout.width) / 2 : SNOW_MARGIN.side
  const layoutY = badgeY + BADGE.height + BADGE.gapBelow - STICKER_PADDING
  const height = layoutY + layout.height
  const strokeInset = BADGE.lineWidth / 2
  const glyphLeft = badgeX + BADGE.paddingStart

  const blocks: Block[] = [
    ...snowBlocks({ width, height }),
    {
      kind: 'frame',
      id: 'badge',
      x: badgeX + strokeInset,
      y: badgeY + strokeInset,
      width: badgeWidth - BADGE.lineWidth,
      height: BADGE.height - BADGE.lineWidth,
      radius: (BADGE.height - BADGE.lineWidth) / 2,
      lineWidth: BADGE.lineWidth,
    },
    {
      kind: 'fill-path',
      id: 'badge-snow',
      x: badgeX,
      y: badgeY + strokeInset,
      d: snowCapPath({ width: badgeWidth, depth: BADGE.snowDepth }),
      opacity: OPACITY.full,
    },
    {
      kind: 'stroke-path',
      id: 'badge-flake',
      x: glyphLeft + BADGE.glyphSize / 2,
      y: badgeY + BADGE.height / 2,
      d: snowflakePath(BADGE.glyphRadius),
      opacity: OPACITY.full,
      lineWidth: BADGE.glyphLineWidth,
    },
    textBlock({
      id: 'badge-label',
      text,
      x: glyphLeft + BADGE.glyphSize + BADGE.glyphGap,
      y: badgeY + (BADGE.height - text.height) / 2,
    }),
    ...layout.blocks.map((block) => ({
      ...block,
      x: block.x + layoutX,
      y: block.y + layoutY,
    })),
  ]

  return { width, height, ink: layout.ink, blocks }
}
