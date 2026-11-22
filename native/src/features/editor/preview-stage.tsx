import { Canvas, Group, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import { useState, type Dispatch } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StickerDrawing, type StickerLayout } from '~/sticker/sticker-drawing'
import {
  PREVIEW_BACKGROUND_KEYS,
  PREVIEW_BACKGROUNDS,
  PRESSED_OPACITY,
  RADIUS,
  SPACE,
  type PreviewBackground,
} from '~/theme/tokens'
import type { EditorAction } from './editor-state'

const STAGE_HEIGHT = 320
const STICKER_AREA = { top: 8, bottom: 64, sides: 24 } as const
const GRADIENT_REACH = 1.2
const MAX_STICKER_SCALE = 1

function fitSticker({
  layout,
  width,
  height,
}: {
  layout: StickerLayout
  width: number
  height: number
}) {
  const areaWidth = width - STICKER_AREA.sides * 2
  const areaHeight = height - STICKER_AREA.top - STICKER_AREA.bottom
  const scale = Math.min(
    MAX_STICKER_SCALE,
    areaWidth / layout.width,
    areaHeight / layout.height,
  )
  return [
    { translateX: (width - layout.width * scale) / 2 },
    { translateY: STICKER_AREA.top + (areaHeight - layout.height * scale) / 2 },
    { scale },
  ]
}

export function PreviewStage({
  layout,
  hasWorkout,
  background,
  dispatch,
}: {
  layout: StickerLayout | null
  hasWorkout: boolean
  background: PreviewBackground
  dispatch: Dispatch<EditorAction>
}) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const tokens = PREVIEW_BACKGROUNDS[background]
  const hasSize = size.width > 0

  return (
    <View
      style={styles.stage}
      onLayout={(event) =>
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        })
      }
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={size.width} height={size.height}>
          <RadialGradient
            c={vec(size.width / 2, 0)}
            r={size.height * GRADIENT_REACH}
            colors={tokens.gradient}
            positions={tokens.gradientStops}
          />
        </Rect>
        {layout && hasSize ? (
          <Group transform={fitSticker({ layout, ...size })}>
            <StickerDrawing layout={layout} />
          </Group>
        ) : null}
      </Canvas>
      {hasWorkout ? null : (
        <View style={styles.emptyArea} pointerEvents="none">
          <Text style={[styles.emptyHint, { color: tokens.pillMuted }]}>
            {'Enter a distance and time,\nor upload a screenshot.'}
          </Text>
        </View>
      )}
      <View style={[styles.switcher, { backgroundColor: tokens.pillMaterial }]}>
        {PREVIEW_BACKGROUND_KEYS.map((key) => {
          const isActive = key === background
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${PREVIEW_BACKGROUNDS[key].label} preview background`}
              accessibilityState={{ selected: isActive }}
              onPress={() => dispatch({ type: 'set-background', background: key })}
              style={({ pressed }) => [
                styles.switcherOption,
                isActive && { backgroundColor: tokens.pillActive },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.switcherLabel,
                  { color: isActive ? tokens.pillInk : tokens.pillMuted },
                ]}
              >
                {PREVIEW_BACKGROUNDS[key].label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  stage: {
    height: STAGE_HEIGHT,
    marginHorizontal: SPACE.gutter,
    borderRadius: RADIUS.stage,
    overflow: 'hidden',
  },
  emptyArea: {
    position: 'absolute',
    top: STICKER_AREA.top,
    bottom: STICKER_AREA.bottom,
    left: STICKER_AREA.sides,
    right: STICKER_AREA.sides,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  switcher: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 2,
    padding: 4,
    borderRadius: RADIUS.pill,
  },
  switcherOption: {
    height: 36,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  switcherLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
