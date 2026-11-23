import { describe, expect, it } from 'vitest'
import {
  classifyGesture,
  entrySide,
  isDoubleTap,
  isHorizontalWheel,
  swipedStyle,
  wheelSwipe,
} from './preview-gestures'

const at = ([x, y, time]: [number, number, number]) => ({ x, y, time })

describe('classifyGesture', () => {
  it('reads a quick horizontal drag as a swipe in its direction', () => {
    expect(classifyGesture({ start: at([200, 100, 0]), end: at([120, 110, 180]) })).toBe(
      'swipe-left',
    )
    expect(classifyGesture({ start: at([100, 100, 0]), end: at([180, 95, 180]) })).toBe(
      'swipe-right',
    )
  })

  it('ignores a mostly vertical drag, which is the page scrolling', () => {
    expect(classifyGesture({ start: at([100, 100, 0]), end: at([150, 220, 200]) })).toBe(
      'none',
    )
  })

  it('ignores a horizontal drag shorter than a swipe', () => {
    expect(classifyGesture({ start: at([100, 100, 0]), end: at([130, 100, 200]) })).toBe(
      'none',
    )
  })

  it('tells a tap from a long press by how long the finger stayed down', () => {
    expect(classifyGesture({ start: at([100, 100, 0]), end: at([103, 102, 120]) })).toBe(
      'tap',
    )
    expect(classifyGesture({ start: at([100, 100, 0]), end: at([103, 102, 650]) })).toBe(
      'long-press',
    )
  })
})

describe('isDoubleTap', () => {
  it('pairs two taps that are quick and close together', () => {
    expect(
      isDoubleTap({ previous: at([100, 100, 0]), current: at([110, 105, 250]) }),
    ).toBe(true)
  })

  it('rejects a slow second tap, a far second tap and a first tap', () => {
    expect(
      isDoubleTap({ previous: at([100, 100, 0]), current: at([100, 100, 400]) }),
    ).toBe(false)
    expect(
      isDoubleTap({ previous: at([100, 100, 0]), current: at([200, 100, 200]) }),
    ).toBe(false)
    expect(isDoubleTap({ previous: null, current: at([100, 100, 0]) })).toBe(false)
  })
})

describe('swipedStyle', () => {
  it('moves to the next style on a left swipe and back on a right swipe', () => {
    expect(swipedStyle({ style: 'minimal', gesture: 'swipe-left' })).toBe('strip')
    expect(swipedStyle({ style: 'strip', gesture: 'swipe-right' })).toBe('minimal')
  })

  it('stays put at either end', () => {
    expect(swipedStyle({ style: 'minimal', gesture: 'swipe-right' })).toBe('minimal')
    expect(swipedStyle({ style: 'bib', gesture: 'swipe-left' })).toBe('bib')
  })
})

describe('isHorizontalWheel', () => {
  it('takes a sideways trackpad swipe and leaves vertical scrolling to the page', () => {
    expect(isHorizontalWheel({ deltaX: 12, deltaY: 2 })).toBe(true)
    expect(isHorizontalWheel({ deltaX: 4, deltaY: 30 })).toBe(false)
    expect(isHorizontalWheel({ deltaX: 0, deltaY: 0 })).toBe(false)
  })
})

describe('wheelSwipe', () => {
  it('steps once the scroll travels a swipe, scrolling right meaning the next style', () => {
    expect(wheelSwipe(30)).toBeNull()
    expect(wheelSwipe(60)).toBe('swipe-left')
    expect(wheelSwipe(-60)).toBe('swipe-right')
  })
})

describe('entrySide', () => {
  it('brings a later style in from the right and an earlier one from the left', () => {
    expect(entrySide({ from: 'minimal', to: 'editorial' })).toBe('right')
    expect(entrySide({ from: 'bib', to: 'grid' })).toBe('left')
  })

  it('has no side for the first sticker or the same style', () => {
    expect(entrySide({ from: null, to: 'minimal' })).toBeNull()
    expect(entrySide({ from: 'strip', to: 'strip' })).toBeNull()
  })
})
