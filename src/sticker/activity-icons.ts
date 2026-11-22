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
      'M2 5.5C4.33 2.83 6.67 2.83 9 5.5S13.67 8.17 16 5.5S20.67 2.83 23 5.5S27.67 8.17 30 5.5',
    secondary:
      'M2 12C4.33 9.33 6.67 9.33 9 12S13.67 14.67 16 12S20.67 9.33 23 12S27.67 14.67 30 12',
  },
  'open-water-swim': {
    primary: 'M7.5 8.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M12.5 9C14 4 20.5 3.5 23.5 8',
    secondary:
      'M2.5 13C4.75 10.5 7 10.5 9.25 13S13.75 15.5 16 13S20.5 10.5 22.75 13S27.25 15.5 29.5 13',
  },
  run: {
    primary: 'M29.5 2.5H11.5A6 6 0 0 0 11.5 14.5H29.5',
    secondary: 'M29.5 6.5H11.5A2 2 0 0 0 11.5 10.5H29.5',
  },
  'trail-run': {
    primary: 'M2.5 14.5C10 14.5 10 8.5 16 8.5S22 2.5 29.5 2.5',
    secondary: 'M3 9.5L6 3L9 9.5ZM23 14.5L26 8L29 14.5Z',
  },
  walk: {
    primary: 'M8 14.5L13.5 2.5M24 14.5L18.5 2.5',
    secondary: 'M14.25 12.5h.5M17.25 9.5h.5M14.9 7h.4M16.9 4.9h.3',
  },
  hike: {
    primary: 'M2.5 14.5L11 5.5L16.5 11L20.5 7L29.5 14.5',
    secondary: 'M11 5.5V2.5L14.5 3.5L11 4.5',
  },
  ride: {
    primary:
      'M2.75 10.5a4.75 4.75 0 1 0 9.5 0a4.75 4.75 0 1 0 -9.5 0M19.75 10.5a4.75 4.75 0 1 0 9.5 0a4.75 4.75 0 1 0 -9.5 0',
    secondary: 'M7.5 10.5H15L11.5 4ZM11.5 4H21L15 10.5M21 4L24.5 10.5',
  },
  row: {
    primary:
      'M4 9.5H28C25 12 21 12.5 16 12.5S7 12 4 9.5ZM12 5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M15.5 7.5L25 14.5',
    secondary: 'M2.5 14.5H29.5',
  },
  ski: {
    primary: 'M2.5 14.5H24.5A3.5 3.5 0 0 0 28 11M6.5 10.5H26.5A3 3 0 0 0 29.5 7.5',
    secondary: 'M3 2.5L13.5 9.5M8.5 2.5L19 9.5',
  },
} as const satisfies Record<ActivityType, ActivityIcon>
