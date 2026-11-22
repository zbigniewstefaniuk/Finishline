import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  GESTURE,
  classifyGesture,
  isDoubleTap,
  isHorizontalDrag,
  type PointerSample,
  type PreviewGesture,
} from './preview-gestures'

const DRAG_RESISTANCE = 0.35
const HOLD_HAPTIC_MS = 12

type SwipeGesture = Extract<PreviewGesture, 'swipe-left' | 'swipe-right'>

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
  const [dragX, setDragX] = useState(0)
  const [isHolding, setIsHolding] = useState(false)

  useEffect(() => () => clearTimeout(holdTimerRef.current), [])

  function reset() {
    clearTimeout(holdTimerRef.current)
    startRef.current = null
    setDragX(0)
    setIsHolding(false)
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
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!event.isPrimary) return
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
        if (isHorizontalDrag({ start, current })) {
          setDragX((current.x - start.x) * DRAG_RESISTANCE)
        }
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
