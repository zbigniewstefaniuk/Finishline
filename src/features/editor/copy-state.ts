export type CopyState = 'copy' | 'copying' | 'copied' | 'copy-again'

export function copyStateOf({
  isCopying,
  copiedUrl,
  currentUrl,
}: {
  isCopying: boolean
  copiedUrl: string | null
  currentUrl: string | null
}): CopyState {
  if (isCopying) return 'copying'
  if (copiedUrl === null) return 'copy'
  return copiedUrl === currentUrl ? 'copied' : 'copy-again'
}
