export type PointerSample = { x: number; y: number; time: number }

export type PreviewGesture = 'swipe-left' | 'swipe-right' | 'long-press' | 'tap' | 'none'

export type SwipeGesture = Extract<PreviewGesture, 'swipe-left' | 'swipe-right'>

export type EntrySide = 'left' | 'right'

export const GESTURE = {
  swipeMinDistance: 48,
  swipeAxisRatio: 1.5,
  tapMaxMovement: 10,
  longPressMs: 500,
  doubleTapMs: 300,
  doubleTapMaxDistance: 30,
  wheelEndMs: 150,
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

export function isHorizontalWheel({
  deltaX,
  deltaY,
}: {
  deltaX: number
  deltaY: number
}) {
  return Math.abs(deltaX) > Math.abs(deltaY) * GESTURE.swipeAxisRatio
}

export function wheelSwipe(travel: number): SwipeGesture | null {
  if (Math.abs(travel) < GESTURE.swipeMinDistance) return null
  return travel > 0 ? 'swipe-left' : 'swipe-right'
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

export function entrySide({
  pages,
  from,
  to,
}: {
  pages: readonly string[]
  from: string | null
  to: string | null
}): EntrySide | null {
  const fromIndex = from === null ? -1 : pages.indexOf(from)
  const toIndex = to === null ? -1 : pages.indexOf(to)
  const isSamePager = fromIndex >= 0 && toIndex >= 0
  if (!isSamePager || fromIndex === toIndex) return null
  return toIndex > fromIndex ? 'right' : 'left'
}
