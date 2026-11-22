import { describe, expect, it } from 'vitest'
import { formatPace, paceStyleOf } from './pace'

describe('formatPace', () => {
  it('gives pool swims a pace per 100 m (1,250 m in 49:05 is 3:56)', () => {
    expect(formatPace({ activity: 'pool-swim', meters: 1250, seconds: 2945 })).toBe(
      '3:56',
    )
  })

  it('gives the spec pace of 2:27 /100m for 2,000 m in 49:05', () => {
    expect(formatPace({ activity: 'pool-swim', meters: 2000, seconds: 2945 })).toBe(
      '2:27',
    )
  })

  it('gives runs a pace per km', () => {
    expect(formatPace({ activity: 'run', meters: 10_020, seconds: 2945 })).toBe('4:54')
  })

  it('gives rides a speed in km/h with one decimal', () => {
    expect(formatPace({ activity: 'ride', meters: 42_600, seconds: 5290 })).toBe('29.0')
  })

  it('gives rows a split per 500 m (5,000 m in 20:41 is 2:04)', () => {
    expect(formatPace({ activity: 'row', meters: 5000, seconds: 1241 })).toBe('2:04')
  })

  it('gives open water swims the same pace per 100 m as the pool', () => {
    expect(formatPace({ activity: 'open-water-swim', meters: 1900, seconds: 2280 })).toBe(
      '2:00',
    )
  })

  it('gives skiing a speed in km/h', () => {
    expect(formatPace({ activity: 'ski', meters: 31_400, seconds: 7200 })).toBe('15.7')
  })
})

describe('paceStyleOf', () => {
  it('labels ride pace as speed', () => {
    expect(paceStyleOf('ride')).toEqual({ label: 'Speed', unit: 'km/h' })
  })

  it('labels the rowing pace as a split per 500 m', () => {
    expect(paceStyleOf('row')).toEqual({ label: 'Split', unit: '/500m' })
  })
})
