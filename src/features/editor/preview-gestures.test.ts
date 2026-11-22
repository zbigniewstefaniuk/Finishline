import { describe, expect, it } from 'vitest'
import { classifyGesture, isDoubleTap, swipedStyle } from './preview-gestures'

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
    expect(swipedStyle({ style: 'editorial', gesture: 'swipe-left' })).toBe('editorial')
  })
})
