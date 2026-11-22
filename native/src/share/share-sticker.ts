import { Linking, Platform } from 'react-native'
import Share, { Social } from 'react-native-share'
import { PREVIEW_BACKGROUNDS, type PreviewBackground } from '~/theme/tokens'

const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? ''
const INSTAGRAM_ANDROID_PACKAGE = 'com.instagram.android'
const INSTAGRAM_STORIES_URL = 'instagram-stories://share'

async function canShareToInstagramStories() {
  if (!FACEBOOK_APP_ID) return false
  if (Platform.OS === 'android') {
    const { isInstalled } = await Share.isPackageInstalled(INSTAGRAM_ANDROID_PACKAGE)
    return isInstalled
  }
  return Linking.canOpenURL(INSTAGRAM_STORIES_URL)
}

async function openShareSheet(fileUri: string) {
  await Share.open({ url: fileUri, type: 'image/png', failOnCancel: false })
}

export async function shareSticker({
  fileUri,
  background,
}: {
  fileUri: string
  background: PreviewBackground
}) {
  if (!(await canShareToInstagramStories())) {
    await openShareSheet(fileUri)
    return
  }
  try {
    await Share.shareSingle({
      social: Social.InstagramStories,
      appId: FACEBOOK_APP_ID,
      stickerImage: fileUri,
      backgroundTopColor: PREVIEW_BACKGROUNDS[background].storyTop,
      backgroundBottomColor: PREVIEW_BACKGROUNDS[background].storyBottom,
    })
  } catch {
    await openShareSheet(fileUri)
  }
}
