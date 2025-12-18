import { formatHex, Rgb } from 'culori';
import { getContrastRatio } from './contrast';
import { OpticsStopName, OpticsColorStop, OpticsPalette, HSLColor } from './types';
import { parseColor, toHSLColor, toRGBColor, createHsl, hslToRgb } from './color-utils';

/**
 * Optics scale stop names in order from lightest to darkest (light mode perspective)
 */
const OPTICS_STOPS: OpticsStopName[] = [
  'plus-max',
  'plus-eight',
  'plus-seven',
  'plus-six',
  'plus-five',
  'plus-four',
  'plus-three',
  'plus-two',
  'plus-one',
  'base',
  'minus-one',
  'minus-two',
  'minus-three',
  'minus-four',
  'minus-five',
  'minus-six',
  'minus-seven',
  'minus-eight',
  'minus-max',
];

/**
 * Lightness values for each stop in light mode
 * Based on the Optics scale structure
 */
const LIGHT_MODE_LIGHTNESS: Record<OpticsStopName, number> = {
  'plus-max': 100,
  'plus-eight': 98,
  'plus-seven': 96,
  'plus-six': 94,
  'plus-five': 90,
  'plus-four': 84,
  'plus-three': 70,
  'plus-two': 64,
  'plus-one': 45,
  'base': 40,
  'minus-one': 36,
  'minus-two': 32,
  'minus-three': 28,
  'minus-four': 24,
  'minus-five': 20,
  'minus-six': 16,
  'minus-seven': 8,
  'minus-eight': 4,
  'minus-max': 0,
};

/**
 * Lightness values for each stop in dark mode
 */
const DARK_MODE_LIGHTNESS: Record<OpticsStopName, number> = {
  'plus-max': 12,
  'plus-eight': 14,
  'plus-seven': 16,
  'plus-six': 20,
  'plus-five': 24,
  'plus-four': 26,
  'plus-three': 29,
  'plus-two': 32,
  'plus-one': 35,
  'base': 38,
  'minus-one': 40,
  'minus-two': 45,
  'minus-three': 48,
  'minus-four': 52,
  'minus-five': 64,
  'minus-six': 72,
  'minus-seven': 80,
  'minus-eight': 88,
  'minus-max': 100,
};

/**
 * Foreground "on" colors for light mode
 */
const LIGHT_MODE_ON: Record<OpticsStopName, number> = {
  'plus-max': 0,
  'plus-eight': 4,
  'plus-seven': 8,
  'plus-six': 16,
  'plus-five': 20,
  'plus-four': 24,
  'plus-three': 20,
  'plus-two': 16,
  'plus-one': 100,
  'base': 100,
  'minus-one': 94,
  'minus-two': 90,
  'minus-three': 86,
  'minus-four': 84,
  'minus-five': 88,
  'minus-six': 94,
  'minus-seven': 96,
  'minus-eight': 98,
  'minus-max': 100,
};

/**
 * Foreground "on" colors for dark mode
 */
const DARK_MODE_ON: Record<OpticsStopName, number> = {
  'plus-max': 100,
  'plus-eight': 88,
  'plus-seven': 80,
  'plus-six': 72,
  'plus-five': 72,
  'plus-four': 80,
  'plus-three': 78,
  'plus-two': 80,
  'plus-one': 80,
  'base': 100,
  'minus-one': 98,
  'minus-two': 98,
  'minus-three': 98,
  'minus-four': 2,
  'minus-five': 2,
  'minus-six': 8,
  'minus-seven': 8,
  'minus-eight': 4,
  'minus-max': 0,
};

/**
 * Foreground "on-alt" colors for light mode
 */
const LIGHT_MODE_ON_ALT: Record<OpticsStopName, number> = {
  'plus-max': 20,
  'plus-eight': 24,
  'plus-seven': 28,
  'plus-six': 26,
  'plus-five': 40,
  'plus-four': 4,
  'plus-three': 10,
  'plus-two': 6,
  'plus-one': 95,
  'base': 88,
  'minus-one': 82,
  'minus-two': 78,
  'minus-three': 74,
  'minus-four': 72,
  'minus-five': 78,
  'minus-six': 82,
  'minus-seven': 84,
  'minus-eight': 86,
  'minus-max': 88,
};

/**
 * Foreground "on-alt" colors for dark mode
 */
const DARK_MODE_ON_ALT: Record<OpticsStopName, number> = {
  'plus-max': 78,
  'plus-eight': 70,
  'plus-seven': 64,
  'plus-six': 96,
  'plus-five': 86,
  'plus-four': 92,
  'plus-three': 98,
  'plus-two': 92,
  'plus-one': 98,
  'base': 84,
  'minus-one': 90,
  'minus-two': 92,
  'minus-three': 96,
  'minus-four': 2,
  'minus-five': 20,
  'minus-six': 26,
  'minus-seven': 34,
  'minus-eight': 38,
  'minus-max': 38,
};

/**
 * Create a color value from HSL
 */
function createColorValue(h: number, s: number, l: number): {
  hsl: HSLColor;
  rgb: { r: number; g: number; b: number };
  hex: string;
} {
  const hslColor = createHsl(h, s, l);
  const rgbColor = hslToRgb(hslColor);
  
  return {
    hsl: toHSLColor(hslColor),
    rgb: toRGBColor(rgbColor),
    hex: formatHex(rgbColor),
  };
}

/**
 * Generate an Optics-compatible color palette
 * 
 * @param baseColorInput - Base color as hex string or HSL object
 * @param name - Name for the palette (e.g., "primary", "neutral")
 * @returns OpticsPalette with 19 stops, each with light/dark variants
 */
export function generateOpticsPalette(
  baseColorInput: string | HSLColor,
  name: string = 'primary'
): OpticsPalette {
  // Parse base color
  const baseHsl = parseColor(baseColorInput);
  const baseRgb = hslToRgb(baseHsl);
  const baseHex = formatHex(baseRgb);
  
  // Extract H and S from base color (as percentages)
  const h = baseHsl.h || 0;
  const s = (baseHsl.s || 0) * 100;
  
  // Generate all stops
  const stops: OpticsColorStop[] = OPTICS_STOPS.map((stopName) => {
    // Background colors
    const lightBg = createColorValue(h, s, LIGHT_MODE_LIGHTNESS[stopName]);
    const darkBg = createColorValue(h, s, DARK_MODE_LIGHTNESS[stopName]);
    
    // Foreground "on" colors
    const lightOn = createColorValue(h, s, LIGHT_MODE_ON[stopName]);
    const darkOn = createColorValue(h, s, DARK_MODE_ON[stopName]);
    
    // Foreground "on-alt" colors
    const lightOnAlt = createColorValue(h, s, LIGHT_MODE_ON_ALT[stopName]);
    const darkOnAlt = createColorValue(h, s, DARK_MODE_ON_ALT[stopName]);
    
    // Calculate contrast ratios
    const lightBgRgb = hslToRgb(createHsl(h, s, LIGHT_MODE_LIGHTNESS[stopName]));
    const darkBgRgb = hslToRgb(createHsl(h, s, DARK_MODE_LIGHTNESS[stopName]));
    const lightOnRgb = hslToRgb(createHsl(h, s, LIGHT_MODE_ON[stopName]));
    const darkOnRgb = hslToRgb(createHsl(h, s, DARK_MODE_ON[stopName]));
    const lightOnAltRgb = hslToRgb(createHsl(h, s, LIGHT_MODE_ON_ALT[stopName]));
    const darkOnAltRgb = hslToRgb(createHsl(h, s, DARK_MODE_ON_ALT[stopName]));
    
    return {
      name: stopName,
      background: {
        light: lightBg,
        dark: darkBg,
      },
      on: {
        light: lightOn,
        dark: darkOn,
      },
      onAlt: {
        light: lightOnAlt,
        dark: darkOnAlt,
      },
      lightModeContrast: {
        on: getContrastRatio(lightBgRgb, lightOnRgb),
        onAlt: getContrastRatio(lightBgRgb, lightOnAltRgb),
      },
      darkModeContrast: {
        on: getContrastRatio(darkBgRgb, darkOnRgb),
        onAlt: getContrastRatio(darkBgRgb, darkOnAltRgb),
      },
    };
  });
  
  return {
    name,
    baseColor: {
      h,
      s,
      l: (baseHsl.l || 0) * 100,
      hsl: toHSLColor(baseHsl),
      rgb: toRGBColor(baseRgb),
      hex: baseHex,
    },
    stops,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalStops: OPTICS_STOPS.length,
      format: 'optics',
    },
  };
}