export const STICKER_FONT_FAMILY = 'Inter Display'

export const STICKER_FONTS = {
  [STICKER_FONT_FAMILY]: [
    require<number>('../../assets/fonts/inter-display-medium.ttf'),
    require<number>('../../assets/fonts/inter-display-semibold.ttf'),
    require<number>('../../assets/fonts/inter-display-bold.ttf'),
    require<number>('../../assets/fonts/inter-display-extrabold.ttf'),
  ],
}
