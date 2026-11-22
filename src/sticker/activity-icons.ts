import type { ActivityType } from '~/domain/activity'

export const ICON_BOX = { width: 32, height: 16, strokeWidth: 1.75 } as const

export const ICON_SECONDARY_OPACITY = 0.45

type ActivityIcon = {
  primary: string
  secondary: string
}

export const ACTIVITY_ICONS = {
  'pool-swim': {
    primary:
      'M2.5 4.5C4.75 2 7 2 9.25 4.5S13.75 7 16 4.5S20.5 2 22.75 4.5S27.25 7 29.5 4.5',
    secondary:
      'M2.5 12.5C4.75 10 7 10 9.25 12.5S13.75 15 16 12.5S20.5 10 22.75 12.5S27.25 15 29.5 12.5',
  },
  'open-water-swim': {
    primary:
      'M7.6 10.4a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0M11 11.4L14.2 5.4L18.6 5L23 10.6',
    secondary:
      'M2.5 13.5C4.75 12 7 12 9.25 13.5S13.75 15 16 13.5S20.5 12 22.75 13.5S27.25 15 29.5 13.5',
  },
  run: {
    primary:
      'M4 12.5H25.5C28 12.5 29.5 11.5 29.5 10.2C29.5 9 28.4 8.3 26.8 7.9L20.5 6.4L15.5 3L12.6 5.7C10.9 6.9 8.2 6.8 6.4 5.1L4.6 3.7C3.8 6.7 3.6 9.7 4 12.5Z',
    secondary: 'M4.2 10H29.2M16.4 6.1L15 7.6M19 7.2L17.8 8.5',
  },
  'trail-run': {
    primary:
      'M4 12.5H25.5C28 12.5 29.5 11.5 29.5 10.2C29.5 9 28.4 8.3 26.8 7.9L20.5 6.4L15.5 3L12.6 5.7C10.9 6.9 8.2 6.8 6.4 5.1L4.6 3.7C3.8 6.7 3.6 9.7 4 12.5Z',
    secondary:
      'M5.5 14.5L7 13.2L8.5 14.5M11.5 14.5L13 13.2L14.5 14.5M17.5 14.5L19 13.2L20.5 14.5M23.5 14.5L25 13.2L26.5 14.5M16.4 6.1L15 7.6M19 7.2L17.8 8.5',
  },
  walk: {
    primary: 'M7.5 14.5L13.5 2.5M24.5 14.5L18.5 2.5',
    secondary: 'M16 14V11.5M16 8.25V6.25M16 3.75V2.75',
  },
  hike: {
    primary:
      'M5 12.5H25.5C27.6 12.5 28.6 11.5 28.6 10.3C28.6 9.1 27.6 8.5 26 8.2L19.8 7L18.4 2.9C14.8 2 10 2 6.4 2.9C6.8 6 5.6 9.2 5 12.5Z',
    secondary:
      'M5.5 14.5L7 13.2L8.5 14.5M11.5 14.5L13 13.2L14.5 14.5M17.5 14.5L19 13.2L20.5 14.5M23.5 14.5L25 13.2L26.5 14.5M15.6 4.4L13.2 5.4M16.4 7L14 8',
  },
  ride: {
    primary:
      'M2.5 9.5a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M19.5 9.5a5 5 0 1 0 10 0a5 5 0 1 0 -10 0',
    secondary: 'M7.5 9.5L12.5 3.5H20.5L24.5 9.5',
  },
  row: {
    primary:
      'M3 3L22.5 11.5M22.5 11.5C25 11.2 28 12.2 29.5 14C27.5 14.8 24 14 22.5 11.5Z',
    secondary: 'M29 3L9.5 11.5M9.5 11.5C7 11.2 4 12.2 2.5 14C4.5 14.8 8 14 9.5 11.5Z',
  },
  ski: {
    primary: 'M2.5 14.5H25.5A3 3 0 0 0 28.5 11.5M4.5 11H27A2.5 2.5 0 0 0 29.5 8.5',
    secondary: 'M10 2.5L20.5 8.5M22 2.5L11.5 8.5',
  },
} as const satisfies Record<ActivityType, ActivityIcon>
