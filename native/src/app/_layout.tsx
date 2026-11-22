import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { useTheme } from '~/theme/use-theme'

export default function RootLayout() {
  const theme = useTheme()
  return (
    <KeyboardProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.ground },
          headerTintColor: theme.ink,
          contentStyle: { backgroundColor: theme.ground },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Finishline' }} />
      </Stack>
    </KeyboardProvider>
  )
}
