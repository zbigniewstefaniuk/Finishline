import type { StickerImage } from '~/sticker/render-sticker'

const PNG_TYPE = 'image/png'
const FILE_NAME = 'finishline-sticker.png'

const CAN_COPY_IMAGES = 'clipboard' in navigator && 'ClipboardItem' in window

export const CAN_SHARE_FILES =
  'canShare' in navigator &&
  navigator.canShare({ files: [new File([], FILE_NAME, { type: PNG_TYPE })] })

function pngBlob(image: StickerImage) {
  const base64 = image.url.slice(image.url.indexOf(',') + 1)
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
  return new Blob([bytes], { type: PNG_TYPE })
}

export async function copySticker(image: StickerImage) {
  if (!CAN_COPY_IMAGES) {
    throw new Error('This browser cannot copy images. Long-press the sticker instead.')
  }
  await navigator.clipboard.write([new ClipboardItem({ [PNG_TYPE]: pngBlob(image) })])
}

export async function shareSticker(image: StickerImage) {
  const file = new File([pngBlob(image)], FILE_NAME, { type: PNG_TYPE })
  try {
    await navigator.share({ files: [file] })
  } catch (error) {
    const isCancelled = error instanceof DOMException && error.name === 'AbortError'
    if (!isCancelled) throw error
  }
}

export function downloadSticker(image: StickerImage) {
  const link = document.createElement('a')
  link.href = image.url
  link.download = FILE_NAME
  link.click()
}
