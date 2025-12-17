#!/usr/bin/env node

/**
 * OpticsThemeBuilder Example Usage
 * 
 * This file demonstrates how to use the library programmatically
 */

const { generatePalette, exportToFigma, exportToJSON, exportToCSS, exportToTailwind, saveToFile, getContrastRatio } = require('./dist/index');
const { converter } = require('culori');

console.log('🎨 OpticsThemeBuilder - Example Usage\n');

// Example 1: Generate a basic palette
console.log('📝 Example 1: Basic Palette Generation');
console.log('─'.repeat(50));

const bluePalette = generatePalette('#3b82f6', 'blue', 16);

console.log(`Generated palette: ${bluePalette.name}`);
console.log(`Base color: ${bluePalette.baseColor.hex}`);
console.log(`Total stops: ${bluePalette.stops.length}`);
console.log(`Generated at: ${bluePalette.metadata.generatedAt}\n`);

// Example 2: Inspect a specific color stop
console.log('📝 Example 2: Inspecting a Color Stop');
console.log('─'.repeat(50));

const stop8 = bluePalette.stops[8];
console.log(`Stop 8: ${stop8.background.hex}`);
console.log(`  HSL: hsl(${Math.round(stop8.background.hsl.h)}, ${Math.round(stop8.background.hsl.s * 100)}%, ${Math.round(stop8.background.hsl.l * 100)}%)`);
console.log(`  RGB: rgb(${Math.round(stop8.background.rgb.r * 255)}, ${Math.round(stop8.background.rgb.g * 255)}, ${Math.round(stop8.background.rgb.b * 255)})`);
console.log(`\n  Light Foreground: ${stop8.foregrounds.light.hex}`);
console.log(`    Contrast: ${stop8.foregrounds.light.contrast.toFixed(2)}:1`);
console.log(`    WCAG AA: ${stop8.foregrounds.light.wcagAA ? '✅ Pass' : '❌ Fail'}`);
console.log(`    WCAG AAA: ${stop8.foregrounds.light.wcagAAA ? '✅ Pass' : '❌ Fail'}`);
console.log(`\n  Dark Foreground: ${stop8.foregrounds.dark.hex}`);
console.log(`    Contrast: ${stop8.foregrounds.dark.contrast.toFixed(2)}:1`);
console.log(`    WCAG AA: ${stop8.foregrounds.dark.wcagAA ? '✅ Pass' : '❌ Fail'}`);
console.log(`    WCAG AAA: ${stop8.foregrounds.dark.wcagAAA ? '✅ Pass' : '❌ Fail'}`);
console.log(`\n  Recommended: ${stop8.recommendedForeground}\n`);

// Example 3: Generate multiple themed palettes
console.log('📝 Example 3: Multiple Themed Palettes');
console.log('─'.repeat(50));

const themes = [
  { color: '#3b82f6', name: 'primary' },
  { color: '#10b981', name: 'success' },
  { color: '#ef4444', name: 'error' },
  { color: '#f59e0b', name: 'warning' },
  { color: '#8b5cf6', name: 'accent' },
];

themes.forEach(theme => {
  const palette = generatePalette(theme.color, theme.name, 16);
  console.log(`${theme.name.padEnd(10)} - ${palette.baseColor.hex} → ${palette.stops.length} stops`);
});
console.log();

// Example 4: Export to different formats
console.log('📝 Example 4: Exporting to Different Formats');
console.log('─'.repeat(50));

const redPalette = generatePalette('#ef4444', 'red', 16);

// Export to JSON
const jsonOutput = exportToJSON(redPalette);
console.log('JSON export (first 200 chars):');
console.log(jsonOutput.substring(0, 200) + '...\n');

// Export to Figma
const figmaOutput = exportToFigma(redPalette);
console.log(`Figma export: ${figmaOutput.variables.length} variables created`);
console.log(`Collections: ${figmaOutput.collections[0].name}\n`);

// Export to CSS
const cssOutput = exportToCSS(redPalette);
console.log('CSS export (first 300 chars):');
console.log(cssOutput.substring(0, 300) + '...\n');

// Export to Tailwind
const tailwindOutput = exportToTailwind(redPalette);
console.log('Tailwind export:');
console.log(tailwindOutput.substring(0, 200) + '...\n');

// Example 5: Using HSL input
console.log('📝 Example 5: Using HSL Input');
console.log('─'.repeat(50));

const hslPalette = generatePalette('hsl(280, 70%, 50%)', 'purple', 12);
console.log(`Generated from HSL: ${hslPalette.baseColor.hex}`);
console.log(`Stops created: ${hslPalette.stops.length}\n`);

// Example 6: Contrast checking
console.log('📝 Example 6: Manual Contrast Checking');
console.log('─'.repeat(50));

const toRgb = converter('rgb');

const testCombinations = [
  { bg: '#3b82f6', fg: '#ffffff', desc: 'Blue + White' },
  { bg: '#0056e1', fg: '#ffffff', desc: 'Dark Blue + White' },
  { bg: '#ffffff', fg: '#000000', desc: 'White + Black' },
  { bg: '#f59e0b', fg: '#ffffff', desc: 'Orange + White' },
];

testCombinations.forEach(combo => {
  const bgRgb = toRgb(combo.bg);
  const fgRgb = toRgb(combo.fg);
  const ratio = getContrastRatio(bgRgb, fgRgb);
  const pass = ratio >= 4.5 ? '✅' : '❌';
  
  console.log(`${combo.desc.padEnd(20)} → ${ratio.toFixed(2)}:1 ${pass}`);
});
console.log();

// Example 7: Accessibility summary
console.log('📝 Example 7: Accessibility Summary for a Palette');
console.log('─'.repeat(50));

const palette = generatePalette('#10b981', 'green', 16);

let aaCompliantLight = 0;
let aaCompliantDark = 0;
let aaaCompliantLight = 0;
let aaaCompliantDark = 0;

palette.stops.forEach(stop => {
  if (stop.foregrounds.light.wcagAA) aaCompliantLight++;
  if (stop.foregrounds.dark.wcagAA) aaCompliantDark++;
  if (stop.foregrounds.light.wcagAAA) aaaCompliantLight++;
  if (stop.foregrounds.dark.wcagAAA) aaaCompliantDark++;
});

console.log(`Palette: ${palette.name} (${palette.baseColor.hex})`);
console.log(`Total stops: ${palette.stops.length}`);
console.log(`\nWCAG AA Compliance:`);
console.log(`  Light foregrounds: ${aaCompliantLight}/${palette.stops.length} (${Math.round(aaCompliantLight/palette.stops.length*100)}%)`);
console.log(`  Dark foregrounds:  ${aaCompliantDark}/${palette.stops.length} (${Math.round(aaCompliantDark/palette.stops.length*100)}%)`);
console.log(`\nWCAG AAA Compliance:`);
console.log(`  Light foregrounds: ${aaaCompliantLight}/${palette.stops.length} (${Math.round(aaaCompliantLight/palette.stops.length*100)}%)`);
console.log(`  Dark foregrounds:  ${aaaCompliantDark}/${palette.stops.length} (${Math.round(aaaCompliantDark/palette.stops.length*100)}%)`);
console.log();

// Example 8: Save to files
console.log('📝 Example 8: Saving to Files');
console.log('─'.repeat(50));

const savePalette = generatePalette('#8b5cf6', 'violet', 16);

// Save individual formats
saveToFile(exportToJSON(savePalette), './examples/violet.json');
saveToFile(exportToCSS(savePalette), './examples/violet.css');
saveToFile(JSON.stringify(exportToFigma(savePalette), null, 2), './examples/violet-figma.json');
saveToFile(exportToTailwind(savePalette), './examples/violet-tailwind.js');

console.log('✅ Saved violet palette to ./examples/');
console.log('   - violet.json');
console.log('   - violet.css');
console.log('   - violet-figma.json');
console.log('   - violet-tailwind.js');
console.log();

console.log('✨ Examples complete! Check the ./examples directory for output files.\n');