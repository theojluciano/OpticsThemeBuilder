import { OpticsPalette } from './types';
import * as path from 'path';
import { saveToFile, saveJsonToFile } from './file-utils';
import { createColorToken } from './figma-utils';
import {
  generateReportHeader,
  generateFailuresSummary,
  generateContrastEntry,
  generateStandardsFooter,
  passesWCAG_AA,
  ContrastFailure,
  ContrastEntry,
} from './contrast-report-utils';

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
    const { groupName, varName } = parseStopName(stopName);
    
    // Select the appropriate colors based on mode
    const bgHex = isLightMode ? stop.background.light.hex : stop.background.dark.hex;
    const onHex = isLightMode ? stop.on.light.hex : stop.on.dark.hex;
    const onAltHex = isLightMode ? stop.onAlt.light.hex : stop.onAlt.dark.hex;
    
    // Create variables
    const bgVariable = createColorToken(
      bgHex,
      `${palette.name}-${stop.name}-bg`,
      `var(--op-color-${palette.name}-${stop.name}-bg)`
    );
    
    const onVariable = createColorToken(
      onHex,
      `${palette.name}-${stop.name}-on`,
      `var(--op-color-${palette.name}-${stop.name}-on)`
    );
    
    const onAltVariable = createColorToken(
      onAltHex,
      `${palette.name}-${stop.name}-on-alt`,
      `var(--op-color-${palette.name}-${stop.name}-on-alt)`
    );
    
    // Place background colors
    if (groupName === '') {
      tokens[palette.name][varName] = bgVariable;
    } else {
      tokens[palette.name][groupName][varName] = bgVariable;
    }
    
    // Place foreground colors in 'on' group
    if (groupName === '') {
      tokens[palette.name]['on'][varName] = onVariable;
      tokens[palette.name]['on'][`${varName}-alt`] = onAltVariable;
    } else {
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
 * Parse Optics stop name into group and variable name
 */
function parseStopName(stopName: string): { groupName: string; varName: string } {
  if (stopName === 'base') {
    return { groupName: '', varName: 'base' };
  } else if (stopName.startsWith('plus-')) {
    return { groupName: 'plus', varName: stopName.replace('plus-', '') };
  } else if (stopName.startsWith('minus-')) {
    return { groupName: 'minus', varName: stopName.replace('minus-', '') };
  }
  return { groupName: '', varName: stopName };
}

/**
 * Generate a simple, clear contrast report with PASS/FAIL indicators
 */
export function exportOpticsContrastReport(palette: OpticsPalette): string {
  // Generate header
  let report = generateReportHeader(
    palette.name,
    palette.baseColor.hex,
    palette.stops.length
  );
  
  // Collect all failures
  const failures: ContrastFailure[] = [];
  
  palette.stops.forEach(stop => {
    // Light mode failures
    if (!passesWCAG_AA(stop.lightModeContrast.on)) {
      failures.push(createFailure('Light', palette.name, stop.name, stop.background.light, stop.on.light, 'on', stop.lightModeContrast.on));
    }
    if (!passesWCAG_AA(stop.lightModeContrast.onAlt)) {
      failures.push(createFailure('Light', palette.name, stop.name, stop.background.light, stop.onAlt.light, 'on-alt', stop.lightModeContrast.onAlt));
    }
    
    // Dark mode failures
    if (!passesWCAG_AA(stop.darkModeContrast.on)) {
      failures.push(createFailure('Dark', palette.name, stop.name, stop.background.dark, stop.on.dark, 'on', stop.darkModeContrast.on));
    }
    if (!passesWCAG_AA(stop.darkModeContrast.onAlt)) {
      failures.push(createFailure('Dark', palette.name, stop.name, stop.background.dark, stop.onAlt.dark, 'on-alt', stop.darkModeContrast.onAlt));
    }
  });
  
  // Generate failures summary
  report += generateFailuresSummary(failures);
  
  // Generate detailed reports for each mode
  report += generateModeReport('LIGHT MODE', palette, 'light');
  report += `\n${"=".repeat(80)}\n\n`;
  report += generateModeReport('DARK MODE', palette, 'dark');
  
  // Add footer
  report += generateStandardsFooter();
  
  return report;
}

/**
 * Create a contrast failure object
 */
function createFailure(
  mode: string,
  paletteName: string,
  stopName: string,
  background: { hex: string; hsl: { l: number } },
  foreground: { hex: string; hsl: { l: number } },
  fgType: string,
  ratio: number
): ContrastFailure {
  return {
    mode,
    stop: `${paletteName}/${stopName}`,
    background: background.hex,
    backgroundLightness: Math.round(background.hsl.l),
    foreground: foreground.hex,
    foregroundLightness: Math.round(foreground.hsl.l),
    foregroundType: fgType,
    ratio,
  };
}

/**
 * Generate a detailed report for a specific mode
 */
function generateModeReport(
  title: string,
  palette: OpticsPalette,
  mode: 'light' | 'dark'
): string {
  let report = `## ${title}\n\n`;
  
  palette.stops.forEach(stop => {
    const bg = mode === 'light' ? stop.background.light : stop.background.dark;
    const on = mode === 'light' ? stop.on.light : stop.on.dark;
    const onAlt = mode === 'light' ? stop.onAlt.light : stop.onAlt.dark;
    const contrast = mode === 'light' ? stop.lightModeContrast : stop.darkModeContrast;
    
    const bgL = Math.round(bg.hsl.l);
    const onL = Math.round(on.hsl.l);
    const onAltL = Math.round(onAlt.hsl.l);
    
    report += `### ${palette.name}/${stop.name} (L:${bgL}%)\n`;
    report += `Background: ${bg.hex}\n\n`;
    
    // On color
    const onEntry: ContrastEntry = {
      label: `${palette.name}/${stop.name}-on (L:${onL}%)`,
      hex: on.hex,
      lightness: onL,
      ratio: contrast.on,
    };
    report += generateContrastEntry(onEntry);
    
    // On-alt color
    const onAltEntry: ContrastEntry = {
      label: `${palette.name}/${stop.name}-on-alt (L:${onAltL}%)`,
      hex: onAlt.hex,
      lightness: onAltL,
      ratio: contrast.onAlt,
    };
    report += generateContrastEntry(onAltEntry);
  });
  
  return report;
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
  
  saveToFile(figmaLightContent, figmaLightPath);
  saveToFile(figmaDarkContent, figmaDarkPath);
  saveToFile(contrastReportContent, contrastReportPath);
  
  return {
    figmaLight: figmaLightPath,
    figmaDark: figmaDarkPath,
    contrastReport: contrastReportPath,
  };
}