import { RiCheckLine } from '@remixicon/react'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import { CAN_SHARE_FILES, downloadSticker, shareSticker } from '~/share/share-sticker'
import type { StickerImage } from '~/sticker/render-sticker'
import type { CopyState } from './copy-state'
import { showFailure } from './use-sticker-copy'

const COPY_LABELS = {
  copy: 'Copy',
  copying: 'Copying…',
  copied: 'Copied',
  'copy-again': 'Copy again',
} as const satisfies Record<CopyState, string>

async function share(sticker: StickerImage) {
  try {
    await shareSticker(sticker)
  } catch (error) {
    showFailure({ title: "Couldn't share the sticker", error })
  }
}

export function ExportBar({
  image,
  copyState,
  onCopy,
  children,
}: {
  image: StickerImage | null
  copyState: CopyState
  onCopy: (image: StickerImage) => void
  children: ReactNode
}) {
  const isDisabled = image === null || copyState === 'copying'

  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto max-w-130 bg-background px-4 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {children}
      <div className="mt-1 flex gap-3">
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
            if (image) onCopy(image)
          }}
        >
          {copyState === 'copying' ? <Spinner data-icon="inline-start" /> : null}
          {copyState === 'copied' ? (
            <RiCheckLine data-icon="inline-start" aria-hidden="true" />
          ) : null}
          {COPY_LABELS[copyState]}
        </Button>
      </div>
    </div>
  )
}
