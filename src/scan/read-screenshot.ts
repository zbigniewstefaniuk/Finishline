import { launchImageLibraryAsync } from 'expo-image-picker'
import { recognizeText } from 'expo-mlkit-ocr'
import type { OcrLine } from '~/domain/workout-scan'

export async function readScreenshotLines(): Promise<OcrLine[] | null> {
  const picked = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 })
  const asset = picked.canceled ? undefined : picked.assets[0]
  if (!asset) return null
  const { blocks } = await recognizeText(asset.uri)
  return blocks.flatMap((block) =>
    block.lines.map((line) => ({ text: line.text, box: line.boundingBox })),
  )
}
