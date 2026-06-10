# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two independent projects in one repo

This repository contains **two separate codebases** that share the *concept* of the Optics scale but **not the code**. There is no shared module between them — be careful not to assume a change in one propagates to the other.

1. **Root (`src/`)** — a TypeScript CLI + Node library (`optics` binary). Compiled with `tsc` → `dist/`, tested with Jest.
2. **`optics-ui/`** — a Svelte 5 + Vite single-page web app (the visual editor). Independent `package.json`, built with Vite, deployed to Vercel.

The Optics 19-stop scale lightness tables exist in **both** places and must be kept in sync manually if changed:
- CLI: `src/optics-generator.ts` (`OPTICS_SCALE` — a single array of per-stop configs)
- UI: `optics-ui/src/lib/data/defaults.ts` (`LIGHT_MODE_BG`, `DARK_MODE_BG`, `LIGHT_MODE_ON`, etc. — separate `Record` maps)

Likewise `ALERT_TYPE_NAMES` (`['notice','warning','danger','info']`) is defined independently in both exporters (`src/optics-exporter.ts` and `optics-ui/src/lib/utils/export.ts`) — keep them in sync. See "Alert grouping" below.

## Commands

### Root CLI / library
```bash
npm run build          # tsc → dist/
npm run dev            # tsx src/cli.ts (run CLI without building)
npm test               # jest (all tests in tests/ and src/**/__tests__)
npm run test:watch
npm run test:coverage
npx jest tests/contrast.test.ts          # run a single test file
npx jest -t "name of test"               # run tests matching a name
node dist/cli.js generate "#3b82f6" --name primary --optics   # run built CLI
```

### optics-ui (web app) — run from inside `optics-ui/`
```bash
cd optics-ui
npm install
npm run dev            # vite dev server → http://localhost:5173
npm run build          # vite production build → optics-ui/dist
npm run check          # svelte-check + tsc type-check
npm test               # vitest run (export/import util tests)
```

## Architecture

### Core data model (shared shape, two implementations)
The unit of everything is the **Optics scale**: 19 named stops from `plus-max` → `base` → `minus-max` (see `OpticsStopName` in `src/types.ts` and `optics-ui/src/lib/data/defaults.ts`). Each stop carries three roles per mode (light/dark):
- `background` — the surface color
- `on` — primary foreground/text on that surface
- `onAlt` — secondary foreground

A stop is defined by **lightness values per role per mode**; hue (`h`) and saturation (`s`) are applied uniformly across the scale to produce actual colors. Color math goes through `culori` (HSL → RGB → hex).

### Alert grouping (`alerts/` namespace)
Color types map to Figma variable name-paths (nested JSON objects → `/`-separated segments). Most types are top-level (`primary/base`, `primary/plus/one`), but the **four alert types** (`notice`, `warning`, `danger`, `info`) are nested under an `alerts/` group (`alerts/danger/base`, …) to match the Optics "Color Styles" collection convention. This matters when importing the tokens file as a **new mode of an existing collection** (vs. a brand-new collection): Figma only writes to variables whose name-path already exists, so the paths must match. Export decides nesting via the hardcoded `ALERT_TYPE_NAMES` list; import (UI only) is permissive — `collectColorEntries` in `optics-ui/src/lib/utils/import.ts` descends one level into *any* grouping wrapper, so round-trips back to bare type names. The Optics-only `brand` / `border-color` variables are intentionally not emitted (a generator working from `h`/`s` alone can't reproduce Optics' per-color seed lightness).

### CLI pipeline (`src/`)
`cli.ts` (commander) → **generator** → **exporter**, with cross-cutting utilities:
- `optics-generator.ts` / `generator.ts` — build an `OpticsPalette` / `ColorPalette` from a base color. `optics-generator` uses the fixed 19-stop `OPTICS_SCALE`; `generator` uses a perceptual easing curve for an arbitrary stop count.
- `optics-exporter.ts` / `exporter.ts` — render a palette to Figma Variables import JSON (`op-color` collection, nested `plus`/`minus`/`on` token tree; alert palettes nested under `alerts/` — see "Alert grouping") and to text contrast reports.
- `contrast.ts` — WCAG relative-luminance + contrast-ratio math; `meetsWCAG_AA`/`AAA`.
- `contrast-report-utils.ts` — three-tier AAA/AA/Fail classification used in reports.
- `color-utils.ts`, `figma-utils.ts`, `file-utils.ts`, `console-utils.ts` — color conversion, Figma token shaping, file I/O, terminal output.
- `index.ts` is the **library public API** — every exported function is re-exported here.

### Web app (`optics-ui/src/`)
- State lives in **Svelte writable stores** (`lib/stores/color-types.ts`), not Redux/zustand despite `zustand` being in `package.json`. The `colorTypes` store holds an array of `ColorTypeConfig` (one per color type: Primary, Neutral, Secondary, Notice, Warning, Danger, Info, plus user-added customs) and the current `mode`. State is **persisted to `localStorage`** under `optics-theme-builder-state`.
- `App.svelte` composes `ColorTypeSection` (collapsible per-type editor) → `ColorStopCard` (per-stop luminosity sliders + live contrast) with `Summary`, `Import`, `Export`, and `FullPagePreview`.
- `lib/utils/export.ts` builds the unified Figma tokens JSON (`optics-{mode}.tokens.json`, with alert types nested under `alerts/` — see "Alert grouping"); `lib/utils/import.ts` parses an exported file back into store state (round-trip, flattening the `alerts/` group). These two utils are the only code with Vitest tests (`lib/utils/__tests__/`).
- Styling uses `@rolemodel/optics` design tokens (`optics-tokens.css`) with CSS Modules (`*.module.css`) and `light-dark()` for theming.

## Reference docs
- `OPTICS_FORMAT.md` — the exact Figma Variables / Design Tokens JSON structure the exporters target.
- `README.md` — full feature/usage docs and version changelog.
- `tests/README.md` — test-suite overview.
