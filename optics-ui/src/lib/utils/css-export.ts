import type { StopRamps } from '../data/defaults';
import { OPTICS_STOPS } from '../data/defaults';
import { OPTICS_FAMILY_BASELINES, type OpticsFamilyBaseline } from '../data/optics-baselines';
import { opticsFamilyName } from '../data/optics-families';

/**
 * The shape the CSS exporter needs from a color type. `ColorTypeConfig`
 * satisfies this structurally; keeping it separate keeps this util
 * store-independent and directly testable.
 */
export interface ThemeColorType extends StopRamps {
  name: string;
  h: number;
  s: number;
  /**
   * Lightness of the seed color — not a stop on the scale. Emitted as
   * `--op-color-{family}-l`, which Optics uses to build
   * `--op-color-{family}-original` (`base.css` colors every `<a>` with it).
   */
  l: number;
}

/** The three roles each stop contributes, and how each is named in CSS. */
const ROLES = [
  { light: 'lightBg', dark: 'darkBg', suffix: (stop: string) => stop },
  { light: 'lightOn', dark: 'darkOn', suffix: (stop: string) => `on-${stop}` },
  { light: 'lightOnAlt', dark: 'darkOnAlt', suffix: (stop: string) => `on-${stop}-alt` }
] as const;

function formatLightness(value: number): string {
  return `${Number(value.toFixed(2))}%`;
}

/** One `--op-color-…` declaration in the shape Optics writes its own tokens. */
function declaration(family: string, suffix: string, light: number, dark: number): string {
  const hs = `var(--op-color-${family}-h) var(--op-color-${family}-s)`;
  return [
    `  --op-color-${family}-${suffix}: light-dark(`,
    `    hsl(${hs} ${formatLightness(light)}),`,
    `    hsl(${hs} ${formatLightness(dark)})`,
    `  );`
  ].join('\n');
}

interface FamilyBlock {
  /** Display name, for header comments. */
  name: string;
  /** True when this family exists in Optics and every value matched it. */
  unchanged: boolean;
  lines: string[];
}

const SEEDS = ['h', 's', 'l'] as const;
type Seed = (typeof SEEDS)[number];

function formatSeed(seed: Seed, value: number): string {
  // Optics writes hue unitless and saturation/lightness as percentages.
  return seed === 'h' ? String(value) : formatLightness(value);
}

/**
 * Build the seed declarations for a family.
 *
 * Optics defines some seeds as `var()` references — `--op-color-neutral-h:
 * var(--op-color-primary-h)`. Diffing those against the *resolved* default
 * would be wrong: if primary's hue moves, neutral's default moves with it. So
 * an aliased seed is compared against the referenced family's live value, and
 * pinned to a literal as soon as the two disagree — otherwise the downstream
 * project would silently inherit its own primary hue.
 */
function seedLines(
  colorType: ThemeColorType,
  family: string,
  baseline: OpticsFamilyBaseline | undefined,
  byFamily: Map<string, ThemeColorType>
): { lines: string[]; changed: boolean } {
  const lines: string[] = [];
  let changed = false;

  for (const seed of SEEDS) {
    const value = colorType[seed];
    const aliasTarget = baseline?.aliases?.[seed];

    if (aliasTarget) {
      // The alias still holds, so stock Optics already produces this value —
      // re-emitting the `var()` reference would say nothing new. Otherwise the
      // user broke the alias, or this is a single-family copy where the
      // target's live value is unknowable; both need an explicit literal.
      const aliased = byFamily.get(aliasTarget);
      if (aliased && aliased[seed] === value) continue;
    } else if (baseline && baseline[seed] === value) {
      continue;
    }

    lines.push(`  --op-color-${family}-${seed}: ${formatSeed(seed, value)};`);
    changed = true;
  }

  return { lines, changed };
}

function buildFamilyBlock(
  colorType: ThemeColorType,
  byFamily: Map<string, ThemeColorType>
): FamilyBlock {
  const family = opticsFamilyName(colorType.name);
  const baseline: OpticsFamilyBaseline | undefined = OPTICS_FAMILY_BASELINES[family];

  const tokenLines: string[] = [];
  for (const stop of OPTICS_STOPS) {
    for (const role of ROLES) {
      const light = colorType[role.light][stop];
      const dark = colorType[role.dark][stop];

      // A token is a single `light-dark()` pair, so if either half moved the
      // whole declaration has to be emitted.
      if (baseline && baseline[role.light][stop] === light && baseline[role.dark][stop] === dark) {
        continue;
      }

      tokenLines.push(declaration(family, role.suffix(stop), light, dark));
    }
  }

  const seeds = seedLines(colorType, family, baseline, byFamily);
  const unchanged = Boolean(baseline) && !seeds.changed && tokenLines.length === 0;

  const lines: string[] = [];
  if (!unchanged) {
    if (baseline) {
      lines.push(`  /* ${colorType.name} */`);
    } else {
      lines.push(
        `  /* ${colorType.name} — not an Optics color family, so there is no baseline to`,
        `     diff against and the full scale is emitted. These variables are yours to`,
        `     reference; no Optics component reads them. */`
      );
    }

    lines.push(...seeds.lines);

    // Optics derives `-original` from the seeds for each of its own families;
    // a new family has to declare it, per the Custom Scale template.
    if (!baseline) {
      lines.push(
        `  --op-color-${family}-original: hsl(` +
          `var(--op-color-${family}-h) var(--op-color-${family}-s) var(--op-color-${family}-l));`
      );
    }

    if (tokenLines.length > 0) {
      lines.push('');
      if (baseline) {
        lines.push(`  /* ${tokenLines.length} of 57 scale tokens adjusted */`);
      }
      lines.push(...tokenLines);
    } else {
      lines.push(`  /* Scale matches the Optics defaults. */`);
    }
  }

  return { name: colorType.name, unchanged, lines };
}

/**
 * Render color types as an Optics theme override stylesheet.
 *
 * Emits only what differs from the lightness curves Optics actually ships
 * (`data/optics-baselines.ts`), in the same `light-dark(hsl(var(--…-h) …))`
 * form Optics uses for its own tokens — so hue and saturation stay swappable
 * downstream through the two seed variables.
 */
export function exportOpticsCSS(colorTypes: ThemeColorType[]): string {
  const byFamily = new Map(colorTypes.map(ct => [opticsFamilyName(ct.name), ct]));
  const blocks = colorTypes.map(ct => buildFamilyBlock(ct, byFamily));
  const changed = blocks.filter(block => !block.unchanged);
  const unchanged = blocks.filter(block => block.unchanged);

  const header = ['/* Optics theme overrides — generated by Optics Theme Builder */'];

  if (changed.length === 0) {
    header.push('/* Nothing to override: every color type matches the Optics defaults. */');
    return `${header.join('\n')}\n`;
  }

  header.push('/* Load this after @rolemodel/optics so it wins the cascade. */');

  if (colorTypes.length > 1) {
    header.push(`/* ${changed.length} of ${colorTypes.length} color types differ from Optics. */`);
  }
  if (unchanged.length > 0) {
    header.push(`/* Unchanged, and therefore omitted: ${unchanged.map(b => b.name).join(', ')}. */`);
  }
  const body = changed.map(block => block.lines.join('\n')).join('\n\n');

  return `${header.join('\n')}\n\n:root {\n${body}\n}\n`;
}

/** Copy text to the clipboard, falling back for browsers without the async API. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea approach below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
