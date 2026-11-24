import { describe, expect, it } from 'vitest'
import { adventDay, adventDoor, daysToChristmas } from './advent'

describe('adventDay', () => {
  it('counts 1 to 24 December', () => {
    expect(adventDay(new Date(2026, 11, 1))).toBe(1)
    expect(adventDay(new Date(2026, 11, 24))).toBe(24)
  })

  it('is null outside Advent', () => {
    expect(adventDay(new Date(2026, 10, 30))).toBeNull()
    expect(adventDay(new Date(2026, 11, 25))).toBeNull()
  })
})

describe('daysToChristmas', () => {
  it('counts whole days to 25 December, ignoring the time of day', () => {
    expect(daysToChristmas(new Date(2026, 11, 7, 18, 30))).toBe(18)
    expect(daysToChristmas(new Date(2026, 11, 24))).toBe(1)
    expect(daysToChristmas(new Date(2026, 9, 20))).toBe(66)
  })

  it('counts to next year once Christmas has passed', () => {
    expect(daysToChristmas(new Date(2026, 11, 26))).toBe(364)
  })
})

describe('adventDoor', () => {
  it('shows the Advent day', () => {
    expect(adventDoor({ count: 'day', date: new Date(2026, 11, 7) })).toEqual({
      top: 'Advent',
      number: '7',
      bottom: 'December',
    })
  })

  it('shows a plain calendar day outside Advent', () => {
    expect(adventDoor({ count: 'day', date: new Date(2026, 10, 24) })).toEqual({
      top: 'Tuesday',
      number: '24',
      bottom: 'November',
    })
  })

  it('counts down to Christmas, singular on the last day', () => {
    expect(adventDoor({ count: 'countdown', date: new Date(2026, 11, 7) })).toEqual({
      top: 'Christmas in',
      number: '18',
      bottom: 'Days',
    })
    expect(adventDoor({ count: 'countdown', date: new Date(2026, 11, 24) })).toEqual({
      top: 'Christmas in',
      number: '1',
      bottom: 'Day',
    })
  })

  it('opens the Christmas door on 25 December in both counts', () => {
    const christmas = { top: 'Christmas', number: '25', bottom: 'December' }
    expect(adventDoor({ count: 'day', date: new Date(2026, 11, 25) })).toEqual(christmas)
    expect(adventDoor({ count: 'countdown', date: new Date(2026, 11, 25) })).toEqual(
      christmas,
    )
  })
})
