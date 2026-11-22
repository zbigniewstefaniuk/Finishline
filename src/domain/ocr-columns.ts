import type { OcrLine } from './workout-scan'

const COLUMN_ALIGN_TOLERANCE_IN_HEIGHTS = 0.25

function startsColumn({ word, columnStarts }: { word: OcrLine; columnStarts: number[] }) {
  const tolerance = word.box.height * COLUMN_ALIGN_TOLERANCE_IN_HEIGHTS
  return columnStarts.some((start) => Math.abs(word.box.x - start) <= tolerance)
}

function joinWords(words: OcrLine[]): OcrLine {
  const left = Math.min(...words.map((word) => word.box.x))
  const top = Math.min(...words.map((word) => word.box.y))
  const right = Math.max(...words.map((word) => word.box.x + word.box.width))
  const bottom = Math.max(...words.map((word) => word.box.y + word.box.height))
  return {
    text: words.map((word) => word.text).join(' '),
    box: { x: left, y: top, width: right - left, height: bottom - top },
  }
}

function splitAtColumns({
  words,
  columnStarts,
}: {
  words: OcrLine[]
  columnStarts: number[]
}) {
  const phrases: OcrLine[][] = []
  for (const [index, word] of words.entries()) {
    const current = phrases.at(-1)
    const isNewPhrase = index === 0 || startsColumn({ word, columnStarts })
    if (isNewPhrase || !current) phrases.push([word])
    else current.push(word)
  }
  return phrases.map(joinWords)
}

export function splitOcrColumns(lines: OcrLine[][]): OcrLine[] {
  const columnStarts = lines.flatMap((words) => (words[0] ? [words[0].box.x] : []))
  return lines.flatMap((words) => splitAtColumns({ words, columnStarts }))
}
