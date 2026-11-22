import { useColorScheme } from 'react-native'
import { THEMES, type Theme } from './tokens'

export function useTheme(): Theme {
  return useColorScheme() === 'light' ? THEMES.light : THEMES.dark
}
