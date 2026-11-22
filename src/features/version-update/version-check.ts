import currentVersion from 'virtual:app-version'
import { useEffect, useState } from 'react'

type BuildInfo = typeof currentVersion

const VERSION_CHECK = { url: 'version.json', intervalMs: 2 * 60_000 } as const
const UPDATED_FROM_KEY = 'app-updated-from'

function isBuildInfo(value: unknown): value is BuildInfo {
  if (typeof value !== 'object' || value === null) return false
  const hasBuildId = 'buildId' in value && typeof value.buildId === 'string'
  const hasBuiltAt = 'builtAt' in value && typeof value.builtAt === 'string'
  return hasBuildId && hasBuiltAt
}

async function fetchLatestVersion() {
  const response = await fetch(VERSION_CHECK.url, { cache: 'no-store' })
  if (!response.ok) return null
  const body: unknown = await response.json()
  return isBuildInfo(body) ? body : null
}

export function updateApplication() {
  sessionStorage.setItem(UPDATED_FROM_KEY, currentVersion.buildId)
  location.reload()
}

export function forgetCompletedUpdate() {
  if (sessionStorage.getItem(UPDATED_FROM_KEY) === currentVersion.buildId) return
  sessionStorage.removeItem(UPDATED_FROM_KEY)
}

export function updateOnStaleChunk(event: VitePreloadErrorEvent) {
  if (sessionStorage.getItem(UPDATED_FROM_KEY) === currentVersion.buildId) return
  event.preventDefault()
  updateApplication()
}

export function useLatestVersion() {
  const [latestVersion, setLatestVersion] = useState<BuildInfo | null>(null)

  useEffect(() => {
    if (!import.meta.env.PROD) return
    const check = () => {
      fetchLatestVersion()
        .then((version) => {
          if (!version) return
          setLatestVersion((previous) =>
            previous?.buildId === version.buildId ? previous : version,
          )
        })
        .catch(() => undefined)
    }
    check()
    const timer = setInterval(check, VERSION_CHECK.intervalMs)
    window.addEventListener('focus', check)
    window.addEventListener('online', check)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('online', check)
    }
  }, [])

  const hasUpdate =
    latestVersion !== null && latestVersion.buildId !== currentVersion.buildId
  return { hasUpdate, latestVersion }
}
