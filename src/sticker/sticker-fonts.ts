import boldUrl from '~/assets/fonts/inter-display-bold.woff2'
import extraBoldUrl from '~/assets/fonts/inter-display-extrabold.woff2'
import mediumUrl from '~/assets/fonts/inter-display-medium.woff2'
import semiBoldUrl from '~/assets/fonts/inter-display-semibold.woff2'

export const STICKER_FONT_FAMILY = 'Inter Display'

const STICKER_FONT_FILES = [
  { url: mediumUrl, weight: '500' },
  { url: semiBoldUrl, weight: '600' },
  { url: boldUrl, weight: '700' },
  { url: extraBoldUrl, weight: '800' },
] as const

async function loadStickerFonts() {
  const results = await Promise.allSettled(
    STICKER_FONT_FILES.map(({ url, weight }) =>
      new FontFace(STICKER_FONT_FAMILY, `url(${url})`, { weight }).load(),
    ),
  )
  for (const result of results) {
    if (result.status === 'fulfilled') document.fonts.add(result.value)
    else console.warn('Sticker font failed to load', result.reason)
  }
}

export const STICKER_FONTS_READY = loadStickerFonts()
