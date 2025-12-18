import { ColorPalette } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Export palette to Figma Variables Import format
 * Matches the exact structure Figma expects for native Variables import
 */
export function exportToFigma(palette: ColorPalette, mode: string = 'Light'): any {
  const root: any = {};
  
  // Helper to convert RGB to components array for Figma
  const rgbToComponents = (rgb: { r: number; g: number; b: number }) => [
    rgb.r,
    rgb.g,
    rgb.b,
  ];
  
  // Helper to create color value object
  const createColorValue = (hex: string, rgb: { r: number; g: number; b: number }) => ({
    colorSpace: 'srgb',
    components: rgbToComponents(rgb),
    alpha: 1,
    hex: hex,
  });
  
  // Create nested structure for palette
  const paletteGroup: any = {};
  
  // Add background colors
  palette.stops.forEach((stop) => {
    paletteGroup[stop.stop] = {
      $type: 'color',
      $value: createColorValue(stop.background.hex, stop.background.rgb),
      $extensions: {
        'com.figma.variableId': `VariableID:${Math.random().toString(36).substring(2, 15)}`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: stop.background.hex,
        },
      },
    };
  });
  
  // Create foreground group
  const foregroundGroup: any = {
    light: {},
    dark: {},
  };
  
  // Add light foreground colors
  palette.stops.forEach((stop) => {
    foregroundGroup.light[stop.stop] = {
      $type: 'color',
      $value: createColorValue(stop.foregrounds.light.hex, stop.foregrounds.light.rgb),
      $extensions: {
        'com.figma.variableId': `VariableID:${Math.random().toString(36).substring(2, 15)}`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: stop.foregrounds.light.hex,
        },
      },
    };
  });
  
  // Add dark foreground colors
  palette.stops.forEach((stop) => {
    foregroundGroup.dark[stop.stop] = {
      $type: 'color',
      $value: createColorValue(stop.foregrounds.dark.hex, stop.foregrounds.dark.rgb),
      $extensions: {
        'com.figma.variableId': `VariableID:${Math.random().toString(36).substring(2, 15)}`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: stop.foregrounds.dark.hex,
        },
      },
    };
  });
  
  // Build root structure
  root[palette.name] = paletteGroup;
  root[`${palette.name}-foregrounds`] = foregroundGroup;
  
  // Add root-level extensions
  root.$extensions = {
    'com.figma.modeName': mode,
  };
  
  return root;
}

/**
 * Generate a contrast report for standard (non-Optics) palettes
 */
export function exportContrastReport(palette: ColorPalette): string {
  let report = `# WCAG Contrast Report\n`;
  report += `# Palette: ${palette.name}\n`;
  report += `# Base Color: ${palette.baseColor.hex}\n`;
  report += `# Total Stops: ${palette.stops.length}\n\n`;
  report += `${"=".repeat(80)}\n\n`;
  
  // Collect failures
  const failures: Array<{stop: number; bg: string; fg: string; fgType: string; ratio: number}> = [];
  
  palette.stops.forEach(stop => {
    if (stop.foregrounds.light.contrast < 4.5) {
      failures.push({
        stop: stop.stop,
        bg: stop.background.hex,
        fg: stop.foregrounds.light.hex,
        fgType: 'light',
        ratio: stop.foregrounds.light.contrast
      });
    }
    if (stop.foregrounds.dark.contrast < 4.5) {
      failures.push({
        stop: stop.stop,
        bg: stop.background.hex,
        fg: stop.foregrounds.dark.hex,
        fgType: 'dark',
        ratio: stop.foregrounds.dark.contrast
      });
    }
  });
  
  // Failures summary
  report += `## ⚠️  FAILURES SUMMARY\n\n`;
  
  if (failures.length === 0) {
    report += `✅ ALL COMBINATIONS PASS WCAG AA STANDARD (4.5:1)\n`;
    report += `   No contrast issues found!\n\n`;
  } else {
    report += `Found ${failures.length} combinations that FAIL WCAG AA standard (4.5:1):\n\n`;
    
    failures.forEach(f => {
      report += `❌ Stop ${f.stop} • ${f.fgType} foreground\n`;
      report += `   Background: ${f.bg} → Foreground: ${f.fg}\n`;
      report += `   Contrast: ${f.ratio.toFixed(2)}:1 (needs 4.5:1 minimum)\n\n`;
    });
  }
  
  report += `${"=".repeat(80)}\n\n`;
  
  // Detailed report
  report += `## DETAILED CONTRAST ANALYSIS\n\n`;
  
  palette.stops.forEach(stop => {
    report += `### Stop ${stop.stop}\n`;
    report += `Background: ${stop.background.hex}\n`;
    report += `Recommended: Use ${stop.recommendedForeground} foreground\n\n`;
    
    // Light foreground
    const lightRatio = stop.foregrounds.light.contrast;
    const lightStatus = lightRatio >= 4.5 ? 'PASS' : 'FAIL';
    report += `  • Light Foreground (${stop.foregrounds.light.hex})\n`;
    report += `    Contrast: ${lightRatio.toFixed(2)}:1\n`;
    report += `    Status: ${lightStatus}\n`;
    if (lightRatio >= 7) report += `    Level: AAA ✓\n`;
    else if (lightRatio >= 4.5) report += `    Level: AA ✓\n`;
    else report += `    Level: Does not meet WCAG standards\n`;
    report += `\n`;
    
    // Dark foreground
    const darkRatio = stop.foregrounds.dark.contrast;
    const darkStatus = darkRatio >= 4.5 ? 'PASS' : 'FAIL';
    report += `  • Dark Foreground (${stop.foregrounds.dark.hex})\n`;
    report += `    Contrast: ${darkRatio.toFixed(2)}:1\n`;
    report += `    Status: ${darkStatus}\n`;
    if (darkRatio >= 7) report += `    Level: AAA ✓\n`;
    else if (darkRatio >= 4.5) report += `    Level: AA ✓\n`;
    else report += `    Level: Does not meet WCAG standards\n`;
    report += `\n`;
  });
  
  report += `\n${"=".repeat(80)}\n\n`;
  report += `## WCAG STANDARDS\n\n`;
  report += `AA:  4.5:1 minimum (normal text), 3:1 (large text 18pt+)\n`;
  report += `AAA: 7:1 minimum (normal text), 4.5:1 (large text 18pt+)\n`;
  
  return report;
}

/**
 * Save content to file
 */
export function saveToFile(content: string, filepath: string): void {
  const dir = path.dirname(filepath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Export Figma formats and contrast report
 */
export function exportAll(palette: ColorPalette, outputDir: string): {
  figma: string;
  contrastReport: string;
} {
  const figmaPath = path.join(outputDir, `${palette.name}-figma.json`);
  const contrastReportPath = path.join(outputDir, `${palette.name}-contrast-report.txt`);
  
  const figmaContent = JSON.stringify(exportToFigma(palette), null, 2);
  const contrastReportContent = exportContrastReport(palette);
  
  saveToFile(figmaContent, figmaPath);
  saveToFile(contrastReportContent, contrastReportPath);
  
  return {
    figma: figmaPath,
    contrastReport: contrastReportPath,
  };
}