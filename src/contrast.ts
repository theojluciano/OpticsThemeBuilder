import { Rgb } from 'culori';

/**
 * Calculate relative luminance of an RGB color
 * Based on WCAG 2.0 specification
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getRelativeLuminance(rgb: Rgb): number {
  const rsRGB = rgb.r;
  const gsRGB = rgb.g;
  const bsRGB = rgb.b;

  // Convert to linear RGB
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.0 specification
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: Rgb, color2: Rgb): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard
 * AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function meetsWCAG_AA(contrastRatio: number, largeText: boolean = false): boolean {
  return largeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard
 * AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export function meetsWCAG_AAA(contrastRatio: number, largeText: boolean = false): boolean {
  return largeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

/**
 * Get a readable label for contrast ratio quality
 */
export function getContrastLabel(contrastRatio: number): string {
  if (contrastRatio >= 7) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  if (contrastRatio >= 3) return 'AA Large';
  return 'Fail';
}