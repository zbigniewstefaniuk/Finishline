import { describe, expect, it } from 'vitest'
import {
  parseDecimal,
  parseDistanceMeters,
  parseDuration,
  parseWholeNumber,
} from './parse'

describe('parseDuration', () => {
  it('reads minutes and seconds', () => {
    expect(parseDuration('49:05')).toBe(2945)
  })

  it('reads hours, minutes and seconds', () => {
    expect(parseDuration('1:28:10')).toBe(5290)
  })

  it('accepts more than 59 minutes when no hours are given', () => {
    expect(parseDuration('75:00')).toBe(4500)
  })

  it('ignores surrounding whitespace', () => {
    expect(parseDuration(' 49:05 ')).toBe(2945)
  })

  it.each([
    '',
    '49',
    '49:5',
    '49:60',
    '1:60:00',
    '1:2:03',
    '49.05',
    '-1:00',
    '0:00',
    'ab:cd',
  ])('rejects %j', (text) => {
    expect(parseDuration(text)).toBeNull()
  })
})

describe('parseDecimal', () => {
  it('accepts a comma as the decimal separator', () => {
    expect(parseDecimal('10,02')).toBe(10.02)
  })

  it.each(['', '0', '1.', '.5', '1,000.5', '1e3', '-2'])('rejects %j', (text) => {
    expect(parseDecimal(text)).toBeNull()
  })
})

describe('parseWholeNumber', () => {
  it('reads a heart rate', () => {
    expect(parseWholeNumber('142')).toBe(142)
  })

  it.each(['', '0', '142.5', '1,120'])('rejects %j', (text) => {
    expect(parseWholeNumber(text)).toBeNull()
  })
})

describe('parseDistanceMeters', () => {
  it('reads pool swim distance in meters', () => {
    expect(parseDistanceMeters({ text: '1250', activity: 'pool-swim' })).toBe(1250)
  })

  it('reads run distance in kilometers', () => {
    expect(parseDistanceMeters({ text: '10.02', activity: 'run' })).toBeCloseTo(10_020)
  })

  it('returns null for an unparseable distance', () => {
    expect(parseDistanceMeters({ text: '10 km', activity: 'ride' })).toBeNull()
  })
})
