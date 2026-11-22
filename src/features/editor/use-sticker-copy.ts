import { useState } from 'react'
import { toast } from 'sonner'
import { copySticker } from '~/share/share-sticker'
import type { StickerImage } from '~/sticker/render-sticker'
import { copyStateOf } from './copy-state'

const COPIED_TOAST_ID = 'sticker-copied'

export function showFailure({ title, error }: { title: string; error: unknown }) {
  toast.error(title, {
    description: error instanceof Error ? error.message : 'Try again.',
  })
}

export function useStickerCopy(image: StickerImage | null) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)

  async function copy(sticker: StickerImage) {
    setIsCopying(true)
    try {
      await copySticker(sticker)
      setCopiedUrl(sticker.url)
      toast.success('Copied', {
        id: COPIED_TOAST_ID,
        description: 'Paste it into your Story.',
      })
    } catch (error) {
      showFailure({ title: "Couldn't copy the sticker", error })
    }
    setIsCopying(false)
  }

  const state = copyStateOf({ isCopying, copiedUrl, currentUrl: image?.url ?? null })
  return { state, copy }
}
