import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import {
  CAN_SHARE_FILES,
  copySticker,
  downloadSticker,
  shareSticker,
} from '~/share/share-sticker'
import type { StickerImage } from '~/sticker/render-sticker'

type CopyStatus = 'idle' | 'copying' | 'copied'

const DONE_FLASH_MS = 1600

const COPY_LABELS = {
  idle: 'Copy',
  copying: 'Copying…',
  copied: 'Copied',
} as const satisfies Record<CopyStatus, string>

function showFailure({ title, error }: { title: string; error: unknown }) {
  toast.error(title, {
    description: error instanceof Error ? error.message : 'Try again.',
  })
}

export function ExportBar({ image }: { image: StickerImage | null }) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (copyStatus !== 'copied') return
    const timer = setTimeout(() => setCopyStatus('idle'), DONE_FLASH_MS)
    return () => clearTimeout(timer)
  }, [copyStatus])

  const isDisabled = image === null || copyStatus === 'copying'

  async function copy(sticker: StickerImage) {
    setCopyStatus('copying')
    try {
      await copySticker(sticker)
      setCopyStatus('copied')
    } catch (error) {
      setCopyStatus('idle')
      showFailure({ title: "Couldn't copy the sticker", error })
    }
  }

  async function share(sticker: StickerImage) {
    try {
      await shareSticker(sticker)
    } catch (error) {
      showFailure({ title: "Couldn't share the sticker", error })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-130 gap-3 bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <Button
        variant="secondary"
        className="h-13 flex-1 text-base"
        disabled={isDisabled}
        onClick={() => {
          if (!image) return
          if (CAN_SHARE_FILES) void share(image)
          else downloadSticker(image)
        }}
      >
        {CAN_SHARE_FILES ? 'Share' : 'Download'}
      </Button>
      <Button
        className="h-13 flex-[1.5] text-base"
        disabled={isDisabled}
        onClick={() => {
          if (image) void copy(image)
        }}
      >
        {copyStatus === 'copying' ? <Spinner data-icon="inline-start" /> : null}
        {COPY_LABELS[copyStatus]}
      </Button>
    </div>
  )
}
