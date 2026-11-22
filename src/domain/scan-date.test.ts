import { describe, expect, it } from 'vitest'
import { readScanDate } from './scan-date'

const TODAY = new Date(2026, 10, 22, 9, 15)

function read(text: string) {
  return readScanDate({ text, today: TODAY })
}

describe('readScanDate', () => {
  it('reads day-first numeric dates', () => {
    expect(read('22.11.2026')).toEqual(new Date(2026, 10, 22))
    expect(read('03/11/26')).toEqual(new Date(2026, 10, 3))
  })

  it('reads a US numeric date when the second number cannot be a month', () => {
    expect(read('11/21/2026')).toEqual(new Date(2026, 10, 21))
  })

  it('reads ISO dates', () => {
    expect(read('2026-11-20T07:12')).toEqual(new Date(2026, 10, 20))
  })

  it('reads month names in either order', () => {
    expect(read('Saturday, November 21st, 2026')).toEqual(new Date(2026, 10, 21))
    expect(read('Sat 21 Nov 2026')).toEqual(new Date(2026, 10, 21))
    expect(read('Sept 5, 2026')).toEqual(new Date(2026, 8, 5))
  })

  it('puts a date without a year in the most recent past', () => {
    expect(read('Nov 20')).toEqual(new Date(2026, 10, 20))
    expect(read('Dec 3')).toEqual(new Date(2025, 11, 3))
  })

  it('reads today and yesterday', () => {
    expect(read('Today at 7:12 AM')).toEqual(new Date(2026, 10, 22))
    expect(read('Yesterday')).toEqual(new Date(2026, 10, 21))
  })

  it('rejects future dates, impossible days and words that only look like months', () => {
    expect(read('Dec 3, 2026')).toBeNull()
    expect(read('31.11.2026')).toBeNull()
    expect(read('Half Marathon 21.1 km')).toBeNull()
  })
})
