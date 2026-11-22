import { Group, ImageFormat, drawAsImage } from '@shopify/react-native-skia'
import { File, Paths } from 'expo-file-system'
import { StickerDrawing, type StickerLayout } from './sticker-drawing'

const EXPORT_SCALE = 3

async function renderSticker(layout: StickerLayout) {
  const image = await drawAsImage(
    <Group transform={[{ scale: EXPORT_SCALE }]}>
      <StickerDrawing layout={layout} />
    </Group>,
    {
      width: Math.ceil(layout.width * EXPORT_SCALE),
      height: Math.ceil(layout.height * EXPORT_SCALE),
    },
  )
  if (!image) throw new Error('Skia could not render the sticker')
  return image
}

export async function exportStickerPng(layout: StickerLayout) {
  const image = await renderSticker(layout)
  const file = new File(Paths.cache, `finishline-sticker-${Date.now()}.png`)
  file.create({ overwrite: true })
  await file.write(image.encodeToBytes(ImageFormat.PNG))
  return file.uri
}

export async function exportStickerBase64(layout: StickerLayout) {
  const image = await renderSticker(layout)
  return image.encodeToBase64(ImageFormat.PNG)
}
