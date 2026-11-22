import { STICKER_STYLES, type StickerStyle } from '~/domain/sticker-data'

export type PointerSample = { x: number; y: number; time: number }

export type PreviewGesture = 'swipe-left' | 'swipe-right' | 'long-press' | 'tap' | 'none'

export const GESTURE = {
  swipeMinDistance: 48,
  swipeAxisRatio: 1.5,
  tapMaxMovement: 10,
  longPressMs: 500,
  doubleTapMs: 300,
  doubleTapMaxDistance: 30,
} as const

function distance({ from, to }: { from: PointerSample; to: PointerSample }) {
  return Math.hypot(to.x - from.x, to.y - from.y)
}

export function isHorizontalDrag({
  start,
  current,
}: {
  start: PointerSample
  current: PointerSample
}) {
  const dx = Math.abs(current.x - start.x)
  const dy = Math.abs(current.y - start.y)
  return dx > GESTURE.tapMaxMovement && dx >= dy * GESTURE.swipeAxisRatio
}

export function classifyGesture({
  start,
  end,
}: {
  start: PointerSample
  end: PointerSample
}): PreviewGesture {
  const dx = end.x - start.x
  const isSwipe =
    Math.abs(dx) >= GESTURE.swipeMinDistance && isHorizontalDrag({ start, current: end })
  if (isSwipe) return dx < 0 ? 'swipe-left' : 'swipe-right'
  if (distance({ from: start, to: end }) > GESTURE.tapMaxMovement) return 'none'
  return end.time - start.time >= GESTURE.longPressMs ? 'long-press' : 'tap'
}

export function isDoubleTap({
  previous,
  current,
}: {
  previous: PointerSample | null
  current: PointerSample
}) {
  if (!previous) return false
  const isQuick = current.time - previous.time <= GESTURE.doubleTapMs
  const isClose =
    distance({ from: previous, to: current }) <= GESTURE.doubleTapMaxDistance
  return isQuick && isClose
}

export function swipedStyle({
  style,
  gesture,
}: {
  style: StickerStyle
  gesture: 'swipe-left' | 'swipe-right'
}) {
  const step = gesture === 'swipe-left' ? 1 : -1
  const index = STICKER_STYLES.indexOf(style) + step
  return STICKER_STYLES[index] ?? style
}
