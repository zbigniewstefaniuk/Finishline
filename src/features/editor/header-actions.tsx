import { useRef, useState, type Dispatch } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import { parseWorkoutScan } from '~/domain/workout-scan'
import { readScreenshotLines } from '~/scan/read-screenshot'
import type { EditorAction } from './editor-state'

type UploadStatus = 'idle' | 'reading'

export function HeaderActions({ dispatch }: { dispatch: Dispatch<EditorAction> }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const isReading = uploadStatus === 'reading'

  async function upload(file: File) {
    setUploadStatus('reading')
    try {
      const lines = await readScreenshotLines(file)
      dispatch({
        type: 'apply-scan',
        scan: parseWorkoutScan({ lines, today: new Date() }),
      })
    } catch (error) {
      toast.error("Couldn't read the screenshot", {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    }
    setUploadStatus('idle')
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="lg"
        aria-label="Start a new sticker"
        onClick={() => dispatch({ type: 'start-new', today: new Date() })}
      >
        New
      </Button>
      <Button
        variant="secondary"
        size="lg"
        aria-label="Upload a workout screenshot to fill in the stats"
        aria-busy={isReading}
        disabled={isReading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isReading ? <Spinner data-icon="inline-start" /> : null}
        {isReading ? 'Reading…' : 'Upload'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void upload(file)
        }}
      />
    </div>
  )
}
