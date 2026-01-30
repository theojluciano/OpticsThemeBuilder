import { formatHex } from 'culori';
import { getContrastRatio } from './contrast';
import { OpticsStopName, OpticsColorStop, OpticsPalette, HSLColor } from './types';
import { parseColor, toHSLColor, toRGBColor, hslToRgb, createColorValue } from './color-utils';

/**
 * Unified Optics scale configuration
 * Consolidates all lightness values for different modes and color types
 */
interface OpticsStopConfig {
  name: OpticsStopName;
  lightMode: {
    background: number;
    on: number;
    onAlt: number;
  };
  darkMode: {
    background: number;
    on: number;
    onAlt: number;
  };
}

/**
 * Complete Optics scale configuration
 * Single source of truth for all lightness values
 */
const OPTICS_SCALE: OpticsStopConfig[] = [
  {
    name: 'plus-max',
    lightMode: { background: 100, on: 0, onAlt: 20 },
    darkMode: { background: 12, on: 100, onAlt: 78 },
  },
  {
    name: 'plus-eight',
    lightMode: { background: 98, on: 4, onAlt: 24 },
    darkMode: { background: 14, on: 88, onAlt: 70 },
  },
  {
    name: 'plus-seven',
    lightMode: { background: 96, on: 8, onAlt: 28 },
    darkMode: { background: 16, on: 80, onAlt: 64 },
  },
  {
    name: 'plus-six',
    lightMode: { background: 94, on: 16, onAlt: 26 },
    darkMode: { background: 20, on: 72, onAlt: 96 },
  },
  {
    name: 'plus-five',
    lightMode: { background: 90, on: 20, onAlt: 40 },
    darkMode: { background: 24, on: 72, onAlt: 86 },
  },
  {
    name: 'plus-four',
    lightMode: { background: 84, on: 24, onAlt: 4 },
    darkMode: { background: 26, on: 80, onAlt: 92 },
  },
  {
    name: 'plus-three',
    lightMode: { background: 70, on: 20, onAlt: 10 },
    darkMode: { background: 29, on: 78, onAlt: 98 },
  },
  {
    name: 'plus-two',
    lightMode: { background: 64, on: 16, onAlt: 6 },
    darkMode: { background: 32, on: 80, onAlt: 92 },
  },
  {
    name: 'plus-one',
    lightMode: { background: 45, on: 100, onAlt: 95 },
    darkMode: { background: 35, on: 80, onAlt: 98 },
  },
  {
    name: 'base',
    lightMode: { background: 40, on: 100, onAlt: 88 },
    darkMode: { background: 38, on: 100, onAlt: 84 },
  },
  {
    name: 'minus-one',
    lightMode: { background: 36, on: 94, onAlt: 82 },
    darkMode: { background: 40, on: 98, onAlt: 90 },
  },
  {
    name: 'minus-two',
    lightMode: { background: 32, on: 90, onAlt: 78 },
    darkMode: { background: 45, on: 98, onAlt: 92 },
  },
  {
    name: 'minus-three',
    lightMode: { background: 28, on: 86, onAlt: 74 },
    darkMode: { background: 48, on: 98, onAlt: 96 },
  },
  {
    name: 'minus-four',
    lightMode: { background: 24, on: 84, onAlt: 72 },
    darkMode: { background: 52, on: 2, onAlt: 2 },
  },
  {
    name: 'minus-five',
    lightMode: { background: 20, on: 88, onAlt: 78 },
    darkMode: { background: 64, on: 2, onAlt: 20 },
  },
  {
    name: 'minus-six',
    lightMode: { background: 16, on: 94, onAlt: 82 },
    darkMode: { background: 72, on: 8, onAlt: 26 },
  },
  {
    name: 'minus-seven',
    lightMode: { background: 8, on: 96, onAlt: 84 },
    darkMode: { background: 80, on: 8, onAlt: 34 },
  },
  {
    name: 'minus-eight',
    lightMode: { background: 4, on: 98, onAlt: 86 },
    darkMode: { background: 88, on: 4, onAlt: 38 },
  },
  {
    name: 'minus-max',
    lightMode: { background: 0, on: 100, onAlt: 88 },
    darkMode: { background: 100, on: 0, onAlt: 38 },
  },
];

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
  
  // Generate all stops using the unified configuration
  const stops: OpticsColorStop[] = OPTICS_SCALE.map((config) => {
    // Background colors for both modes
    const lightBg = createColorValue(h, s, config.lightMode.background);
    const darkBg = createColorValue(h, s, config.darkMode.background);
    
    // Foreground "on" colors for both modes
    const lightOn = createColorValue(h, s, config.lightMode.on);
    const darkOn = createColorValue(h, s, config.darkMode.on);
    
    // Foreground "on-alt" colors for both modes
    const lightOnAlt = createColorValue(h, s, config.lightMode.onAlt);
    const darkOnAlt = createColorValue(h, s, config.darkMode.onAlt);
    
    // Calculate contrast ratios
    const lightBgRgb = hslToRgb(lightBg.hsl as any);
    const darkBgRgb = hslToRgb(darkBg.hsl as any);
    const lightOnRgb = hslToRgb(lightOn.hsl as any);
    const darkOnRgb = hslToRgb(darkOn.hsl as any);
    const lightOnAltRgb = hslToRgb(lightOnAlt.hsl as any);
    const darkOnAltRgb = hslToRgb(darkOnAlt.hsl as any);
    
    return {
      name: config.name,
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
      totalStops: OPTICS_SCALE.length,
      format: 'optics',
    },
  };
}