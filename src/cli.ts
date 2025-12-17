#!/usr/bin/env node

import { Command } from 'commander';
import { generatePalette } from './generator';
import { generateOpticsPalette } from './optics-generator';
import { exportAll, exportToFigma, saveToFile, exportToJSON, exportToCSS, exportToTailwind } from './exporter';
import { exportOpticsAll, exportOpticsToCSS, exportOpticsToJSON, exportOpticsToFigma, exportOpticsToTailwind, exportOpticsToDesignTokens } from './optics-exporter';
import * as path from 'path';

const program = new Command();

program
  .name('optics')
  .description('Generate accessible color palettes with automatic foreground color selection')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a color palette from a base color')
  .argument('<color>', 'Base color (hex, hsl, rgb, or any CSS color)')
  .option('-n, --name <name>', 'Name for the palette', 'palette')
  .option('-s, --stops <number>', 'Number of color stops (ignored with --optics)', '16')
  .option('-o, --output <directory>', 'Output directory for generated files', './output')
  .option('-f, --format <format>', 'Export format: all, figma, json, css, tailwind', 'all')
  .option('-m, --mode <mode>', 'Mode for Figma export: light, dark, or both', 'both')
  .option('--optics', 'Generate using Optics scale format (19 stops with light-dark mode)')
  .action((color: string, options) => {
    try {
      console.log('🎨 OpticsThemeBuilder\n');
      console.log(`Generating palette from color: ${color}`);
      console.log(`Palette name: ${options.name}`);
      
      // Check if Optics format is requested
      if (options.optics) {
        console.log(`Format: Optics scale (19 stops with light/dark modes)\n`);
        
        // Generate Optics palette
        const opticsPalette = generateOpticsPalette(color, options.name);
        
        console.log(`✅ Generated ${opticsPalette.stops.length} Optics color stops`);
        console.log(`   Base color: ${opticsPalette.baseColor.hex}`);
        console.log(`   H: ${Math.round(opticsPalette.baseColor.h)}° S: ${Math.round(opticsPalette.baseColor.s)}% L: ${Math.round(opticsPalette.baseColor.l)}%\n`);
        
        // Display contrast information for a few key stops
        console.log('📊 Contrast Analysis (sample):');
        const sampleStops = ['plus-max', 'base', 'minus-max'];
        opticsPalette.stops.filter(s => sampleStops.includes(s.name)).forEach((stop) => {
          console.log(`   ${stop.name.padEnd(12)}: Light ${stop.background.light.hex} → on:${stop.lightModeContrast.on.toFixed(1)} alt:${stop.lightModeContrast.onAlt.toFixed(1)}`);
          console.log(`   ${' '.repeat(12)}  Dark  ${stop.background.dark.hex} → on:${stop.darkModeContrast.on.toFixed(1)} alt:${stop.darkModeContrast.onAlt.toFixed(1)}`);
        });
        
        console.log('\n📦 Exporting Optics format files...');
        
        const outputDir = options.output;
        const format = options.format.toLowerCase();
        
        if (format === 'all') {
          const files = exportOpticsAll(opticsPalette, outputDir);
          Object.entries(files).forEach(([key, file]: [string, string]) => {
            const label = key === 'figmaLight' ? 'Figma Variables (Light)' :
                         key === 'figmaDark' ? 'Figma Variables (Dark)' :
                         key === 'designTokens' ? 'Design Tokens' :
                         key === 'json' ? 'JSON' :
                         key === 'css' ? 'CSS' :
                         key === 'tailwind' ? 'Tailwind' : key;
            console.log(`   ✓ ${label}: ${path.basename(file)}`);
          });
        } else if (format === 'figma') {
          const mode = options.mode.toLowerCase();
          
          if (mode === 'both' || mode === 'light') {
            const filepath = path.join(outputDir, `${opticsPalette.name}-light.tokens.json`);
            const content = exportOpticsToFigma(opticsPalette, 'Light');
            saveToFile(content, filepath);
            console.log(`   ✓ Figma Variables (Light): ${filepath}`);
          }
          
          if (mode === 'both' || mode === 'dark') {
            const filepath = path.join(outputDir, `${opticsPalette.name}-dark.tokens.json`);
            const content = exportOpticsToFigma(opticsPalette, 'Dark');
            saveToFile(content, filepath);
            console.log(`   ✓ Figma Variables (Dark): ${filepath}`);
          }
          
          if (mode !== 'both' && mode !== 'light' && mode !== 'dark') {
            console.error(`❌ Error: Invalid mode "${mode}". Use: light, dark, or both`);
            process.exit(1);
          }
        } else if (format === 'json') {
          const filepath = path.join(outputDir, `${opticsPalette.name}-optics.json`);
          const content = exportOpticsToJSON(opticsPalette);
          saveToFile(content, filepath);
          console.log(`   ✓ JSON: ${filepath}`);
        } else if (format === 'css') {
          const filepath = path.join(outputDir, `${opticsPalette.name}-optics.css`);
          const content = exportOpticsToCSS(opticsPalette);
          saveToFile(content, filepath);
          console.log(`   ✓ CSS: ${filepath}`);
        } else if (format === 'tailwind') {
          const filepath = path.join(outputDir, `${opticsPalette.name}-optics-tailwind.js`);
          const content = exportOpticsToTailwind(opticsPalette);
          saveToFile(content, filepath);
          console.log(`   ✓ Tailwind: ${filepath}`);
        } else {
          console.error(`❌ Unknown format: ${format}`);
          process.exit(1);
        }
        
        console.log('\n✨ Done! Your Optics palette is ready.\n');
        if (format === 'figma' || format === 'all') {
          console.log('💡 Tip: Import each .tokens.json file into Figma Variables panel');
          console.log('   1. Open Figma → Variables panel');
          console.log('   2. Import Light mode file, then Dark mode file');
          console.log('   3. Figma will automatically create a variable collection with both modes');
        }
        
      } else {
        // Original palette generation
        console.log(`Stops: ${options.stops}\n`);
        
        const stops = parseInt(options.stops, 10);
        if (isNaN(stops) || stops < 2 || stops > 100) {
          console.error('❌ Error: Stops must be a number between 2 and 100');
          process.exit(1);
        }

        // Generate palette
        const palette = generatePalette(color, options.name, stops);

        console.log(`✅ Generated ${palette.stops.length} color stops`);
        console.log(`   Base color: ${palette.baseColor.hex}\n`);

        // Display contrast information
        console.log('📊 Contrast Analysis:');
        palette.stops.forEach((stop) => {
          const recommended = stop.recommendedForeground;
          const lightPass = stop.foregrounds.light.wcagAA ? '✓' : '✗';
          const darkPass = stop.foregrounds.dark.wcagAA ? '✓' : '✗';
          
          console.log(`   Stop ${String(stop.stop).padStart(2)}: ${stop.background.hex} → ${recommended === 'light' ? 'Light' : 'Dark'} (L:${lightPass} ${stop.foregrounds.light.contrast.toFixed(1)} D:${darkPass} ${stop.foregrounds.dark.contrast.toFixed(1)})`);
        });

        console.log('\n📦 Exporting files...');

        // Export based on format option
        const outputDir = options.output;
        const format = options.format.toLowerCase();

        if (format === 'all') {
          const files = exportAll(palette, outputDir);
          console.log(`   ✓ Figma Variables: ${files.figma}`);
          console.log(`   ✓ Design Tokens: ${files.designTokens}`);
          console.log(`   ✓ JSON: ${files.json}`);
          console.log(`   ✓ CSS: ${files.css}`);
          console.log(`   ✓ Tailwind: ${files.tailwind}`);
        } else if (format === 'figma') {
          const mode = options.mode.toLowerCase();
          
          if (mode === 'both' || mode === 'light') {
            const filepath = path.join(outputDir, `${palette.name}-light.tokens.json`);
            const content = JSON.stringify(exportToFigma(palette, 'Light'), null, 2);
            saveToFile(content, filepath);
            console.log(`   ✓ Figma Variables (Light): ${filepath}`);
          }
          
          if (mode === 'both' || mode === 'dark') {
            const filepath = path.join(outputDir, `${palette.name}-dark.tokens.json`);
            const content = JSON.stringify(exportToFigma(palette, 'Dark'), null, 2);
            saveToFile(content, filepath);
            console.log(`   ✓ Figma Variables (Dark): ${filepath}`);
          }
          
          if (mode !== 'both' && mode !== 'light' && mode !== 'dark') {
            console.error(`❌ Error: Invalid mode "${mode}". Use: light, dark, or both`);
            process.exit(1);
          }
        } else if (format === 'json') {
          const filepath = path.join(outputDir, `${palette.name}.json`);
          const content = exportToJSON(palette);
          saveToFile(content, filepath);
          console.log(`   ✓ JSON: ${filepath}`);
        } else if (format === 'css') {
          const filepath = path.join(outputDir, `${palette.name}.css`);
          const content = exportToCSS(palette);
          saveToFile(content, filepath);
          console.log(`   ✓ CSS: ${filepath}`);
        } else if (format === 'tailwind') {
          const filepath = path.join(outputDir, `${palette.name}-tailwind.js`);
          const content = exportToTailwind(palette);
          saveToFile(content, filepath);
          console.log(`   ✓ Tailwind: ${filepath}`);
        } else {
          console.error(`❌ Error: Unknown format "${format}". Use: all, figma, json, css, or tailwind`);
          process.exit(1);
        }

        console.log('\n✨ Done!\n');
      }
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
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
      const { hsl, rgb, formatHex, converter } = require('culori');
      const { getContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } = require('./contrast');
      
      const toRgb = converter('rgb');
      
      const bg = toRgb(background);
      const fg = toRgb(foreground);
      
      if (!bg || !fg) {
        console.error('❌ Error: Invalid color format');
        process.exit(1);
      }
      
      const bgHex = formatHex(bg);
      const fgHex = formatHex(fg);
      const contrast = getContrastRatio(bg, fg);
      const aa = meetsWCAG_AA(contrast);
      const aaa = meetsWCAG_AAA(contrast);
      
      console.log('\n🔍 Contrast Analysis\n');
      console.log(`   Background: ${bgHex}`);
      console.log(`   Foreground: ${fgHex}`);
      console.log(`   Contrast Ratio: ${contrast.toFixed(2)}:1\n`);
      console.log(`   WCAG AA (4.5:1):  ${aa ? '✅ Pass' : '❌ Fail'}`);
      console.log(`   WCAG AAA (7:1):   ${aaa ? '✅ Pass' : '❌ Fail'}\n`);
      
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse();