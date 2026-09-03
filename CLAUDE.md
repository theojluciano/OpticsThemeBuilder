# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two independent projects in one repo

This repository contains **two separate codebases** that share the *concept* of the Optics scale but **not the code**. There is no shared module between them — be careful not to assume a change in one propagates to the other.

1. **Root (`src/`)** — a TypeScript CLI + Node library (`optics` binary). Compiled with `tsc` → `dist/`, tested with Jest.
2. **`optics-ui/`** — a Svelte 5 + Vite single-page web app (the visual editor). Independent `package.json`, built with Vite, deployed to Vercel.

The Optics 19-stop scale lightness tables exist in **both** places and must be kept in sync manually if changed:
- CLI: `src/optics-generator.ts` (`OPTICS_SCALE` — a single array of per-stop configs)
- UI: `optics-ui/src/lib/data/defaults.ts` (`LIGHT_MODE_BG`, `DARK_MODE_BG`, `LIGHT_MODE_ON`, etc. — separate `Record` maps) plus `optics-ui/src/lib/data/optics-baselines.ts`, which holds the *real per-family* Optics tables extracted from the npm package (see "CSS export")

Likewise `ALERT_TYPE_NAMES` (`['notice','warning','danger','info']`) is defined independently in **two** places — `src/optics-exporter.ts` for the CLI, and `optics-ui/src/lib/data/optics-families.ts` for the app (both UI exporters import it from there) — keep them in sync. See "Alert grouping" below.

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
npm test               # vitest run (export/import/css-export util tests)
```

## Architecture

### Core data model (shared shape, two implementations)
The unit of everything is the **Optics scale**: 19 named stops from `plus-max` → `base` → `minus-max` (see `OpticsStopName` in `src/types.ts` and `optics-ui/src/lib/data/defaults.ts`). Each stop carries three roles per mode (light/dark):
- `background` — the surface color
- `on` — primary foreground/text on that surface
- `onAlt` — secondary foreground

A stop is defined by **lightness values per role per mode**; hue (`h`) and saturation (`s`) are applied uniformly across the scale to produce actual colors. Color math goes through `culori` (HSL → RGB → hex).

### Alert grouping (`alerts/` namespace)
Color types map to Figma variable name-paths (nested JSON objects → `/`-separated segments). Most types are top-level (`primary/base`, `primary/plus/one`), but the **four alert types** (`notice`, `warning`, `danger`, `info`) are nested under an `alerts/` group (`alerts/danger/base`, …) to match the Optics "Color Styles" collection convention. This matters when importing the tokens file as a **new mode of an existing collection** (vs. a brand-new collection): Figma only writes to variables whose name-path already exists, so the paths must match. Export decides nesting via the hardcoded `ALERT_TYPE_NAMES` list; import (UI only) is permissive — `collectColorEntries` in `optics-ui/src/lib/utils/import.ts` descends one level into *any* grouping wrapper, so round-trips back to bare type names. The Optics-only `brand` / `border-color` variables are still not emitted. (The original reason — no per-color seed lightness — no longer applies now that `ColorTypeConfig` carries `l`; wiring it into the Figma export is simply unfinished.)

### CSS export (`optics-ui` only)
Alongside the Figma JSON, the UI can emit an Optics **theme override stylesheet** — the structure Optics' own `generate_theme` tool documents: a `:root` block in a `theme.css` loaded *after* `optics.css`. Two differences from that tool, both deliberate:

- Optics' generator only writes the `--op-color-{family}-h/s/l` seeds, because it assumes you keep its lightness curves. This builder lets you move individual stops, so `css-export.ts` also emits per-stop tokens — written in exactly the form Optics uses in `scale_color_tokens.css`: `light-dark(hsl(var(--op-color-{family}-h) var(--op-color-{family}-s) L%), …)`. Hue and saturation therefore stay swappable downstream through the two seed variables. Both modes ship in one block, so there is no per-mode export here (unlike the Figma JSON).
- A theme that only moves hue/saturation/lightness is therefore ~20 lines of seeds, not a regenerated scale.

Output is a **diff against the real Optics values**, not a full dump. That requires `lib/data/optics-baselines.ts`, which carries the genuine per-family lightness tables extracted from `@rolemodel/optics/dist/css/core/tokens/scale_color_tokens.css`. **Every Optics family ships its own curve** — `neutral` differs from `primary` at 43 of its 57 tokens, `alerts-notice` at 51 — so `defaults.ts` (`LIGHT_MODE_BG` and friends, which are the *primary* curve) is only the fallback for custom color types; `createDefaultColorType` seeds real families from `OPTICS_FAMILY_BASELINES`. Regenerate that file if the Optics dependency bumps.

Variable naming: `--op-color-{family}-{stop}` for backgrounds, `--op-color-{family}-on-{stop}` / `-on-{stop}-alt` for foregrounds, with the four alert types prefixed `alerts-` (`--op-color-alerts-danger-base`), mirroring the Figma `alerts/` grouping. `secondary` and user-added customs have no Optics family, so they get the full 57-token scale, a `-original` declaration (Optics derives that itself for its own families, but the Custom Scale template requires a new family to declare it), and a comment saying no Optics component reads them.

**Seed lightness (`l`).** `ColorTypeConfig.l` is the lightness of the *seed* color, not a stop on the scale — Optics' primary is `l: 48%` while its light `base` is 40%. It exists only to build `--op-color-{family}-original`, which `@rolemodel/optics/dist/css/core/base.css` uses to color every `<a>`; overriding `-h`/`-s` without it yields a link color that is neither yours nor Optics'. It is captured from the color picker (`parseBaseColor` returns `l`) and editable via the L input beside H and S. The per-stop sliders cannot supply it.

**Aliased seeds.** Optics declares `--op-color-neutral-h: var(--op-color-primary-h)` and `--op-color-neutral-l: var(--op-color-primary-l)`. Diffing those against the *resolved* 216/48 would be wrong — when primary's hue moves, neutral's default moves with it. `OpticsFamilyBaseline.aliases` marks them, and `seedLines` compares against the referenced family's live value: silent while the alias holds, pinned to a literal the moment the two disagree (or when the referenced family isn't in the export, as with a single-family copy).

**Persisted-state migration.** `SCHEMA_VERSION` / `migrateState` in `color-types.ts`. v1 seeded every family with primary's ramp and had no seed `l`, so saved state carries the wrong curves and the exporter faithfully reports all 57 as deliberate overrides. The repair only replaces a family's ramp when it matches primary's ramp *exactly* (nobody hand-tunes 57 values into another family's curve); a family with one edited stop is left alone, and `h`/`s` are never touched. Tested in `lib/stores/__tests__/migration.test.ts`. `importPalette` had the same primary-ramp fallback for the non-imported mode and now falls back per family.

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
- `App.svelte` composes `ColorTypeSection` (collapsible per-type editor) → `ColorStopCard` (per-stop luminosity sliders + live contrast) with `Summary`, `Import`, `Export`, `CopyCssButton`, and `FullPagePreview`.
- `lib/utils/css-export.ts` builds the **Optics CSS variable override** stylesheet behind the "Copy CSS" buttons (`CopyCssButton.svelte`, in each section header and in the toolbar) — see "CSS export" above.
- `lib/utils/export.ts` builds the unified Figma tokens JSON (`optics-{mode}.tokens.json`, with alert types nested under `alerts/` — see "Alert grouping"); `lib/utils/import.ts` parses an exported file back into store state (round-trip, flattening the `alerts/` group). The Figma export does **not** yet emit `brand` / `-original` even though the store now carries a seed `l` that would allow it.
- Vitest covers these three utils (`lib/utils/__tests__/`) plus the state migration (`lib/stores/__tests__/`).
- Styling uses `@rolemodel/optics` design tokens (`optics-tokens.css`) with CSS Modules (`*.module.css`) and `light-dark()` for theming.

## Reference docs
- `OPTICS_FORMAT.md` — the exact Figma Variables / Design Tokens JSON structure the exporters target.
- `README.md` — full feature/usage docs and version changelog.
- `tests/README.md` — test-suite overview.
