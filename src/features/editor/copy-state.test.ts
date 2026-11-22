import { describe, expect, it } from 'vitest'
import { copyStateOf } from './copy-state'

describe('copyStateOf', () => {
  it('offers a first copy before anything was copied', () => {
    expect(copyStateOf({ isCopying: false, copiedUrl: null, currentUrl: 'a' })).toBe(
      'copy',
    )
  })

  it('shows the copy in progress over everything else', () => {
    expect(copyStateOf({ isCopying: true, copiedUrl: 'a', currentUrl: 'a' })).toBe(
      'copying',
    )
  })

  it('stays copied while the clipboard holds the sticker on screen', () => {
    expect(copyStateOf({ isCopying: false, copiedUrl: 'a', currentUrl: 'a' })).toBe(
      'copied',
    )
  })

  it('asks to copy again once the sticker changed after copying', () => {
    expect(copyStateOf({ isCopying: false, copiedUrl: 'a', currentUrl: 'b' })).toBe(
      'copy-again',
    )
    expect(copyStateOf({ isCopying: false, copiedUrl: 'a', currentUrl: null })).toBe(
      'copy-again',
    )
  })
})
