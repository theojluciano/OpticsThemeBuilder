import { formatHex, Hsl, Rgb } from 'culori';
import { getContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } from './contrast';
import { ColorStop, ColorPalette, HSLColor } from './types';
import { parseColor, toHSLColor, toRGBColor, hslToRgb } from './color-utils';

/**
 * Generate a perceptually distributed lightness scale
 * Uses an easing function to create better visual distribution
 */
function generateLightnessScale(totalStops: number): number[] {
  const lightnesses: number[] = [];
  
  for (let i = 0; i < totalStops; i++) {
    // Normalize position from 0 to 1
    const position = i / (totalStops - 1);
    
    // Use an easing curve for better perceptual distribution
    // This creates more stops in the middle range where human eye is more sensitive
    const eased = easeInOutQuad(position);
    
    // Map to lightness range (95% to 5% - avoiding pure white/black)
    const lightness = 95 - (eased * 90);
    
    lightnesses.push(lightness / 100);
  }
  
  return lightnesses;
}

/**
 * Easing function for smoother distribution
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Generate optimal foreground colors for a background
 * Returns both a light and dark option
 */
function generateForegroundColors(background: Hsl): {
  light: { color: Hsl; contrast: number };
  dark: { color: Hsl; contrast: number };
} {
  const bgRgb = hslToRgb(background);
  
  // Light foreground (near white)
  const lightForeground: Hsl = {
    mode: 'hsl',
    h: background.h,
    s: (background.s || 0) * 0.1, // Reduce saturation significantly
    l: 0.98,
  };
  
  // Dark foreground (near black)
  const darkForeground: Hsl = {
    mode: 'hsl',
    h: background.h,
    s: (background.s || 0) * 0.15, // Slight saturation for warmth
    l: 0.08,
  };
  
  const lightRgb = hslToRgb(lightForeground);
  const darkRgb = hslToRgb(darkForeground);
  
  return {
    light: {
      color: lightForeground,
      contrast: getContrastRatio(bgRgb, lightRgb),
    },
    dark: {
      color: darkForeground,
      contrast: getContrastRatio(bgRgb, darkRgb),
    },
  };
}

/**
 * Adjust saturation based on lightness for better visual appearance
 * Very light and very dark colors should have reduced saturation
 */
function adjustSaturation(baseSaturation: number, lightness: number): number {
  if (lightness > 0.9) {
    // Very light: reduce saturation significantly
    return baseSaturation * (1 - (lightness - 0.9) * 8);
  } else if (lightness < 0.2) {
    // Very dark: reduce saturation moderately
    return baseSaturation * (0.5 + lightness * 2.5);
  } else {
    // Middle range: full saturation or slight boost
    return Math.min(baseSaturation * 1.1, 1);
  }
}

/**
 * Generate a complete color palette from a base color
 */
export function generatePalette(
  baseColorInput: string | HSLColor,
  name: string = 'palette',
  totalStops: number = 16
): ColorPalette {
  // Parse base color
  const baseHsl = parseColor(baseColorInput);
  const baseRgb = hslToRgb(baseHsl);
  const baseHex = formatHex(baseRgb);
  
  // Generate lightness scale
  const lightnessStops = generateLightnessScale(totalStops);
  
  // Generate color stops
  const stops: ColorStop[] = lightnessStops.map((lightness, index) => {
    // Create background color with adjusted saturation
    const adjustedSaturation = adjustSaturation(baseHsl.s || 0, lightness);
    
    const bgColor: Hsl = {
      mode: 'hsl',
      h: baseHsl.h,
      s: adjustedSaturation,
      l: lightness,
    };
    
    const bgRgb = hslToRgb(bgColor);
    const bgHex = formatHex(bgRgb);
    
    // Generate foreground colors
    const foregrounds = generateForegroundColors(bgColor);
    
    // Determine recommended foreground
    const recommended = foregrounds.light.contrast > foregrounds.dark.contrast ? 'light' : 'dark';
    
    return {
      stop: index,
      background: {
        hsl: toHSLColor(bgColor),
        rgb: toRGBColor(bgRgb),
        hex: bgHex,
      },
      foregrounds: {
        light: {
          hsl: toHSLColor(foregrounds.light.color),
          rgb: toRGBColor(hslToRgb(foregrounds.light.color)),
          hex: formatHex(foregrounds.light.color),
          contrast: foregrounds.light.contrast,
          wcagAA: meetsWCAG_AA(foregrounds.light.contrast),
          wcagAAA: meetsWCAG_AAA(foregrounds.light.contrast),
        },
        dark: {
          hsl: toHSLColor(foregrounds.dark.color),
          rgb: toRGBColor(hslToRgb(foregrounds.dark.color)),
          hex: formatHex(foregrounds.dark.color),
          contrast: foregrounds.dark.contrast,
          wcagAA: meetsWCAG_AA(foregrounds.dark.contrast),
          wcagAAA: meetsWCAG_AAA(foregrounds.dark.contrast),
        },
      },
      recommendedForeground: recommended,
    };
  });
  
  return {
    name,
    baseColor: {
      hsl: toHSLColor(baseHsl),
      rgb: toRGBColor(baseRgb),
      hex: baseHex,
    },
    stops,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalStops,
    },
  };
}

/**
 * Parse HSL string like "hsl(220, 80%, 50%)" or object
 */
export function parseHSLInput(input: string): HSLColor {
  const parsed = parseColor(input);
  return toHSLColor(parsed);
}