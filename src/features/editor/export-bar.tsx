import { useEffect, useState } from 'react'
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
  window.alert(
    `${title}. ${error instanceof Error ? error.message : 'Please try again.'}`,
  )
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
      showFailure({ title: 'Could not copy the sticker', error })
    }
  }

  async function share(sticker: StickerImage) {
    try {
      await shareSticker(sticker)
    } catch (error) {
      showFailure({ title: 'Could not share the sticker', error })
    }
  }

  return (
    <div className="export-bar">
      <button
        type="button"
        className="action action-secondary"
        disabled={isDisabled}
        onClick={() => {
          if (!image) return
          if (CAN_SHARE_FILES) void share(image)
          else downloadSticker(image)
        }}
      >
        {CAN_SHARE_FILES ? 'Share' : 'Download'}
      </button>
      <button
        type="button"
        className="action action-primary"
        disabled={isDisabled}
        onClick={() => {
          if (image) void copy(image)
        }}
      >
        {COPY_LABELS[copyStatus]}
      </button>
    </div>
  )
}
