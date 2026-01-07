import { ColorPalette } from './types';
import * as path from 'path';
import { saveToFile, saveJsonToFile } from './file-utils';
import { hexToFigmaColor, createColorToken, generateVariableId, createRootExtensions } from './figma-utils';
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
 * Export palette to Figma Variables Import format
 * Matches the exact structure Figma expects for native Variables import
 */
export function exportToFigma(palette: ColorPalette, mode: string = 'Light'): any {
  const root: any = {};
  const paletteGroup: any = {};
  
  // Add background colors
  palette.stops.forEach((stop) => {
    paletteGroup[stop.stop] = {
      $type: 'color',
      $value: hexToFigmaColor(stop.background.hex),
      $extensions: {
        'com.figma.variableId': generateVariableId(),
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
      $value: hexToFigmaColor(stop.foregrounds.light.hex),
      $extensions: {
        'com.figma.variableId': generateVariableId(),
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
      $value: hexToFigmaColor(stop.foregrounds.dark.hex),
      $extensions: {
        'com.figma.variableId': generateVariableId(),
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
  root.$extensions = {
    'com.figma.modeName': mode,
  };
  
  return root;
}

/**
 * Generate a contrast report for standard (non-Optics) palettes
 */
export function exportContrastReport(palette: ColorPalette): string {
  // Generate header
  let report = generateReportHeader(
    palette.name,
    palette.baseColor.hex,
    palette.stops.length
  );
  
  // Collect failures
  const failures: ContrastFailure[] = [];
  
  palette.stops.forEach(stop => {
    if (!passesWCAG_AA(stop.foregrounds.light.contrast)) {
      failures.push({
        stop: stop.stop,
        background: stop.background.hex,
        backgroundLightness: Math.round(stop.background.hsl.l),
        foreground: stop.foregrounds.light.hex,
        foregroundLightness: Math.round(stop.foregrounds.light.hsl.l),
        foregroundType: 'light',
        ratio: stop.foregrounds.light.contrast,
      });
    }
    
    if (!passesWCAG_AA(stop.foregrounds.dark.contrast)) {
      failures.push({
        stop: stop.stop,
        background: stop.background.hex,
        backgroundLightness: Math.round(stop.background.hsl.l),
        foreground: stop.foregrounds.dark.hex,
        foregroundLightness: Math.round(stop.foregrounds.dark.hsl.l),
        foregroundType: 'dark',
        ratio: stop.foregrounds.dark.contrast,
      });
    }
  });
  
  // Generate failures summary
  report += generateFailuresSummary(failures);
  
  // Generate detailed report
  report += `## DETAILED CONTRAST ANALYSIS\n\n`;
  
  palette.stops.forEach(stop => {
    report += `### Stop ${stop.stop}\n`;
    report += `Background: ${stop.background.hex}\n`;
    report += `Recommended: Use ${stop.recommendedForeground} foreground\n\n`;
    
    // Light foreground
    const lightEntry: ContrastEntry = {
      label: `Light Foreground (${stop.foregrounds.light.hex})`,
      hex: stop.foregrounds.light.hex,
      lightness: Math.round(stop.foregrounds.light.hsl.l),
      ratio: stop.foregrounds.light.contrast,
    };
    report += generateContrastEntry(lightEntry);
    
    // Dark foreground
    const darkEntry: ContrastEntry = {
      label: `Dark Foreground (${stop.foregrounds.dark.hex})`,
      hex: stop.foregrounds.dark.hex,
      lightness: Math.round(stop.foregrounds.dark.hsl.l),
      ratio: stop.foregrounds.dark.contrast,
    };
    report += generateContrastEntry(darkEntry);
  });
  
  // Add footer
  report += generateStandardsFooter();
  
  return report;
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
  
  const figmaData = exportToFigma(palette);
  const contrastReportContent = exportContrastReport(palette);
  
  saveJsonToFile(figmaData, figmaPath);
  saveToFile(contrastReportContent, contrastReportPath);
  
  return {
    figma: figmaPath,
    contrastReport: contrastReportPath,
  };
}