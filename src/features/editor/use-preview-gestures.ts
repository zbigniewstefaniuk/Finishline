import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  GESTURE,
  classifyGesture,
  isDoubleTap,
  isHorizontalDrag,
  isHorizontalWheel,
  wheelSwipe,
  type PointerSample,
  type PreviewGesture,
  type SwipeGesture,
} from './preview-gestures'

const DRAG_FOLLOW = { cursor: 1, finger: 0.35 } as const
const HOLD_HAPTIC_MS = 12

function sampleOf(event: PointerEvent<HTMLElement>): PointerSample {
  return { x: event.clientX, y: event.clientY, time: event.timeStamp }
}

function vibrate() {
  if ('vibrate' in navigator) navigator.vibrate(HOLD_HAPTIC_MS)
}

export function usePreviewGestures({
  onSwipe,
  onDoubleTap,
  onLongPress,
}: {
  onSwipe: (gesture: SwipeGesture) => void
  onDoubleTap: () => void
  onLongPress: () => void
}) {
  const startRef = useRef<PointerSample | null>(null)
  const lastTapRef = useRef<PointerSample | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const wheelRef = useRef({ travel: 0, hasSwiped: false })
  const wheelEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [dragX, setDragX] = useState(0)
  const [isHolding, setIsHolding] = useState(false)

  useEffect(
    () => () => {
      clearTimeout(holdTimerRef.current)
      clearTimeout(wheelEndTimerRef.current)
    },
    [],
  )

  function reset() {
    clearTimeout(holdTimerRef.current)
    startRef.current = null
    setDragX(0)
    setIsHolding(false)
  }

  function onWheel(event: WheelEvent) {
    if (!isHorizontalWheel(event)) return
    event.preventDefault()
    clearTimeout(wheelEndTimerRef.current)
    wheelEndTimerRef.current = setTimeout(() => {
      wheelRef.current = { travel: 0, hasSwiped: false }
      setDragX(0)
    }, GESTURE.wheelEndMs)
    const wheel = wheelRef.current
    if (wheel.hasSwiped) return
    wheel.travel += event.deltaX
    const gesture = wheelSwipe(wheel.travel)
    if (!gesture) {
      setDragX(-wheel.travel * DRAG_FOLLOW.finger)
      return
    }
    wheel.hasSwiped = true
    setDragX(0)
    lastTapRef.current = null
    onSwipe(gesture)
  }

  function respond({ gesture, end }: { gesture: PreviewGesture; end: PointerSample }) {
    switch (gesture) {
      case 'swipe-left':
      case 'swipe-right': {
        lastTapRef.current = null
        onSwipe(gesture)
        return
      }
      case 'long-press': {
        lastTapRef.current = null
        onLongPress()
        return
      }
      case 'tap': {
        const isSecondTap = isDoubleTap({ previous: lastTapRef.current, current: end })
        lastTapRef.current = isSecondTap ? null : end
        if (isSecondTap) onDoubleTap()
        return
      }
      case 'none': {
        return
      }
    }
  }

  return {
    dragX,
    isHolding,
    handlers: {
      ref: (layer: HTMLElement | null) => {
        if (!layer) return
        layer.addEventListener('wheel', onWheel, { passive: false })
        return () => layer.removeEventListener('wheel', onWheel)
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        const isMainButton = event.isPrimary && event.button === 0
        if (!isMainButton) return
        event.currentTarget.setPointerCapture(event.pointerId)
        startRef.current = sampleOf(event)
        holdTimerRef.current = setTimeout(() => {
          setIsHolding(true)
          vibrate()
        }, GESTURE.longPressMs)
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const start = startRef.current
        if (!start || !event.isPrimary) return
        const current = sampleOf(event)
        const hasMoved =
          Math.hypot(current.x - start.x, current.y - start.y) > GESTURE.tapMaxMovement
        if (hasMoved) {
          clearTimeout(holdTimerRef.current)
          setIsHolding(false)
        }
        if (!isHorizontalDrag({ start, current })) return
        const follow =
          event.pointerType === 'mouse' ? DRAG_FOLLOW.cursor : DRAG_FOLLOW.finger
        setDragX((current.x - start.x) * follow)
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        const start = startRef.current
        reset()
        if (!start || !event.isPrimary) return
        const end = sampleOf(event)
        respond({ gesture: classifyGesture({ start, end }), end })
      },
      onPointerCancel: reset,
    },
  }
}
