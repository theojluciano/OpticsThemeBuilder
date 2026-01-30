/**
 * Shared utilities for generating WCAG contrast reports
 */

export interface ContrastFailure {
  mode?: string;
  stop: string | number;
  background: string;
  backgroundLightness: number;
  foreground: string;
  foregroundLightness: number;
  foregroundType: string;
  ratio: number;
}

export interface ContrastEntry {
  label: string;
  hex: string;
  lightness: number;
  ratio: number;
}

/**
 * Generate the header section of a contrast report
 */
export function generateReportHeader(
  paletteName: string,
  baseColorHex: string,
  totalStops: number
): string {
  let report = `# WCAG Contrast Report\n`;
  report += `# Palette: ${paletteName}\n`;
  report += `# Base Color: ${baseColorHex}\n`;
  report += `# Total Stops: ${totalStops}\n\n`;
  report += `${"=".repeat(80)}\n\n`;
  return report;
}

/**
 * Generate the failures summary section
 */
export function generateFailuresSummary(failures: ContrastFailure[]): string {
  let report = `## ⚠️  FAILURES SUMMARY\n\n`;
  
  if (failures.length === 0) {
    report += `✅ ALL COMBINATIONS PASS WCAG AA STANDARD (4.5:1)\n`;
    report += `   No contrast issues found!\n\n`;
  } else {
    report += `Found ${failures.length} combinations that FAIL WCAG AA standard (4.5:1):\n\n`;
    
    failures.forEach(f => {
      const modePrefix = f.mode ? `${f.mode} Mode • ` : '';
      report += `❌ ${modePrefix}Stop ${f.stop} • ${f.foregroundType} foreground\n`;
      report += `   Background: ${f.background} (L:${f.backgroundLightness}%) → Foreground: ${f.foreground} (L:${f.foregroundLightness}%)\n`;
      report += `   Contrast: ${f.ratio.toFixed(2)}:1 (needs 4.5:1 minimum)\n\n`;
    });
  }
  
  report += `${"=".repeat(80)}\n\n`;
  return report;
}

/**
 * Generate a contrast entry detail
 */
export function generateContrastEntry(entry: ContrastEntry): string {
  const status = entry.ratio >= 4.5 ? 'PASS' : 'FAIL';
  let report = `  • ${entry.label} (L:${entry.lightness}%) — ${entry.hex}\n`;
  report += `    Contrast: ${entry.ratio.toFixed(2)}:1\n`;
  report += `    Status: ${status}\n`;
  
  if (entry.ratio >= 7) {
    report += `    Level: AAA ✓\n`;
  } else if (entry.ratio >= 4.5) {
    report += `    Level: AA ✓\n`;
  } else {
    report += `    Level: Does not meet WCAG standards\n`;
  }
  
  report += `\n`;
  return report;
}

/**
 * Generate the WCAG standards footer
 */
export function generateStandardsFooter(): string {
  let report = `\n${"=".repeat(80)}\n\n`;
  report += `## WCAG STANDARDS\n\n`;
  report += `AA:  4.5:1 minimum (normal text), 3:1 (large text 18pt+)\n`;
  report += `AAA: 7:1 minimum (normal text), 4.5:1 (large text 18pt+)\n`;
  return report;
}

/**
 * Check if a contrast ratio passes WCAG AA
 */
export function passesWCAG_AA(ratio: number): boolean {
  return ratio >= 4.5;
}

/**
 * Get WCAG level label for a contrast ratio
 */
export function getWCAGLevel(ratio: number): string {
  if (ratio >= 7) return 'AAA ✓';
  if (ratio >= 4.5) return 'AA ✓';
  if (ratio >= 3) return 'AA Large ✓';
  return 'Does not meet WCAG standards';
}

/**
 * Create a contrast failure object
 */
export function createContrastFailure(
  mode: string | undefined,
  stop: string | number,
  background: { hex: string; hsl: { h: number; s: number; l: number } },
  foreground: { hex: string; hsl: { h: number; s: number; l: number } },
  foregroundType: string,
  ratio: number
): ContrastFailure {
  return {
    mode,
    stop,
    background: background.hex,
    backgroundLightness: Math.round(background.hsl.l * 100),
    foreground: foreground.hex,
    foregroundLightness: Math.round(foreground.hsl.l * 100),
    foregroundType,
    ratio,
  };
}

/**
 * Collect failures from a contrast check
 */
export function collectFailureIfNeeded(
  ratio: number,
  mode: string | undefined,
  stop: string | number,
  background: { hex: string; hsl: { h: number; s: number; l: number } },
  foreground: { hex: string; hsl: { h: number; s: number; l: number } },
  foregroundType: string
): ContrastFailure | null {
  if (!passesWCAG_AA(ratio)) {
    return createContrastFailure(mode, stop, background, foreground, foregroundType, ratio);
  }
  return null;
}