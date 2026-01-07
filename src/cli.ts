#!/usr/bin/env node

import { Command } from 'commander';
import { generatePalette } from './generator';
import { generateOpticsPalette } from './optics-generator';
import { exportAll } from './exporter';
import { exportOpticsAll, exportOpticsToFigma } from './optics-exporter';
import * as path from 'path';
import { saveToFile } from './file-utils';
import {
  printPaletteSummary,
  printBaseColorInfo,
  printContrastAnalysisHeader,
  printSampleContrastHeader,
  printContrastLine,
  printOpticsContrastSample,
  printExportHeader,
  printFileExport,
  printCompletion,
  printFigmaInstructions,
  printError,
  printAnalysisResult,
} from './console-utils';

const program = new Command();

program
  .name('optics')
  .description('Generate accessible color palettes for Figma with automatic foreground color selection')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a color palette from a base color')
  .argument('<color>', 'Base color (hex, hsl, rgb, or any CSS color)')
  .option('-n, --name <name>', 'Name for the palette', 'palette')
  .option('-s, --stops <number>', 'Number of color stops (ignored with --optics)', '16')
  .option('-o, --output <directory>', 'Output directory for generated files', './output')
  .option('-m, --mode <mode>', 'Mode for Figma export: light, dark, or both', 'both')
  .option('--optics', 'Generate using Optics scale format (19 stops with light-dark mode)')
  .action((color: string, options) => {
    try {
      if (options.optics) {
        handleOpticsGeneration(color, options);
      } else {
        handleStandardGeneration(color, options);
      }
    } catch (error) {
      printError(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze contrast ratios for a color combination')
  .argument('<background>', 'Background color')
  .argument('<foreground>', 'Foreground color')
  .action((background: string, foreground: string) => {
    try {
      const { converter, formatHex } = require('culori');
      const { getContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } = require('./contrast');
      
      const toRgb = converter('rgb');
      
      const bg = toRgb(background);
      const fg = toRgb(foreground);
      
      if (!bg || !fg) {
        printError('Invalid color format');
        process.exit(1);
      }
      
      const bgHex = formatHex(bg);
      const fgHex = formatHex(fg);
      const contrast = getContrastRatio(bg, fg);
      const aa = meetsWCAG_AA(contrast);
      const aaa = meetsWCAG_AAA(contrast);
      
      printAnalysisResult(bgHex, fgHex, contrast, aa, aaa);
    } catch (error) {
      printError(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Handle Optics palette generation
 */
function handleOpticsGeneration(color: string, options: any): void {
  printPaletteSummary(color, options.name, 'Optics scale (19 stops with light/dark modes)');
  
  // Generate Optics palette
  const opticsPalette = generateOpticsPalette(color, options.name);
  
  printBaseColorInfo(
    opticsPalette.stops.length,
    opticsPalette.baseColor.hex,
    opticsPalette.baseColor.h,
    opticsPalette.baseColor.s,
    opticsPalette.baseColor.l
  );
  
  // Display contrast information for key stops
  printSampleContrastHeader();
  const sampleStops = ['plus-max', 'base', 'minus-max'];
  opticsPalette.stops
    .filter(s => sampleStops.includes(s.name))
    .forEach((stop) => {
      printOpticsContrastSample(
        stop.name,
        'light',
        stop.background.light.hex,
        stop.lightModeContrast.on,
        stop.lightModeContrast.onAlt
      );
      printOpticsContrastSample(
        '',
        'dark',
        stop.background.dark.hex,
        stop.darkModeContrast.on,
        stop.darkModeContrast.onAlt
      );
    });
  
  printExportHeader();
  
  const outputDir = options.output;
  const mode = options.mode.toLowerCase();
  
  exportOpticsFiles(opticsPalette, outputDir, mode);
  
  printCompletion('Optics');
  printFigmaInstructions(mode === 'both');
}

/**
 * Handle standard palette generation
 */
function handleStandardGeneration(color: string, options: any): void {
  const stops = parseInt(options.stops, 10);
  
  if (isNaN(stops) || stops < 2 || stops > 100) {
    printError('Stops must be a number between 2 and 100');
    process.exit(1);
  }
  
  printPaletteSummary(color, options.name, stops);
  
  // Generate palette
  const palette = generatePalette(color, options.name, stops);
  
  printBaseColorInfo(palette.stops.length, palette.baseColor.hex);
  
  // Display contrast information
  printContrastAnalysisHeader();
  palette.stops.forEach((stop) => {
    const recommended = stop.recommendedForeground === 'light' ? 'Light' : 'Dark';
    const lightPass = stop.foregrounds.light.wcagAA ? '✓' : '✗';
    const darkPass = stop.foregrounds.dark.wcagAA ? '✓' : '✗';
    
    printContrastLine(
      stop.stop,
      stop.background.hex,
      recommended,
      lightPass,
      stop.foregrounds.light.contrast,
      darkPass,
      stop.foregrounds.dark.contrast
    );
  });
  
  printExportHeader();
  
  // Export files
  const outputDir = options.output;
  const files = exportAll(palette, outputDir);
  
  printFileExport('Figma Variables', path.basename(files.figma));
  printFileExport('Contrast Report', path.basename(files.contrastReport));
  
  printCompletion();
  printFigmaInstructions(false);
}

/**
 * Export Optics files based on mode selection
 */
function exportOpticsFiles(palette: any, outputDir: string, mode: string): void {
  if (mode === 'both') {
    const files = exportOpticsAll(palette, outputDir);
    printFileExport('Figma Variables (Light)', path.basename(files.figmaLight));
    printFileExport('Figma Variables (Dark)', path.basename(files.figmaDark));
    printFileExport('Contrast Report', path.basename(files.contrastReport));
  } else if (mode === 'light' || mode === 'dark') {
    const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
    const filepath = path.join(outputDir, `${palette.name}-${mode}.tokens.json`);
    const contrastReportPath = path.join(outputDir, `${palette.name}-contrast-report.txt`);
    
    const content = exportOpticsToFigma(palette, modeCapitalized as 'Light' | 'Dark');
    saveToFile(content, filepath);
    
    printFileExport(`Figma Variables (${modeCapitalized})`, path.basename(filepath));
    printFileExport('Contrast Report', path.basename(contrastReportPath));
  } else {
    printError(`Invalid mode "${mode}". Use: light, dark, or both`);
    process.exit(1);
  }
}

program.parse();