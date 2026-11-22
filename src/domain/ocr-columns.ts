import type { OcrBox, OcrLine } from './workout-scan'

const COLUMN = { alignInHeights: 0.25, reachInHeights: 4 } as const

function startsColumn({ word, columnStarts }: { word: OcrLine; columnStarts: OcrBox[] }) {
  return columnStarts.some((start) => {
    const isAligned =
      Math.abs(word.box.x - start.x) <= word.box.height * COLUMN.alignInHeights
    const isNearby =
      Math.abs(word.box.y - start.y) <= word.box.height * COLUMN.reachInHeights
    return isAligned && isNearby
  })
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
  columnStarts: OcrBox[]
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
  const columnStarts = lines.flatMap((words) => (words[0] ? [words[0].box] : []))
  return lines.flatMap((words) => splitAtColumns({ words, columnStarts }))
}
