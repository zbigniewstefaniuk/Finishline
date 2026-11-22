import { Asset, requestPermissionsAsync } from 'expo-media-library'

export async function saveToPhotos(fileUri: string) {
  const permission = await requestPermissionsAsync(true)
  if (!permission.granted) return 'denied' as const
  await Asset.create(fileUri)
  return 'saved' as const
}
