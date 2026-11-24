import { RiArrowUpSLine } from '@remixicon/react'
import type { Dispatch } from 'react'
import { Button } from '~/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer'
import type { ActivityType } from '~/domain/activity'
import { statLabel, type StickerOptions } from '~/domain/sticker-data'
import type { Workout } from '~/domain/workout'
import type { EditorAction, EditorMode } from './editor-state'
import {
  AdventOptionsSection,
  INK_LABELS,
  SEASON_LABELS,
  STYLE_LABELS,
  StickerOptionsSection,
} from './sticker-options'

function summaryOf({
  mode,
  options,
  activity,
}: {
  mode: EditorMode
  options: StickerOptions
  activity: ActivityType
}) {
  if (mode === 'advent') return `${INK_LABELS[options.ink]} ink`
  const stats = options.stats.map((stat) => statLabel({ stat, activity }))
  const shown = options.showsDate ? [...stats, 'Date'] : stats
  const details = shown.length > 0 ? shown.join(', ') : 'No stats'
  const season = options.season === 'off' ? [] : [SEASON_LABELS[options.season]]
  return [STYLE_LABELS[options.style], ...season, details].join(' · ')
}

export function OptionsDrawer({
  mode,
  options,
  activity,
  workout,
  dispatch,
}: {
  mode: EditorMode
  options: StickerOptions
  activity: ActivityType
  workout: Workout | null
  dispatch: Dispatch<EditorAction>
}) {
  return (
    <Drawer
      modal={false}
      showSwipeHandle
      onOpenChange={(open) => {
        if (open) window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    >
      <DrawerSwipeArea className="touch-none">
        <DrawerTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-1 py-2 text-left"
            />
          }
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">Sticker options</span>
            <span className="truncate text-sm text-muted-foreground">
              {summaryOf({ mode, options, activity })}
            </span>
          </span>
          <RiArrowUpSLine aria-hidden="true" className="size-5 text-muted-foreground" />
        </DrawerTrigger>
      </DrawerSwipeArea>
      <DrawerContent className="[--drawer-content-max-height:calc(100dvh-25rem)] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-25rem)]">
        <DrawerHeader>
          <DrawerTitle>Sticker options</DrawerTitle>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {mode === 'advent' ? (
            <AdventOptionsSection ink={options.ink} dispatch={dispatch} />
          ) : (
            <StickerOptionsSection
              options={options}
              activity={activity}
              workout={workout}
              dispatch={dispatch}
            />
          )}
        </div>
        <DrawerFooter className="pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose render={<Button size="lg" className="h-12 text-base" />}>
            Done
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
