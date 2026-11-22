import type { Bbox } from 'tesseract.js'
import { splitOcrColumns } from '~/domain/ocr-columns'
import type { OcrLine } from '~/domain/workout-scan'

function toOcrLine({ text, bbox }: { text: string; bbox: Bbox }): OcrLine {
  return {
    text,
    box: { x: bbox.x0, y: bbox.y0, width: bbox.x1 - bbox.x0, height: bbox.y1 - bbox.y0 },
  }
}

export async function readScreenshotLines(image: File) {
  const { createWorker, PSM } = await import('tesseract.js')
  const worker = await createWorker('eng')
  try {
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })
    const { data } = await worker.recognize(image, {}, { blocks: true })
    const lines = (data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.map((line) => line.words.map(toOcrLine)),
      ),
    )
    return splitOcrColumns(lines)
  } finally {
    await worker.terminate()
  }
}
