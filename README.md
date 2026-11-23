<p align="center">
  <img src="public/icon.png" width="88" alt="" />
</p>

<h1 align="center">Finishline</h1>

<p align="center">
  Workout stats → transparent sticker → Instagram Story.<br />
  <a href="https://zbigniewstefaniuk.github.io/Finishline/"><strong>Open the app</strong></a>
</p>

---

## How it works

1. Type your stats, or import a screenshot of your workout.
2. Pick a layout. Swipe the preview to change it, double-tap to flip the background.
3. Copy (or hold the preview), open your Story, paste.

The sticker is a 3x PNG with a transparent background. Everything runs in the browser:
screenshots are read on your device, nothing is uploaded.

## What's in it

- **7 layouts**: minimal, strip, editorial, grid, stack, caption, race bib
- **9 sports**: run, trail run, walk, hike, ride, ski, row, pool swim, open water
- **The right pace per sport**: `/km`, `/100m`, `/500m` split or `km/h`
- **Screenshot import** with on-device OCR (Tesseract.js, loaded on first use)
- **Copy or share**, with a download fallback where the browser can't share files

## Develop

Needs [Bun](https://bun.sh).

```bash
bun install
bun run dev      # Vite dev server
bun run check    # lint, typecheck, tests, format check
bun run build    # production build to dist/
```

Clipboard copy and Web Share need a secure context, so test them on a phone over HTTPS,
not a LAN `http://` address.

Every push to `main` runs the checks and deploys to GitHub Pages.

## Stack

Vite · React 19 with React Compiler · TypeScript · Tailwind 4 · shadcn on Base UI ·
Canvas 2D · Tesseract.js · oxlint + oxfmt · Vitest
