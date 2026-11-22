import { describe, expect, it } from 'vitest'
import {
  formatClock,
  formatDate,
  formatInputDate,
  formatDistance,
  formatDistanceInput,
  formatGrouped,
  formatList,
} from './format'

describe('formatClock', () => {
  it('drops the hour under one hour', () => {
    expect(formatClock(2945)).toBe('49:05')
  })

  it('pads minutes once hours appear', () => {
    expect(formatClock(5290)).toBe('1:28:10')
  })

  it('carries a rounded-up minute instead of printing 60 seconds', () => {
    expect(formatClock(59.6)).toBe('1:00')
  })
})

describe('formatGrouped', () => {
  it('groups thousands with a comma', () => {
    expect(formatGrouped(1250)).toBe('1,250')
  })

  it('leaves three-digit numbers alone', () => {
    expect(formatGrouped(142)).toBe('142')
  })

  it('groups millions', () => {
    expect(formatGrouped(1_234_567)).toBe('1,234,567')
  })
})

describe('formatDistance', () => {
  it('shows pool swims in grouped meters', () => {
    expect(formatDistance({ meters: 1250, activity: 'pool-swim' })).toEqual({
      value: '1,250',
      unit: 'm',
    })
  })

  it('shows rides in kilometers with two decimals', () => {
    expect(formatDistance({ meters: 42_600, activity: 'ride' })).toEqual({
      value: '42.60',
      unit: 'km',
    })
  })
})

describe('formatDistanceInput', () => {
  it('converts meters to a trimmed kilometer input', () => {
    expect(formatDistanceInput({ meters: 1250, activity: 'run' })).toBe('1.25')
  })

  it('converts kilometers back to whole meters for a pool swim', () => {
    expect(formatDistanceInput({ meters: 10.02 * 1000, activity: 'pool-swim' })).toBe(
      '10020',
    )
  })
})

describe('formatDate', () => {
  it('formats as day.month.year with padding', () => {
    expect(formatDate(new Date(2026, 10, 2))).toBe('02.11.2026')
  })
})

describe('formatInputDate', () => {
  it('formats a local date as yyyy-mm-dd for date inputs', () => {
    expect(formatInputDate(new Date(2026, 10, 2))).toBe('2026-11-02')
  })
})

describe('formatList', () => {
  it('joins with commas and a final "and"', () => {
    expect(formatList([])).toBe('')
    expect(formatList(['Avg HR'])).toBe('Avg HR')
    expect(formatList(['Avg HR', 'Calories'])).toBe('Avg HR and Calories')
    expect(formatList(['Avg HR', 'Calories', 'Elevation'])).toBe(
      'Avg HR, Calories and Elevation',
    )
  })
})
