import * as culori from 'culori';

/**
 * Make a hex color from HSL values (S and L as percentages 0-100)
 */
export function makeColor(h: number, s: number, l: number): string {
  return culori.formatHex(culori.hsl({ h, s: s / 100, l: l / 100 }));
}

/**
 * Calculate relative luminance of an RGB color
 * Based on WCAG 2.0 specification
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Convert to linear RGB
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Based on WCAG 2.0 specification
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrast(bg: string, fg: string): number {
  const bgRgb = culori.rgb(bg);
  const fgRgb = culori.rgb(fg);
  
  if (!bgRgb || !fgRgb) return 1;
  
  const bgL = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgL = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  
  const lighter = Math.max(bgL, fgL);
  const darker = Math.min(bgL, fgL);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse a color string and return H and S values
 */
export function parseBaseColor(colorInput: string): { h: number; s: number } | null {
  const parsed = culori.parse(colorInput);
  if (!parsed) return null;
  
  const hsl = culori.converter('hsl')(parsed);
  if (!hsl) return null;
  
  return {
    h: hsl.h || 0,
    s: (hsl.s || 0) * 100
  };
}