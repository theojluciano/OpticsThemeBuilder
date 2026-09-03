import type { StopRamps } from './defaults';
import {
  LIGHT_MODE_BG, DARK_MODE_BG,
  LIGHT_MODE_ON, DARK_MODE_ON,
  LIGHT_MODE_ON_ALT, DARK_MODE_ON_ALT
} from './defaults';

/**
 * The real per-family lightness tables Optics ships in
 * `@rolemodel/optics/dist/css/core/tokens/scale_color_tokens.css`.
 *
 * Every Optics color family has its *own* curve — `neutral` differs from
 * `primary` at 43 of its 57 tokens, `alerts-notice` at 51. These are extracted
 * verbatim from the package so the CSS export can emit only the values a theme
 * actually changes (see `utils/css-export.ts`) rather than restating Optics'
 * own defaults, and so new color types seed from the right curve.
 *
 * Keep in sync with the installed @rolemodel/optics version.
 */
export interface OpticsFamilyBaseline extends StopRamps {
  /**
   * Seed hue/saturation/lightness Optics ships for this family. `l` is the
   * lightness of the seed color itself — not a stop on the scale — and exists
   * only to build `--op-color-{family}-original` (which `base.css` uses for
   * every `<a>`).
   */
  h: number;
  s: number;
  l: number;
  /**
   * Optics defines some seeds as `var()` references rather than literals:
   * `--op-color-neutral-h: var(--op-color-primary-h)`. The numbers above are
   * the *resolved* defaults, which are the wrong thing to diff against — if
   * primary's hue moves, neutral's default moves with it. Where an alias is
   * declared, the exporter compares against the referenced family's live value
   * and re-emits the `var()` reference when they still agree.
   */
  aliases?: Partial<Record<'h' | 's' | 'l', string>>;
}

export const OPTICS_FAMILY_BASELINES: Record<string, OpticsFamilyBaseline> = {
  'primary': {
    h: 216,
    s: 58,
    l: 48,
    // Primary's curves live in `defaults.ts`, which also uses them as the
    // fallback for custom families. Referenced here so the 114 values exist once.
    lightBg: LIGHT_MODE_BG,
    darkBg: DARK_MODE_BG,
    lightOn: LIGHT_MODE_ON,
    darkOn: DARK_MODE_ON,
    lightOnAlt: LIGHT_MODE_ON_ALT,
    darkOnAlt: DARK_MODE_ON_ALT,
  },
  'neutral': {
    h: 216,
    s: 4,
    l: 48,
    aliases: { h: 'primary', l: 'primary' },
    lightBg: {
      'plus-max': 100, 'plus-eight': 98, 'plus-seven': 96, 'plus-six': 94, 'plus-five': 90,
      'plus-four': 84, 'plus-three': 70, 'plus-two': 64, 'plus-one': 44,
      'base': 40, 'minus-one': 36, 'minus-two': 32, 'minus-three': 28,
      'minus-four': 24, 'minus-five': 20, 'minus-six': 16, 'minus-seven': 8,
      'minus-eight': 4, 'minus-max': 0
    },
    darkBg: {
      'plus-max': 8, 'plus-eight': 10, 'plus-seven': 14, 'plus-six': 16, 'plus-five': 18,
      'plus-four': 20, 'plus-three': 24, 'plus-two': 26, 'plus-one': 30,
      'base': 32, 'minus-one': 36, 'minus-two': 40, 'minus-three': 44,
      'minus-four': 52, 'minus-five': 64, 'minus-six': 72, 'minus-seven': 80,
      'minus-eight': 88, 'minus-max': 100
    },
    lightOn: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 16, 'plus-five': 20,
      'plus-four': 24, 'plus-three': 20, 'plus-two': 16, 'plus-one': 100,
      'base': 100, 'minus-one': 94, 'minus-two': 90, 'minus-three': 86,
      'minus-four': 84, 'minus-five': 88, 'minus-six': 94, 'minus-seven': 96,
      'minus-eight': 98, 'minus-max': 100
    },
    darkOn: {
      'plus-max': 100, 'plus-eight': 88, 'plus-seven': 80, 'plus-six': 72, 'plus-five': 80,
      'plus-four': 88, 'plus-three': 88, 'plus-two': 88, 'plus-one': 100,
      'base': 100, 'minus-one': 90, 'minus-two': 90, 'minus-three': 99,
      'minus-four': 11, 'minus-five': 20, 'minus-six': 4, 'minus-seven': 8,
      'minus-eight': 4, 'minus-max': 4
    },
    lightOnAlt: {
      'plus-max': 40, 'plus-eight': 34, 'plus-seven': 28, 'plus-six': 36, 'plus-five': 40,
      'plus-four': 4, 'plus-three': 10, 'plus-two': 6, 'plus-one': 95,
      'base': 90, 'minus-one': 84, 'minus-two': 78, 'minus-three': 74,
      'minus-four': 76, 'minus-five': 76, 'minus-six': 82, 'minus-seven': 84,
      'minus-eight': 86, 'minus-max': 88
    },
    darkOnAlt: {
      'plus-max': 54, 'plus-eight': 54, 'plus-seven': 58, 'plus-six': 90, 'plus-five': 94,
      'plus-four': 68, 'plus-three': 68, 'plus-two': 72, 'plus-one': 75,
      'base': 78, 'minus-one': 98, 'minus-two': 98, 'minus-three': 95,
      'minus-four': 2, 'minus-five': 2, 'minus-six': 26, 'minus-seven': 32,
      'minus-eight': 36, 'minus-max': 48
    },
  },
  'alerts-notice': {
    h: 130,
    s: 61,
    l: 64,
    lightBg: {
      'plus-max': 100, 'plus-eight': 98, 'plus-seven': 96, 'plus-six': 94, 'plus-five': 90,
      'plus-four': 84, 'plus-three': 70, 'plus-two': 64, 'plus-one': 47,
      'base': 40, 'minus-one': 32, 'minus-two': 28, 'minus-three': 26,
      'minus-four': 22, 'minus-five': 18, 'minus-six': 16, 'minus-seven': 8,
      'minus-eight': 4, 'minus-max': 0
    },
    darkBg: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 12, 'plus-five': 14,
      'plus-four': 16, 'plus-three': 20, 'plus-two': 24, 'plus-one': 28,
      'base': 32, 'minus-one': 36, 'minus-two': 40, 'minus-three': 48,
      'minus-four': 52, 'minus-five': 64, 'minus-six': 72, 'minus-seven': 80,
      'minus-eight': 88, 'minus-max': 100
    },
    lightOn: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 16, 'plus-five': 20,
      'plus-four': 24, 'plus-three': 20, 'plus-two': 16, 'plus-one': 8,
      'base': 8, 'minus-one': 100, 'minus-two': 96, 'minus-three': 92,
      'minus-four': 88, 'minus-five': 88, 'minus-six': 94, 'minus-seven': 96,
      'minus-eight': 98, 'minus-max': 100
    },
    darkOn: {
      'plus-max': 100, 'plus-eight': 94, 'plus-seven': 90, 'plus-six': 92, 'plus-five': 92,
      'plus-four': 94, 'plus-three': 98, 'plus-two': 98, 'plus-one': 98,
      'base': 99, 'minus-one': 2, 'minus-two': 2, 'minus-three': 2,
      'minus-four': 2, 'minus-five': 6, 'minus-six': 2, 'minus-seven': 2,
      'minus-eight': 2, 'minus-max': 0
    },
    lightOnAlt: {
      'plus-max': 20, 'plus-eight': 24, 'plus-seven': 28, 'plus-six': 26, 'plus-five': 30,
      'plus-four': 4, 'plus-three': 10, 'plus-two': 6, 'plus-one': 3,
      'base': 0, 'minus-one': 96, 'minus-two': 89, 'minus-three': 85,
      'minus-four': 81, 'minus-five': 76, 'minus-six': 82, 'minus-seven': 84,
      'minus-eight': 86, 'minus-max': 88
    },
    darkOnAlt: {
      'plus-max': 88, 'plus-eight': 82, 'plus-seven': 80, 'plus-six': 72, 'plus-five': 72,
      'plus-four': 80, 'plus-three': 78, 'plus-two': 88, 'plus-one': 84,
      'base': 96, 'minus-one': 7, 'minus-two': 10, 'minus-three': 18,
      'minus-four': 20, 'minus-five': 20, 'minus-six': 16, 'minus-seven': 26,
      'minus-eight': 24, 'minus-max': 28
    },
  },
  'alerts-warning': {
    h: 47,
    s: 100,
    l: 61,
    lightBg: {
      'plus-max': 100, 'plus-eight': 98, 'plus-seven': 96, 'plus-six': 94, 'plus-five': 90,
      'plus-four': 80, 'plus-three': 70, 'plus-two': 64, 'plus-one': 50,
      'base': 40, 'minus-one': 26, 'minus-two': 22, 'minus-three': 18,
      'minus-four': 14, 'minus-five': 12, 'minus-six': 10, 'minus-seven': 4,
      'minus-eight': 2, 'minus-max': 0
    },
    darkBg: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 12, 'plus-five': 14,
      'plus-four': 16, 'plus-three': 20, 'plus-two': 24, 'plus-one': 28,
      'base': 32, 'minus-one': 36, 'minus-two': 40, 'minus-three': 48,
      'minus-four': 52, 'minus-five': 64, 'minus-six': 72, 'minus-seven': 80,
      'minus-eight': 88, 'minus-max': 100
    },
    lightOn: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 16, 'plus-five': 20,
      'plus-four': 20, 'plus-three': 20, 'plus-two': 16, 'plus-one': 20,
      'base': 12, 'minus-one': 100, 'minus-two': 96, 'minus-three': 92,
      'minus-four': 88, 'minus-five': 88, 'minus-six': 94, 'minus-seven': 96,
      'minus-eight': 98, 'minus-max': 100
    },
    darkOn: {
      'plus-max': 70, 'plus-eight': 88, 'plus-seven': 80, 'plus-six': 72, 'plus-five': 72,
      'plus-four': 80, 'plus-three': 88, 'plus-two': 88, 'plus-one': 96,
      'base': 2, 'minus-one': 2, 'minus-two': 2, 'minus-three': 2,
      'minus-four': 4, 'minus-five': 8, 'minus-six': 10, 'minus-seven': 8,
      'minus-eight': 12, 'minus-max': 0
    },
    lightOnAlt: {
      'plus-max': 20, 'plus-eight': 24, 'plus-seven': 28, 'plus-six': 26, 'plus-five': 25,
      'plus-four': 0, 'plus-three': 10, 'plus-two': 6, 'plus-one': 15,
      'base': 0, 'minus-one': 88, 'minus-two': 84, 'minus-three': 80,
      'minus-four': 76, 'minus-five': 76, 'minus-six': 82, 'minus-seven': 84,
      'minus-eight': 86, 'minus-max': 88
    },
    darkOnAlt: {
      'plus-max': 42, 'plus-eight': 70, 'plus-seven': 60, 'plus-six': 50, 'plus-five': 50,
      'plus-four': 60, 'plus-three': 70, 'plus-two': 70, 'plus-one': 10,
      'base': 6, 'minus-one': 70, 'minus-two': 14, 'minus-three': 20,
      'minus-four': 20, 'minus-five': 21, 'minus-six': 22, 'minus-seven': 24,
      'minus-eight': 26, 'minus-max': 24
    },
  },
  'alerts-danger': {
    h: 0,
    s: 99,
    l: 76,
    lightBg: {
      'plus-max': 100, 'plus-eight': 98, 'plus-seven': 96, 'plus-six': 94, 'plus-five': 90,
      'plus-four': 84, 'plus-three': 70, 'plus-two': 64, 'plus-one': 50,
      'base': 40, 'minus-one': 36, 'minus-two': 32, 'minus-three': 28,
      'minus-four': 24, 'minus-five': 20, 'minus-six': 16, 'minus-seven': 8,
      'minus-eight': 4, 'minus-max': 0
    },
    darkBg: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 12, 'plus-five': 14,
      'plus-four': 16, 'plus-three': 20, 'plus-two': 24, 'plus-one': 28,
      'base': 32, 'minus-one': 36, 'minus-two': 40, 'minus-three': 48,
      'minus-four': 52, 'minus-five': 64, 'minus-six': 72, 'minus-seven': 80,
      'minus-eight': 88, 'minus-max': 100
    },
    lightOn: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 16, 'plus-five': 20,
      'plus-four': 24, 'plus-three': 20, 'plus-two': 16, 'plus-one': 8,
      'base': 100, 'minus-one': 94, 'minus-two': 90, 'minus-three': 86,
      'minus-four': 84, 'minus-five': 88, 'minus-six': 94, 'minus-seven': 96,
      'minus-eight': 98, 'minus-max': 100
    },
    darkOn: {
      'plus-max': 100, 'plus-eight': 88, 'plus-seven': 80, 'plus-six': 78, 'plus-five': 76,
      'plus-four': 80, 'plus-three': 88, 'plus-two': 88, 'plus-one': 96,
      'base': 98, 'minus-one': 96, 'minus-two': 98, 'minus-three': 6,
      'minus-four': 4, 'minus-five': 2, 'minus-six': 8, 'minus-seven': 8,
      'minus-eight': 4, 'minus-max': 0
    },
    lightOnAlt: {
      'plus-max': 20, 'plus-eight': 24, 'plus-seven': 28, 'plus-six': 36, 'plus-five': 30,
      'plus-four': 4, 'plus-three': 10, 'plus-two': 6, 'plus-one': 3,
      'base': 93, 'minus-one': 89, 'minus-two': 83, 'minus-three': 79,
      'minus-four': 77, 'minus-five': 81, 'minus-six': 87, 'minus-seven': 89,
      'minus-eight': 91, 'minus-max': 93
    },
    darkOnAlt: {
      'plus-max': 88, 'plus-eight': 78, 'plus-seven': 70, 'plus-six': 68, 'plus-five': 70,
      'plus-four': 72, 'plus-three': 76, 'plus-two': 76, 'plus-one': 84,
      'base': 90, 'minus-one': 88, 'minus-two': 93, 'minus-three': 2,
      'minus-four': 10, 'minus-five': 10, 'minus-six': 22, 'minus-seven': 28,
      'minus-eight': 24, 'minus-max': 24
    },
  },
  'alerts-info': {
    h: 216,
    s: 58,
    l: 48,
    lightBg: {
      'plus-max': 100, 'plus-eight': 98, 'plus-seven': 96, 'plus-six': 94, 'plus-five': 90,
      'plus-four': 84, 'plus-three': 70, 'plus-two': 64, 'plus-one': 56,
      'base': 40, 'minus-one': 36, 'minus-two': 32, 'minus-three': 28,
      'minus-four': 24, 'minus-five': 20, 'minus-six': 16, 'minus-seven': 8,
      'minus-eight': 4, 'minus-max': 0
    },
    darkBg: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 12, 'plus-five': 14,
      'plus-four': 16, 'plus-three': 20, 'plus-two': 24, 'plus-one': 28,
      'base': 32, 'minus-one': 36, 'minus-two': 40, 'minus-three': 48,
      'minus-four': 52, 'minus-five': 64, 'minus-six': 72, 'minus-seven': 80,
      'minus-eight': 88, 'minus-max': 100
    },
    lightOn: {
      'plus-max': 0, 'plus-eight': 4, 'plus-seven': 8, 'plus-six': 16, 'plus-five': 20,
      'plus-four': 24, 'plus-three': 20, 'plus-two': 16, 'plus-one': 8,
      'base': 100, 'minus-one': 94, 'minus-two': 90, 'minus-three': 86,
      'minus-four': 84, 'minus-five': 88, 'minus-six': 94, 'minus-seven': 96,
      'minus-eight': 98, 'minus-max': 100
    },
    darkOn: {
      'plus-max': 100, 'plus-eight': 88, 'plus-seven': 80, 'plus-six': 78, 'plus-five': 76,
      'plus-four': 80, 'plus-three': 88, 'plus-two': 88, 'plus-one': 96,
      'base': 98, 'minus-one': 94, 'minus-two': 94, 'minus-three': 98,
      'minus-four': 2, 'minus-five': 8, 'minus-six': 4, 'minus-seven': 4,
      'minus-eight': 4, 'minus-max': 0
    },
    lightOnAlt: {
      'plus-max': 20, 'plus-eight': 24, 'plus-seven': 28, 'plus-six': 36, 'plus-five': 40,
      'plus-four': 4, 'plus-three': 10, 'plus-two': 6, 'plus-one': 3,
      'base': 88, 'minus-one': 82, 'minus-two': 78, 'minus-three': 74,
      'minus-four': 72, 'minus-five': 76, 'minus-six': 82, 'minus-seven': 84,
      'minus-eight': 86, 'minus-max': 88
    },
    darkOnAlt: {
      'plus-max': 88, 'plus-eight': 78, 'plus-seven': 70, 'plus-six': 62, 'plus-five': 62,
      'plus-four': 66, 'plus-three': 72, 'plus-two': 74, 'plus-one': 80,
      'base': 78, 'minus-one': 80, 'minus-two': 86, 'minus-three': 96,
      'minus-four': 2, 'minus-five': 20, 'minus-six': 28, 'minus-seven': 28,
      'minus-eight': 34, 'minus-max': 32
    },
  },
};

/**
 * The curve a family with no Optics baseline seeds from and is diffed against.
 * Custom color types have no family of their own; primary's is the house curve.
 */
export const FALLBACK_BASELINE = OPTICS_FAMILY_BASELINES.primary;
