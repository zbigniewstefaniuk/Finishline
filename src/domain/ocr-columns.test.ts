import { describe, expect, it } from 'vitest'
import { splitOcrColumns } from './ocr-columns'
import type { OcrLine } from './workout-scan'

const WORD_HEIGHT = 40

function word({ text, x, y }: { text: string; x: number; y: number }): OcrLine {
  return { text, box: { x, y, width: text.length * 20, height: WORD_HEIGHT } }
}

describe('splitOcrColumns', () => {
  it('splits a merged value row where a word starts at a label column', () => {
    const lines = [
      [word({ text: 'Pace', x: 409, y: 422 })],
      [word({ text: 'Moving', x: 767, y: 422 }), word({ text: 'Time', x: 909, y: 422 })],
      [
        word({ text: '3:56', x: 409, y: 475 }),
        word({ text: '/100m', x: 562, y: 475 }),
        word({ text: '49:05', x: 768, y: 475 }),
      ],
    ]
    expect(splitOcrColumns(lines).map((line) => line.text)).toEqual([
      'Pace',
      'Moving Time',
      '3:56 /100m',
      '49:05',
    ])
  })

  it('boxes each phrase around its own words', () => {
    const lines = [
      [word({ text: 'Time', x: 767, y: 422 })],
      [word({ text: '138', x: 409, y: 475 }), word({ text: '52:30', x: 768, y: 475 })],
    ]
    expect(splitOcrColumns(lines).at(-1)).toEqual({
      text: '52:30',
      box: { x: 768, y: 475, width: 100, height: WORD_HEIGHT },
    })
  })

  it('keeps a line whole when no other line starts near its words', () => {
    const lines = [
      [word({ text: 'Distance', x: 51, y: 422 })],
      [
        word({ text: 'Zurich,', x: 646, y: 292 }),
        word({ text: 'Switzerland', x: 784, y: 292 }),
      ],
      [word({ text: 'Moving', x: 767, y: 422 })],
    ]
    expect(splitOcrColumns(lines).map((line) => line.text)).toContain(
      'Zurich, Switzerland',
    )
  })

  it('ignores a column start far above or below the word', () => {
    const lines = [
      [word({ text: '12:12', x: 169, y: 495 }), word({ text: 'mi', x: 214, y: 495 })],
      [word({ text: 'Share', x: 214, y: 1200 })],
    ]
    expect(splitOcrColumns(lines).map((line) => line.text)).toEqual(['12:12 mi', 'Share'])
  })
})
