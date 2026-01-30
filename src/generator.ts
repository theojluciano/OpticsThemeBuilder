import { formatHex, Hsl, Rgb } from 'culori';
import { getContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } from './contrast';
import { ColorStop, ColorPalette, HSLColor } from './types';
import { parseColor, toHSLColor, toRGBColor, hslToRgb, createColorValue } from './color-utils';

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
  light: { 
    hsl: HSLColor;
    rgb: { r: number; g: number; b: number };
    hex: string;
    contrast: number;
  };
  dark: {
    hsl: HSLColor;
    rgb: { r: number; g: number; b: number };
    hex: string;
    contrast: number;
  };
} {
  const bgRgb = hslToRgb(background);
  const h = background.h || 0;
  const s = (background.s || 0) * 100;
  
  // Light foreground (near white) - reduced saturation
  const lightFg = createColorValue(h, s * 0.1, 98);
  
  // Dark foreground (near black) - slight saturation for warmth
  const darkFg = createColorValue(h, s * 0.15, 8);
  
  // Convert our RGB format to culori Rgb format for contrast calculation
  const lightRgb: Rgb = { mode: 'rgb', r: lightFg.rgb.r, g: lightFg.rgb.g, b: lightFg.rgb.b };
  const darkRgb: Rgb = { mode: 'rgb', r: darkFg.rgb.r, g: darkFg.rgb.g, b: darkFg.rgb.b };
  
  return {
    light: {
      ...lightFg,
      contrast: getContrastRatio(bgRgb, lightRgb),
    },
    dark: {
      ...darkFg,
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
    const h = baseHsl.h || 0;
    const s = adjustedSaturation * 100;
    const l = lightness * 100;
    
    // Use unified color builder for background
    const bgColor = createColorValue(h, s, l);
    
    // Create HSL object for foreground generation
    const bgHsl: Hsl = {
      mode: 'hsl',
      h,
      s: adjustedSaturation,
      l: lightness,
    };
    
    // Generate foreground colors
    const foregrounds = generateForegroundColors(bgHsl);
    
    // Determine recommended foreground
    const recommended = foregrounds.light.contrast > foregrounds.dark.contrast ? 'light' : 'dark';
    
    return {
      stop: index,
      background: bgColor,
      foregrounds: {
        light: {
          ...foregrounds.light,
          wcagAA: meetsWCAG_AA(foregrounds.light.contrast),
          wcagAAA: meetsWCAG_AAA(foregrounds.light.contrast),
        },
        dark: {
          ...foregrounds.dark,
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