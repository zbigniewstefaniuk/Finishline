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

export const FONT_WEIGHT = {
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
} as const

const THIN_SPACE = ' '

export type TextSpec = {
  size: number
  lineHeight: number
  weight: (typeof FONT_WEIGHT)[keyof typeof FONT_WEIGHT]
  tracking: number
  opacity: number
}

export type Run = { text: string; spec: TextSpec }

type PlacedRun = Run & { x: number }

export type MeasuredText = {
  runs: PlacedRun[]
  width: number
  height: number
  baseline: number
}

export type Block =
  | { kind: 'text'; id: string; text: MeasuredText; x: number; y: number }
  | { kind: 'icon'; id: string; x: number; y: number; primary: string; secondary: string }
  | { kind: 'rule'; id: string; x: number; y: number; width: number; height: number }
  | {
      kind: 'frame'
      id: string
      x: number
      y: number
      width: number
      height: number
      radius: number
      lineWidth: number
    }

export type StickerLayout = {
  width: number
  height: number
  ink: string
  blocks: Block[]
}

export type Placeable = {
  width: number
  height: number
  place: (origin: { x: number; y: number }) => Block[]
}

const ICON_TO_TITLE_GAP = 10

export function canvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot draw the sticker.')
  return context
}

const MEASURING_CONTEXT = canvasContext(document.createElement('canvas'))

function fontOf(spec: TextSpec) {
  return `${spec.weight} ${spec.size}px "${STICKER_FONT_FAMILY}"`
}

function trackingOf(spec: TextSpec) {
  return spec.tracking * spec.size
}

function measureRun(run: Run) {
  MEASURING_CONTEXT.font = fontOf(run.spec)
  const metrics = MEASURING_CONTEXT.measureText(run.text)
  const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  const halfLeading = (run.spec.lineHeight - fontHeight) / 2
  return {
    advance: metrics.width + trackingOf(run.spec) * Array.from(run.text).length,
    ascent: metrics.fontBoundingBoxAscent + halfLeading,
    descent: metrics.fontBoundingBoxDescent + halfLeading,
  }
}

export function measureText(runs: Run[]): MeasuredText {
  const measured = runs.map(measureRun)
  const lefts = measured.map((_run, index) =>
    measured.slice(0, index).reduce((left, previous) => left + previous.advance, 0),
  )
  const advance = measured.reduce((sum, run) => sum + run.advance, 0)
  const lastSpec = runs.at(-1)?.spec
  const ascent = Math.max(0, ...measured.map((run) => run.ascent))
  const descent = Math.max(0, ...measured.map((run) => run.descent))
  return {
    runs: runs.map((run, index) => ({ ...run, x: lefts[index] ?? 0 })),
    width: advance - (lastSpec ? trackingOf(lastSpec) : 0),
    height: ascent + descent,
    baseline: ascent,
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
  return { kind: 'text', id, text, x, y }
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

export function headerRow({
  activity,
  title,
}: {
  activity: ActivityType
  title: MeasuredText
}): Placeable {
  const height = Math.max(ICON_BOX.height, title.height)
  return {
    width: ICON_BOX.width + ICON_TO_TITLE_GAP + title.width,
    height,
    place: ({ x, y }) => [
      iconBlock({ activity, x, y: y + (height - ICON_BOX.height) / 2 }),
      textBlock({
        id: 'title',
        text: title,
        x: x + ICON_BOX.width + ICON_TO_TITLE_GAP,
        y: y + (height - title.height) / 2,
      }),
    ],
  }
}

function drawRun({
  context,
  run,
  origin,
}: {
  context: CanvasRenderingContext2D
  run: PlacedRun
  origin: { x: number; y: number }
}) {
  context.font = fontOf(run.spec)
  context.globalAlpha = run.spec.opacity
  const characters = Array.from(run.text)
  for (const [index, character] of characters.entries()) {
    const prefix = characters.slice(0, index).join('')
    const left = context.measureText(prefix).width + trackingOf(run.spec) * index
    context.fillText(character, origin.x + run.x + left, origin.y)
  }
}

export function drawSticker({
  context,
  layout,
}: {
  context: CanvasRenderingContext2D
  layout: StickerLayout
}) {
  context.fillStyle = layout.ink
  context.strokeStyle = layout.ink
  for (const block of layout.blocks) {
    switch (block.kind) {
      case 'text': {
        const origin = { x: block.x, y: block.y + block.text.baseline }
        for (const run of block.text.runs) drawRun({ context, run, origin })
        break
      }
      case 'icon': {
        context.save()
        context.translate(block.x, block.y)
        context.lineWidth = ICON_BOX.strokeWidth
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.globalAlpha = OPACITY.full
        context.stroke(new Path2D(block.primary))
        context.globalAlpha = ICON_SECONDARY_OPACITY
        context.stroke(new Path2D(block.secondary))
        context.restore()
        break
      }
      case 'rule': {
        context.globalAlpha = OPACITY.rule
        context.fillRect(block.x, block.y, block.width, block.height)
        break
      }
      case 'frame': {
        context.globalAlpha = OPACITY.full
        context.lineWidth = block.lineWidth
        context.beginPath()
        context.roundRect(block.x, block.y, block.width, block.height, block.radius)
        context.stroke()
        break
      }
    }
  }
}
