type ThemeTokens = {
  ground: string
  surface: string
  raised: string
  tint: string
  hairline: string
  ink: string
  muted: string
  faint: string
  primary: string
  onPrimary: string
  success: string
  danger: string
}

export const THEMES = {
  dark: {
    ground: '#0C0C0D',
    surface: '#19191B',
    raised: '#232326',
    tint: '#2E2D2A',
    hairline: '#252528',
    ink: '#F2EEE5',
    muted: '#A29E96',
    faint: '#6E6A63',
    primary: '#F2EEE5',
    onPrimary: '#121212',
    success: '#7FC493',
    danger: '#F28B82',
  },
  light: {
    ground: '#F3F1EC',
    surface: '#FFFFFF',
    raised: '#EFEDE8',
    tint: '#E9E6E0',
    hairline: '#F0EEE9',
    ink: '#151514',
    muted: '#67635C',
    faint: '#B4B0A8',
    primary: '#151514',
    onPrimary: '#F2EEE5',
    success: '#276B3F',
    danger: '#B3261E',
  },
} as const satisfies Record<'dark' | 'light', ThemeTokens>

export type Theme = ThemeTokens

type PreviewBackgroundTokens = {
  label: string
  gradient: string[]
  gradientStops: number[]
  pillMaterial: string
  pillActive: string
  pillInk: string
  pillMuted: string
  storyTop: string
  storyBottom: string
}

export const PREVIEW_BACKGROUNDS = {
  dark: {
    label: 'Dark',
    gradient: ['#36363C', '#27272B', '#1B1B1E', '#141416'],
    gradientStops: [0, 0.4, 0.75, 1],
    pillMaterial: 'rgba(12, 12, 13, 0.55)',
    pillActive: 'rgba(242, 238, 229, 0.18)',
    pillInk: '#F2EEE5',
    pillMuted: '#C9C4BA',
    storyTop: '#27272B',
    storyBottom: '#141416',
  },
  light: {
    label: 'Light',
    gradient: ['#F3F0EA', '#E6E2D9', '#DAD5CB', '#D3CEC3'],
    gradientStops: [0, 0.45, 0.8, 1],
    pillMaterial: 'rgba(255, 255, 255, 0.6)',
    pillActive: 'rgba(21, 21, 20, 0.1)',
    pillInk: '#151514',
    pillMuted: '#4F4B45',
    storyTop: '#E6E2D9',
    storyBottom: '#D3CEC3',
  },
} satisfies Record<'dark' | 'light', PreviewBackgroundTokens>

export type PreviewBackground = keyof typeof PREVIEW_BACKGROUNDS

export const PREVIEW_BACKGROUND_KEYS: PreviewBackground[] = ['dark', 'light']

export const RADIUS = {
  stage: 28,
  card: 24,
  control: 16,
  segment: 12,
  pill: 999,
} as const

export const SPACE = {
  gutter: 16,
  stack: 16,
  row: 52,
  touch: 44,
} as const

export const PRESSED_OPACITY = 0.72

export const HIT_SLOP = 12
