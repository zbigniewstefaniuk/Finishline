import { useRef, useState, type Dispatch } from 'react'
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
      window.alert(
        `Could not read the screenshot. ${error instanceof Error ? error.message : 'Please try again.'}`,
      )
    }
    setUploadStatus('idle')
  }

  return (
    <div className="header-actions">
      <button
        type="button"
        className="header-pill"
        aria-label="Start a new sticker"
        onClick={() => dispatch({ type: 'start-new', today: new Date() })}
      >
        New
      </button>
      <button
        type="button"
        className="header-pill"
        aria-label="Upload a workout screenshot to fill in the stats"
        aria-busy={isReading}
        disabled={isReading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isReading ? 'Reading…' : 'Upload'}
      </button>
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
