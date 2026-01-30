import { hsl, rgb, converter, Hsl, Rgb } from 'culori';
import { HSLColor, RGBColor } from './types';

const toRgb = converter('rgb');
const toHsl = converter('hsl');

/**
 * Convert culori Hsl color to our HSL type
 */
export function toHSLColor(color: Hsl): HSLColor {
  return {
    h: color.h || 0,
    s: color.s || 0,
    l: color.l || 0,
  };
}

/**
 * Convert culori Rgb color to our RGB type
 */
export function toRGBColor(color: Rgb): RGBColor {
  return {
    r: color.r,
    g: color.g,
    b: color.b,
  };
}

/**
 * Parse a color string or HSL object into a culori Hsl object
 * Handles both normalized (0-1) and percentage (0-100) values for HSL objects
 */
export function parseColor(input: string | HSLColor): Hsl {
  if (typeof input === 'string') {
    const parsed = hsl(input);
    if (!parsed) {
      throw new Error(`Invalid color input: ${input}`);
    }
    return parsed;
  } else {
    // Normalize HSL values: if s or l > 1, assume they're percentages
    const s = input.s > 1 ? input.s / 100 : input.s;
    const l = input.l > 1 ? input.l / 100 : input.l;
    
    const parsed = hsl({
      h: input.h,
      s,
      l,
    });
    if (!parsed) {
      throw new Error(`Invalid HSL input: ${JSON.stringify(input)}`);
    }
    return parsed;
  }
}

/**
 * Convert RGB to Hsl
 */
export function rgbToHsl(color: Rgb): Hsl {
  return toHsl(color) as Hsl;
}

/**
 * Convert Hsl to RGB
 */
export function hslToRgb(color: Hsl): Rgb {
  return toRgb(color) as Rgb;
}

/**
 * Create an Hsl color from H, S, L values (S and L as percentages 0-100)
 */
export function createHsl(h: number, s: number, l: number): Hsl {
  return hsl({
    h,
    s: s / 100,
    l: l / 100,
  })!;
}

/**
 * Create a complete color value object with HSL, RGB, and hex formats
 * This is a unified builder to reduce duplication across the codebase
 */
export function createColorValue(h: number, s: number, l: number): {
  hsl: HSLColor;
  rgb: RGBColor;
  hex: string;
} {
  const { formatHex } = require('culori');
  const hslColor = createHsl(h, s, l);
  const rgbColor = hslToRgb(hslColor);
  
  return {
    hsl: toHSLColor(hslColor),
    rgb: toRGBColor(rgbColor),
    hex: formatHex(rgbColor),
  };
}