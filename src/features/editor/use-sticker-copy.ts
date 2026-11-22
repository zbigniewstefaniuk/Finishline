import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { copySticker } from '~/share/share-sticker'
import type { StickerImage } from '~/sticker/render-sticker'

export type CopyStatus = 'idle' | 'copying' | 'copied'

const DONE_FLASH_MS = 1600

export function showFailure({ title, error }: { title: string; error: unknown }) {
  toast.error(title, {
    description: error instanceof Error ? error.message : 'Try again.',
  })
}

export function useStickerCopy() {
  const [status, setStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (status !== 'copied') return
    const timer = setTimeout(() => setStatus('idle'), DONE_FLASH_MS)
    return () => clearTimeout(timer)
  }, [status])

  async function copy(image: StickerImage) {
    setStatus('copying')
    try {
      await copySticker(image)
      setStatus('copied')
    } catch (error) {
      setStatus('idle')
      showFailure({ title: "Couldn't copy the sticker", error })
    }
  }

  return { status, copy }
}
