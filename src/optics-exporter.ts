import { OpticsPalette } from './types';
import * as path from 'path';
import { saveToFile, saveJsonToFile } from './file-utils';
import { createColorToken } from './figma-utils';
import {
  generateReportHeader,
  generateFailuresSummary,
  generateContrastEntry,
  generateStandardsFooter,
  collectFailureIfNeeded,
  ContrastFailure,
  ContrastEntry,
} from './contrast-report-utils';

/**
 * Color types that the Optics design system groups under an `alerts/` namespace
 * (i.e. `op-color/alerts/notice/…`). Nesting them keeps the export compatible
 * with importing as a new *mode* of an existing Optics collection.
 */
const ALERT_TYPE_NAMES = ['notice', 'warning', 'danger', 'info'];

/**
 * Export Optics palette to Figma Variables Import format
 * Matches the Design Tokens format that Figma's Variables plugin expects.
 * Structure matches Optics format: `base` plus `plus`/`minus`/`on` groups.
 * Alert palettes (notice/warning/danger/info) are nested under an `alerts/`
 * group to match the Optics "Color Styles" collection convention.
 * @param palette The Optics palette to export
 * @param mode The mode to export: 'Light' or 'Dark'
 */
export function exportOpticsToFigma(palette: OpticsPalette, mode: 'Light' | 'Dark' = 'Light'): string {
  const isLightMode = mode === 'Light';
  const collectionName = 'op-color';

  // Alert types live under `alerts/<name>`; everything else stays top-level.
  const isAlert = ALERT_TYPE_NAMES.includes(palette.name);

  const entry: any = {
    base: null,
    plus: {},
    minus: {},
    on: {
      base: null,
      'base-alt': null,
      plus: {},
      minus: {}
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
      entry[varName] = bgVariable;
    } else {
      entry[groupName][varName] = bgVariable;
    }

    // Place foreground colors in 'on' group
    if (groupName === '') {
      entry['on'][varName] = onVariable;
      entry['on'][`${varName}-alt`] = onAltVariable;
    } else {
      entry['on'][groupName][varName] = onVariable;
      entry['on'][groupName][`${varName}-alt`] = onAltVariable;
    }
  });
  
  // Build the final structure, nesting alert palettes under an `alerts/` group.
  const tokens = isAlert ? { alerts: { [palette.name]: entry } } : { [palette.name]: entry };
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
  
  // Collect all failures using shared utility
  const failures: ContrastFailure[] = palette.stops.flatMap(stop => {
    const stopIdentifier = `${palette.name}/${stop.name}`;
    const results: ContrastFailure[] = [];
    
    // Light mode failures
    const lightOnFailure = collectFailureIfNeeded(
      stop.lightModeContrast.on,
      'Light',
      stopIdentifier,
      stop.background.light,
      stop.on.light,
      'on'
    );
    if (lightOnFailure) results.push(lightOnFailure);
    
    const lightOnAltFailure = collectFailureIfNeeded(
      stop.lightModeContrast.onAlt,
      'Light',
      stopIdentifier,
      stop.background.light,
      stop.onAlt.light,
      'on-alt'
    );
    if (lightOnAltFailure) results.push(lightOnAltFailure);
    
    // Dark mode failures
    const darkOnFailure = collectFailureIfNeeded(
      stop.darkModeContrast.on,
      'Dark',
      stopIdentifier,
      stop.background.dark,
      stop.on.dark,
      'on'
    );
    if (darkOnFailure) results.push(darkOnFailure);
    
    const darkOnAltFailure = collectFailureIfNeeded(
      stop.darkModeContrast.onAlt,
      'Dark',
      stopIdentifier,
      stop.background.dark,
      stop.onAlt.dark,
      'on-alt'
    );
    if (darkOnAltFailure) results.push(darkOnAltFailure);
    
    return results;
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
    
    const bgL = Math.round(bg.hsl.l * 100);
    const onL = Math.round(on.hsl.l * 100);
    const onAltL = Math.round(onAlt.hsl.l * 100);
    
    report += `### ${palette.name}/${stop.name} (L:${bgL}%)\n`;
    report += `Background: ${bg.hex}\n\n`;
    
    // On color
    report += generateContrastEntry({
      label: `${palette.name}/${stop.name}-on (L:${onL}%)`,
      hex: on.hex,
      lightness: onL,
      ratio: contrast.on,
    });
    
    // On-alt color
    report += generateContrastEntry({
      label: `${palette.name}/${stop.name}-on-alt (L:${onAltL}%)`,
      hex: onAlt.hex,
      lightness: onAltL,
      ratio: contrast.onAlt,
    });
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