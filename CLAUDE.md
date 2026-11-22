# Finishline

Web app that turns workout stats into a transparent PNG sticker: copy it, paste it into an
Instagram Story. Vite 8 · React 19 (React Compiler via Babel) · TypeScript 7 strict · Canvas 2D ·
bun · oxlint + oxfmt · Vitest.

The shelved Expo app lives in `native/` with its own package, lockfile and CLAUDE.md. It is not
part of the web build, lint or tests; run its commands from inside `native/`.

## Commands

```bash
bun run check        # oxlint, tsc, vitest, oxfmt --check
bun run format       # oxfmt write
bun run dev          # Vite dev server
bun run build        # production build to dist/
bun run test:watch
```

Pull requests run `bun run check` and the build (`.github/workflows/check.yml`). Every push to
`main` runs the same, then deploys to GitHub Pages
(`.github/workflows/deploy-pages.yml`): https://zbigniewstefaniuk.github.io/Finishline/. Vite uses
`base: './'` and the HTML and manifest use relative URLs, so the same build works at `/` locally
and under `/Finishline/` on Pages.

## Layout

```
src/domain/           plain TypeScript: activities, parsing, formatting, pace, StickerData,
                      screenshot text parser (workout-scan.ts, scan-date.ts)
src/features/editor/  the editor screen, its reducer (editor-state.ts) and parts
src/sticker/          canvas sticker layouts (minimal, strip, editorial), icons, fonts, 3x PNG render
src/share/            copy to clipboard, Web Share, download
src/scan/             screenshot OCR with Tesseract.js (lazy-loaded; worker, core and English data
                      come from the jsDelivr CDN on first use)
src/assets/fonts/     Inter Display subset to Latin as WOFF2 (OFL licence alongside)
src/styles.css        colour tokens for dark/light and all component styles
```

## Rules

- `src/domain` imports no React (oxlint enforces it). Unit tests sit next to the file
  (`parse.ts` → `parse.test.ts`) and cover domain and reducer logic.
- The sticker is drawn on a canvas from `StickerData`. `renderSticker`
  (`src/sticker/render-sticker.ts`) picks the layout by `StickerData.style`, draws at 3x and
  returns a PNG data URL; the preview shows that same image, so preview and export never drift.
  Long-pressing the preview image is the browser's own copy/save fallback.
- Text is measured and drawn character by character (`sticker-drawing.ts`) so tracking works in
  browsers without `CanvasRenderingContext2D.letterSpacing`. Layout waits for
  `STICKER_FONTS_READY` via `use()` under a Suspense boundary.
- Copy and Share must call `navigator.clipboard.write` / `navigator.share` synchronously inside
  the click handler (iOS Safari drops the user gesture after an `await`). Both need a secure
  context: test on a phone over HTTPS, not a LAN `http://` address.
- New sport: add it to `ACTIVITIES` (`src/domain/activity.ts`), `ACTIVITY_ICONS` and, for a
  new pace style, `PACE_STYLES` (`src/domain/pace.ts`). Optionally add its keywords to
  `ACTIVITY_KEYWORDS` (`src/domain/workout-scan.ts`) so screenshots detect it. New layout style: a sibling of
  `minimal-sticker.ts` that takes `StickerData`, added to `STICKER_STYLES`
  (`src/domain/sticker-data.ts`) and `STICKER_LAYOUTS` (`src/sticker/render-sticker.ts`).
- Screenshot import: `readScreenshotLines` runs Tesseract in sparse-text mode, then
  `splitOcrColumns` (`src/domain/ocr-columns.ts`) splits lines that merged neighbouring grid
  columns; `parseWorkoutScan` turns the phrases into a `WorkoutScan` for the reducer's
  `apply-scan`. Test parser changes with a text layout sample in `workout-scan.test.ts`.
- No `useMemo` / `useCallback` / `React.memo`. React Compiler bails on `try/finally` in
  components; keep handlers to `try/catch`.
- oxlint runs with `--disable-nested-config` so it never loads `native/oxlint.config.mts`.
