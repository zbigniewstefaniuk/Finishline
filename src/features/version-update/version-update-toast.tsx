import { RiArrowUpCircleLine, RiRocketLine } from '@remixicon/react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { updateApplication, useLatestVersion } from './version-check'

const VERSION_TOAST_ID = 'version-update'

const RELEASE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function releaseTime(builtAt: string) {
  const date = new Date(builtAt)
  return Number.isNaN(date.getTime()) ? null : RELEASE_TIME_FORMAT.format(date)
}

export function VersionUpdateToast() {
  const { hasUpdate, latestVersion } = useLatestVersion()

  useEffect(() => {
    if (!hasUpdate || !latestVersion) {
      toast.dismiss(VERSION_TOAST_ID)
      return
    }
    const time = releaseTime(latestVersion.builtAt)
    toast.info('Update ready', {
      id: VERSION_TOAST_ID,
      description: (
        <span className="flex flex-col">
          {time ? <span>Released {time}</span> : null}
          <span>Takes just a moment.</span>
        </span>
      ),
      icon: <RiArrowUpCircleLine className="size-4" aria-hidden="true" />,
      duration: Infinity,
      dismissible: false,
      action: {
        label: (
          <span className="flex items-center gap-1.5">
            <RiRocketLine className="size-3.5" aria-hidden="true" />
            Update
          </span>
        ),
        onClick: updateApplication,
      },
    })
    return () => {
      toast.dismiss(VERSION_TOAST_ID)
    }
  }, [hasUpdate, latestVersion])

  return null
}
