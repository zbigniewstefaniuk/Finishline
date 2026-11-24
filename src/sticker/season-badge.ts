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

type Point = { x: number; y: number }

type FlakeShape = { shape: 'flake' | 'dot'; radius: number; opacity: number }

const ORIGIN: Point = { x: 0, y: 0 }

const SNOW_MARGIN = { top: 36, side: 24 } as const

const BADGE = {
  height: 24,
  lineWidth: 1.5,
  paddingStart: 11,
  paddingEnd: 14,
  glyphSize: 12,
  glyphRadius: 5.25,
  glyphGap: 8,
  gapBelow: 16,
} as const

const BADGE_TEXT = {
  size: 10,
  lineHeight: 12,
  weight: FONT_WEIGHT.semiBold,
  tracking: 0.24,
  opacity: OPACITY.full,
} as const satisfies TextSpec

const SNOWFLAKE = {
  arms: 6,
  branchAt: 0.55,
  branchLength: 0.38,
  branchAngle: 0.75,
  lineWidth: 1.25,
  badgeLineWidth: 1.1,
} as const

const SNOW_CAP = {
  inset: 3,
  reach: 0.72,
  sink: 1,
  base: 1.5,
  drip: 6,
  dripWidth: 6,
  rounding: 1.2,
  startLift: 0.5,
  lifts: [4.2, 6.2, 5, 7, 6.4, 4.6, 5.6, 3.8, 2.4, 1, 0],
} as const

const TOP_SNOW = [
  { shape: 'flake', across: 0.1, top: 14, radius: 7, opacity: 1 },
  { shape: 'flake', across: 0.31, top: 6, radius: 3.6, opacity: 0.6 },
  { shape: 'flake', across: 0.88, top: 10, radius: 5.5, opacity: 0.85 },
  { shape: 'dot', across: 0.72, top: 5, radius: 1.8, opacity: 0.85 },
  { shape: 'dot', across: 0.22, top: 24, radius: 1.6, opacity: 0.8 },
  { shape: 'dot', across: 0.8, top: 24, radius: 1.3, opacity: 0.6 },
] as const satisfies readonly (FlakeShape & { across: number; top: number })[]

const SIDE_SNOW = [
  { shape: 'flake', edge: 'right', inset: 16, down: 0.22, radius: 4, opacity: 0.7 },
  { shape: 'flake', edge: 'left', inset: 18, down: 0.32, radius: 4.6, opacity: 0.75 },
  { shape: 'flake', edge: 'right', inset: 14, down: 0.48, radius: 3.2, opacity: 0.5 },
  { shape: 'flake', edge: 'left', inset: 20, down: 0.63, radius: 2.8, opacity: 0.4 },
  { shape: 'dot', edge: 'left', inset: 34, down: 0.44, radius: 1.4, opacity: 0.55 },
  { shape: 'dot', edge: 'right', inset: 30, down: 0.36, radius: 1.5, opacity: 0.6 },
  { shape: 'dot', edge: 'right', inset: 26, down: 0.62, radius: 1.1, opacity: 0.4 },
  { shape: 'dot', edge: 'left', inset: 10, down: 0.8, radius: 1, opacity: 0.3 },
  { shape: 'dot', edge: 'right', inset: 12, down: 0.78, radius: 1, opacity: 0.3 },
] as const satisfies readonly (FlakeShape & {
  edge: 'left' | 'right'
  inset: number
  down: number
})[]

function polar({
  angle,
  length,
  from = ORIGIN,
}: {
  angle: number
  length: number
  from?: Point
}): Point {
  return { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length }
}

function snowflakePath(radius: number) {
  const branchAt = radius * SNOWFLAKE.branchAt
  const branchLength = radius * SNOWFLAKE.branchLength
  return Array.from({ length: SNOWFLAKE.arms }, (_arm, arm) => {
    const angle = (arm * 2 * Math.PI) / SNOWFLAKE.arms
    const tip = polar({ angle, length: radius })
    const joint = polar({ angle, length: branchAt })
    const left = polar({
      angle: angle + SNOWFLAKE.branchAngle,
      length: branchLength,
      from: joint,
    })
    const right = polar({
      angle: angle - SNOWFLAKE.branchAngle,
      length: branchLength,
      from: joint,
    })
    return `M0 0L${tip.x} ${tip.y}M${left.x} ${left.y}L${joint.x} ${joint.y}L${right.x} ${right.y}`
  }).join('')
}

function dotPath(radius: number) {
  return `M${-radius} 0a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`
}

function snowCapPath(badgeWidth: number) {
  const { inset, reach, sink, base, drip, dripWidth, rounding, startLift, lifts } =
    SNOW_CAP
  const end = badgeWidth * reach
  const step = (end - inset) / lifts.length
  const start: Point = { x: inset, y: sink - startLift }
  const points = lifts.map((lift, index) => ({
    x: inset + step * (index + 1),
    y: sink - lift,
  }))
  const { lumps } = points.reduce(
    ({ lumps: path, previous }, point) => {
      const controlX = (previous.x + point.x) / 2
      const curve = `C${controlX} ${previous.y - rounding} ${controlX} ${point.y - rounding} ${point.x} ${point.y}`
      return { lumps: path + curve, previous: point }
    },
    { lumps: '', previous: start },
  )
  return `M${inset} ${drip}L${start.x} ${start.y}${lumps}L${end} ${base}L${inset + dripWidth} ${base}Q${inset} ${base} ${inset} ${drip}Z`
}

function flakeBlock({
  flake,
  id,
  x,
  y,
}: {
  flake: FlakeShape
  id: string
  x: number
  y: number
}): Block {
  if (flake.shape === 'dot') {
    return {
      kind: 'fill-path',
      id,
      x,
      y,
      d: dotPath(flake.radius),
      opacity: flake.opacity,
    }
  }
  return {
    kind: 'stroke-path',
    id,
    x,
    y,
    d: snowflakePath(flake.radius),
    opacity: flake.opacity,
    lineWidth: SNOWFLAKE.lineWidth,
  }
}

function snowBlocks({ width, height }: { width: number; height: number }) {
  const top = TOP_SNOW.map((flake, index) =>
    flakeBlock({ flake, id: `snow-top-${index}`, x: flake.across * width, y: flake.top }),
  )
  const side = SIDE_SNOW.map((flake, index) =>
    flakeBlock({
      flake,
      id: `snow-side-${index}`,
      x: flake.edge === 'left' ? flake.inset : width - flake.inset,
      y: flake.down * height,
    }),
  )
  return [...top, ...side]
}

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
      d: snowCapPath(badgeWidth),
      opacity: OPACITY.full,
    },
    {
      kind: 'stroke-path',
      id: 'badge-flake',
      x: glyphLeft + BADGE.glyphSize / 2,
      y: badgeY + BADGE.height / 2,
      d: snowflakePath(BADGE.glyphRadius),
      opacity: OPACITY.full,
      lineWidth: SNOWFLAKE.badgeLineWidth,
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
