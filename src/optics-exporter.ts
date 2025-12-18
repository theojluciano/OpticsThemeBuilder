import { OpticsPalette } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Convert hex color to Figma color value format
 */
function hexToFigmaColor(hex: string): any {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert to 0-1 range
  return {
    colorSpace: 'srgb',
    components: [r / 255, g / 255, b / 255],
    alpha: 1.0,
    hex: hex.toUpperCase()
  };
}

/**
 * Export Optics palette to Figma Variables Import format
 * Matches the Design Tokens format that Figma's Variables plugin expects
 * Structure matches Optics format with flat grouping under plus/minus
 * @param palette The Optics palette to export
 * @param mode The mode to export: 'Light' or 'Dark'
 */
export function exportOpticsToFigma(palette: OpticsPalette, mode: 'Light' | 'Dark' = 'Light'): string {
  const isLightMode = mode === 'Light';
  const collectionName = 'op-color';
  
  // Build tokens with flat structure matching Optics format
  // Initialize groups in the desired order: base, plus, minus, on
  const tokens: any = {
    [palette.name]: {
      base: null,
      plus: {},
      minus: {},
      on: {
        base: null,
        'base-alt': null,
        plus: {},
        minus: {}
      }
    }
  };
  
  // Process each stop
  palette.stops.forEach((stop) => {
    const stopName = stop.name;
    
    // Determine group and variable name
    let groupName: string;
    let varName: string;
    
    if (stopName === 'base') {
      // Base goes directly under palette name
      groupName = '';
      varName = 'base';
    } else if (stopName.startsWith('plus-')) {
      groupName = 'plus';
      varName = stopName.replace('plus-', '');
    } else if (stopName.startsWith('minus-')) {
      groupName = 'minus';
      varName = stopName.replace('minus-', '');
    } else {
      groupName = '';
      varName = stopName;
    }
    
    // Create background color variable
    const bgVariable = {
      $type: 'color',
      $value: hexToFigmaColor(isLightMode ? stop.background.light.hex : stop.background.dark.hex),
      $extensions: {
        'com.figma.variableId': `${palette.name}-${stop.name}-bg`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: `var(--op-color-${palette.name}-${stop.name}-bg)`
        }
      }
    };
    
    // Create on (foreground) variable
    const onVariable = {
      $type: 'color',
      $value: hexToFigmaColor(isLightMode ? stop.on.light.hex : stop.on.dark.hex),
      $extensions: {
        'com.figma.variableId': `${palette.name}-${stop.name}-on`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: `var(--op-color-${palette.name}-${stop.name}-on)`
        }
      }
    };
    
    // Create on-alt variable
    const onAltVariable = {
      $type: 'color',
      $value: hexToFigmaColor(isLightMode ? stop.onAlt.light.hex : stop.onAlt.dark.hex),
      $extensions: {
        'com.figma.variableId': `${palette.name}-${stop.name}-on-alt`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: `var(--op-color-${palette.name}-${stop.name}-on-alt)`
        }
      }
    };
    
    // Place background colors - flat structure
    if (groupName === '') {
      // Base case - place directly under palette
      tokens[palette.name][varName] = bgVariable;
    } else {
      // Plus/minus case - place directly under group
      tokens[palette.name][groupName][varName] = bgVariable;
    }
    
    // Place foreground colors in 'on' group - flat structure
    if (groupName === '') {
      // Base case - place directly under palette/on
      tokens[palette.name]['on'][varName] = onVariable;
      tokens[palette.name]['on'][`${varName}-alt`] = onAltVariable;
    } else {
      // Plus/minus case - place under palette/on/group
      tokens[palette.name]['on'][groupName][varName] = onVariable;
      tokens[palette.name]['on'][groupName][`${varName}-alt`] = onAltVariable;
    }
  });
  
  // Build the final structure matching actual Figma export format
  const figmaExport = {
    [collectionName]: tokens,
    $extensions: {
      'com.figma.modeName': mode
    }
  };
  
  return JSON.stringify(figmaExport, null, 2);
}

/**
 * Generate a simple, clear contrast report with PASS/FAIL indicators
 */
export function exportOpticsContrastReport(palette: OpticsPalette): string {
  let report = `# WCAG Contrast Report\n`;
  report += `# Palette: ${palette.name}\n`;
  report += `# Base Color: ${palette.baseColor.hex}\n\n`;
  report += `${"=".repeat(80)}\n\n`;
  
  // Collect all failures first
  const failures: Array<{mode: string; stop: string; bg: string; bgL: number; fg: string; fgL: number; fgType: string; ratio: number}> = [];
  
  palette.stops.forEach(stop => {
    // Light mode failures
    if (stop.lightModeContrast.on < 4.5) {
      failures.push({
        mode: 'Light',
        stop: stop.name,
        bg: stop.background.light.hex,
        bgL: Math.round(stop.background.light.hsl.l),
        fg: stop.on.light.hex,
        fgL: Math.round(stop.on.light.hsl.l),
        fgType: 'on',
        ratio: stop.lightModeContrast.on
      });
    }
    if (stop.lightModeContrast.onAlt < 4.5) {
      failures.push({
        mode: 'Light',
        stop: stop.name,
        bg: stop.background.light.hex,
        bgL: Math.round(stop.background.light.hsl.l),
        fg: stop.onAlt.light.hex,
        fgL: Math.round(stop.onAlt.light.hsl.l),
        fgType: 'on-alt',
        ratio: stop.lightModeContrast.onAlt
      });
    }
    
    // Dark mode failures
    if (stop.darkModeContrast.on < 4.5) {
      failures.push({
        mode: 'Dark',
        stop: stop.name,
        bg: stop.background.dark.hex,
        bgL: Math.round(stop.background.dark.hsl.l),
        fg: stop.on.dark.hex,
        fgL: Math.round(stop.on.dark.hsl.l),
        fgType: 'on',
        ratio: stop.darkModeContrast.on
      });
    }
    if (stop.darkModeContrast.onAlt < 4.5) {
      failures.push({
        mode: 'Dark',
        stop: stop.name,
        bg: stop.background.dark.hex,
        bgL: Math.round(stop.background.dark.hsl.l),
        fg: stop.onAlt.dark.hex,
        fgL: Math.round(stop.onAlt.dark.hsl.l),
        fgType: 'on-alt',
        ratio: stop.darkModeContrast.onAlt
      });
    }
  });
  
  // Add failures summary at the top
  report += `## ⚠️  FAILURES SUMMARY\n\n`;
  
  if (failures.length === 0) {
    report += `✅ ALL COMBINATIONS PASS WCAG AA STANDARD (4.5:1)\n`;
    report += `   No contrast issues found!\n\n`;
  } else {
    report += `Found ${failures.length} combinations that FAIL WCAG AA standard (4.5:1):\n\n`;
    
    failures.forEach(f => {
      report += `❌ ${f.mode} Mode • ${palette.name}/${f.stop} (L:${f.bgL}%) → ${palette.name}/${f.stop}-${f.fgType} (L:${f.fgL}%)\n`;
      report += `   Background: ${f.bg} → Foreground: ${f.fg}\n`;
      report += `   Contrast: ${f.ratio.toFixed(2)}:1 (needs 4.5:1 minimum)\n\n`;
    });
  }
  
  report += `${"=".repeat(80)}\n\n`;
  
  report += `## LIGHT MODE\n\n`;
  
  palette.stops.forEach(stop => {
    const bgL = Math.round(stop.background.light.hsl.l);
    const onL = Math.round(stop.on.light.hsl.l);
    const onAltL = Math.round(stop.onAlt.light.hsl.l);
    
    report += `### ${palette.name}/${stop.name} (L:${bgL}%)\n`;
    report += `Background: ${stop.background.light.hex}\n\n`;
    
    // On color
    const onRatio = stop.lightModeContrast.on;
    const onStatus = onRatio >= 4.5 ? 'PASS' : 'FAIL';
    report += `  • ${palette.name}/${stop.name}-on (L:${onL}%) — ${stop.on.light.hex}\n`;
    report += `    Contrast: ${onRatio.toFixed(2)}:1\n`;
    report += `    Status: ${onStatus}\n`;
    if (onRatio >= 7) report += `    Level: AAA ✓\n`;
    else if (onRatio >= 4.5) report += `    Level: AA ✓\n`;
    else report += `    Level: Does not meet WCAG standards\n`;
    report += `\n`;
    
    // On-alt color
    const onAltRatio = stop.lightModeContrast.onAlt;
    const onAltStatus = onAltRatio >= 4.5 ? 'PASS' : 'FAIL';
    report += `  • ${palette.name}/${stop.name}-on-alt (L:${onAltL}%) — ${stop.onAlt.light.hex}\n`;
    report += `    Contrast: ${onAltRatio.toFixed(2)}:1\n`;
    report += `    Status: ${onAltStatus}\n`;
    if (onAltRatio >= 7) report += `    Level: AAA ✓\n`;
    else if (onAltRatio >= 4.5) report += `    Level: AA ✓\n`;
    else report += `    Level: Does not meet WCAG standards\n`;
    report += `\n`;
  });
  
  report += `\n${"=".repeat(80)}\n\n`;
  report += `## DARK MODE\n\n`;
  
  palette.stops.forEach(stop => {
    const bgL = Math.round(stop.background.dark.hsl.l);
    const onL = Math.round(stop.on.dark.hsl.l);
    const onAltL = Math.round(stop.onAlt.dark.hsl.l);
    
    report += `### ${palette.name}/${stop.name} (L:${bgL}%)\n`;
    report += `Background: ${stop.background.dark.hex}\n\n`;
    
    // On color
    const onRatio = stop.darkModeContrast.on;
    const onStatus = onRatio >= 4.5 ? 'PASS' : 'FAIL';
    report += `  • ${palette.name}/${stop.name}-on (L:${onL}%) — ${stop.on.dark.hex}\n`;
    report += `    Contrast: ${onRatio.toFixed(2)}:1\n`;
    report += `    Status: ${onStatus}\n`;
    if (onRatio >= 7) report += `    Level: AAA ✓\n`;
    else if (onRatio >= 4.5) report += `    Level: AA ✓\n`;
    else report += `    Level: Does not meet WCAG standards\n`;
    report += `\n`;
    
    // On-alt color
    const onAltRatio = stop.darkModeContrast.onAlt;
    const onAltStatus = onAltRatio >= 4.5 ? 'PASS' : 'FAIL';
    report += `  • ${palette.name}/${stop.name}-on-alt (L:${onAltL}%) — ${stop.onAlt.dark.hex}\n`;
    report += `    Contrast: ${onAltRatio.toFixed(2)}:1\n`;
    report += `    Status: ${onAltStatus}\n`;
    if (onAltRatio >= 7) report += `    Level: AAA ✓\n`;
    else if (onAltRatio >= 4.5) report += `    Level: AA ✓\n`;
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
export function saveOpticsToFile(content: string, filepath: string): void {
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Export Optics palette to Figma and generate contrast report
 */
export function exportOpticsAll(palette: OpticsPalette, outputDir: string): {
  figmaLight: string;
  figmaDark: string;
  contrastReport: string;
} {
  const figmaLightPath = path.join(outputDir, `${palette.name}-light.tokens.json`);
  const figmaDarkPath = path.join(outputDir, `${palette.name}-dark.tokens.json`);
  const contrastReportPath = path.join(outputDir, `${palette.name}-contrast-report.txt`);
  
  const figmaLightContent = exportOpticsToFigma(palette, 'Light');
  const figmaDarkContent = exportOpticsToFigma(palette, 'Dark');
  const contrastReportContent = exportOpticsContrastReport(palette);
  
  saveOpticsToFile(figmaLightContent, figmaLightPath);
  saveOpticsToFile(figmaDarkContent, figmaDarkPath);
  saveOpticsToFile(contrastReportContent, contrastReportPath);
  
  return {
    figmaLight: figmaLightPath,
    figmaDark: figmaDarkPath,
    contrastReport: contrastReportPath,
  };
}