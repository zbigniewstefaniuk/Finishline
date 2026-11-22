@AGENTS.md

# Finishline (native, shelved)

Shelved Expo app, kept for reference. The product is now the web app at the repo root; run
the commands below from inside `native/`.

Expo app that turns workout stats into a transparent PNG sticker for Instagram Stories.
Expo SDK 58 · React Native 0.88 · React 19 (React Compiler on) · TypeScript 7 strict ·
expo-router · Skia · bun · oxlint + oxfmt · Vitest.

## Commands

```bash
bun run check        # oxlint, tsc, vitest, oxfmt --check
bun run format       # oxfmt write
bun run test:watch
bun run start        # Metro for the dev client
bun run android      # local build + run on the Android emulator (needs Android Studio)
bunx eas-cli build --profile development --platform ios
```

## Layout

```
src/app/              expo-router routes only; screens live in features/
src/domain/           plain TypeScript: activities, parsing, formatting, pace, StickerData,
                      screenshot text parser (workout-scan.ts, scan-date.ts)
src/features/editor/  the editor screen, its reducer (editor-state.ts) and parts
src/sticker/          Skia sticker layouts (minimal, strip, editorial), icons, fonts, 3x PNG export
src/share/            save to photos, Instagram Stories share with share-sheet fallback
src/scan/             pick a screenshot (expo-image-picker), on-device ML Kit OCR (expo-mlkit-ocr)
src/health/           Health Connect: access check, read-only permissions, recent sessions + totals
src/theme/            colour tokens for dark/light and the preview backgrounds
```

## Rules

- Continuous Native Generation: never create or edit `ios/` or `android/`. Native config goes
  through `app.json` and config plugins.
- `src/domain` imports no React, React Native, Expo or Skia (oxlint enforces it). Unit tests
  sit next to the file (`parse.ts` → `parse.test.ts`) and cover domain and reducer logic.
- The sticker is drawn by Skia from `StickerData`. Preview and export share `layoutSticker`
  (picks the layout by `StickerData.style`) + `StickerDrawing` (`sticker-drawing.tsx`); export
  renders offscreen at 3x, so it never depends on the device pixel ratio.
- New sport: add it to `ACTIVITIES` (`src/domain/activity.ts`), `ACTIVITY_ICONS` and, for a
  new pace style, `PACE_STYLES` (`src/domain/pace.ts`). Optionally add its keywords to
  `ACTIVITY_KEYWORDS` (`src/domain/workout-scan.ts`) so screenshots detect it. New layout
  style: a sibling of `minimal-sticker.ts` that takes `StickerData`, added to `STICKER_STYLES`
  (`src/domain/sticker-data.ts`) and `STICKER_LAYOUTS` (`src/sticker/layout-sticker.ts`).
- Screenshot import: `src/scan` returns positioned `OcrLine`s; `parseWorkoutScan` turns them
  into a `WorkoutScan`. Test parser changes with a text layout sample in `workout-scan.test.ts`.
- Health Connect import (Android): `src/health/health-connect.ts` reads `ExerciseSession`s
  and aggregates totals per session, filtered to the session's own data origin;
  `src/domain/health-workout.ts` maps them into a `WorkoutScan` for the same `apply-scan`
  path the screenshot uses. `react-native-health-connect` v4 ships its own Expo plugin
  (`expo-health-connect` is deprecated); it needs `minSdkVersion` 26 via
  `expo-build-properties`. Read permissions only, declared in `app.json`.
- HealthKit (iOS) and other imports map into `Workout` (`src/domain/workout.ts`).
- Hermes in RN 0.88 has no `Array.prototype.toSorted` (Node and Vitest do, so tests pass and
  the device throws "undefined is not a function"). Copy and `sort` instead.
- No `useMemo` / `useCallback` / `React.memo`. React Compiler bails on `try/finally` in
  components; keep handlers to `try/catch`.
- `expo-media-library` 58 uses the new API: `Asset.create(uri)` after a write-only permission
  request. `saveToLibraryAsync` throws at runtime.
- `EXPO_PUBLIC_FACEBOOK_APP_ID` (`.env`, EAS env var) enables the Instagram Stories share;
  without it the share sheet opens instead.
