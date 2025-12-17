#!/usr/bin/env node

/**
 * Example: Generate Optics Color Palettes
 * 
 * This demonstrates how to use the Optics scale format, which provides:
 * - 19 semantic stops (plus-max to minus-max)
 * - Light and dark mode values for each stop
 * - "on" and "on-alt" foreground colors
 * - Photography f-stop inspired naming
 */

const {
  generateOpticsPalette,
  exportOpticsToCSS,
  exportOpticsToJSON,
  exportOpticsToFigma,
  exportOpticsToTailwind,
  exportOpticsToDesignTokens,
  exportOpticsAll
} = require('./dist/index.js');

console.log('🎨 Optics Color Palette Generator Examples\n');

// ============================================================================
// Example 1: Generate a Primary Color Palette
// ============================================================================
console.log('📘 Example 1: Primary Color (Blue)');
console.log('=====================================\n');

const primaryPalette = generateOpticsPalette('#3b82f6', 'primary');

console.log(`Generated: ${primaryPalette.name}`);
console.log(`Base Color: ${primaryPalette.baseColor.hex}`);
console.log(`H: ${Math.round(primaryPalette.baseColor.h)}° S: ${Math.round(primaryPalette.baseColor.s)}% L: ${Math.round(primaryPalette.baseColor.l)}%`);
console.log(`Total Stops: ${primaryPalette.stops.length}\n`);

// Display a few key stops
console.log('Key Stops:');
['plus-max', 'plus-one', 'base', 'minus-one', 'minus-max'].forEach(stopName => {
  const stop = primaryPalette.stops.find(s => s.name === stopName);
  if (stop) {
    console.log(`  ${stopName.padEnd(12)}: Light ${stop.background.light.hex} | Dark ${stop.background.dark.hex}`);
  }
});

console.log('\n');

// ============================================================================
// Example 2: Generate Multiple Semantic Colors
// ============================================================================
console.log('🎨 Example 2: Complete Design System Colors');
console.log('=============================================\n');

const colors = {
  primary: '#3b82f6',    // Blue
  success: '#10b981',    // Green
  warning: '#f59e0b',    // Amber
  danger: '#ef4444',     // Red
  neutral: '#6b7280',    // Gray
};

const palettes = {};

Object.entries(colors).forEach(([name, color]) => {
  palettes[name] = generateOpticsPalette(color, name);
  console.log(`✓ ${name.padEnd(10)}: ${color} → ${palettes[name].stops.length} stops`);
});

console.log('\n');

// ============================================================================
// Example 3: Export to Different Formats
// ============================================================================
console.log('📦 Example 3: Export Formats');
console.log('==============================\n');

// CSS with light-dark() function
const css = exportOpticsToCSS(primaryPalette);
console.log('CSS Output (first 400 chars):');
console.log(css.substring(0, 400) + '...\n');

// JSON with full palette data
const json = exportOpticsToJSON(primaryPalette);
const jsonData = JSON.parse(json);
console.log('JSON Structure:');
console.log(`  - Name: ${jsonData.name}`);
console.log(`  - Format: ${jsonData.metadata.format}`);
console.log(`  - Stops: ${jsonData.stops.length}`);
console.log(`  - Each stop includes: background, on, onAlt (light & dark)\n`);

// Design Tokens (W3C format)
const tokens = exportOpticsToDesignTokens(primaryPalette);
console.log('Design Tokens: W3C format for universal compatibility\n');

// Figma Variables with Light/Dark modes
const figma = exportOpticsToFigma(primaryPalette);
const figmaData = JSON.parse(figma);
const collection = Object.values(figmaData.variableCollections)[0];
console.log('Figma Variables:');
console.log(`  - Collection: ${collection.name}`);
console.log(`  - Modes: ${collection.modes.map(m => m.name).join(', ')}`);
console.log(`  - Variables: ${collection.variableIds.length}`);
console.log(`  - Import: Use Figma's Variables panel → Import button\n`);

// ============================================================================
// Example 4: Contrast Analysis
// ============================================================================
console.log('📊 Example 4: Contrast Analysis');
console.log('=================================\n');

const neutralPalette = generateOpticsPalette('#6b7280', 'neutral');

console.log('Sample contrast ratios for neutral palette:\n');
console.log('Stop Name    | Light Mode (bg→on) | Dark Mode (bg→on)');
console.log('-------------|--------------------|-----------------');

['plus-max', 'base', 'minus-max'].forEach(stopName => {
  const stop = neutralPalette.stops.find(s => s.name === stopName);
  if (stop) {
    const lightRatio = stop.lightModeContrast.on.toFixed(2);
    const darkRatio = stop.darkModeContrast.on.toFixed(2);
    const lightPass = stop.lightModeContrast.on >= 4.5 ? '✓' : '✗';
    const darkPass = stop.darkModeContrast.on >= 4.5 ? '✓' : '✗';
    
    console.log(`${stopName.padEnd(12)} | ${lightRatio}:1 ${lightPass.padEnd(13)} | ${darkRatio}:1 ${darkPass}`);
  }
});

console.log('\n');

// ============================================================================
// Example 5: Understanding the Optics Scale
// ============================================================================
console.log('📚 Example 5: Understanding the Optics Scale');
console.log('==============================================\n');

console.log('The Optics scale uses photography f-stop nomenclature:\n');

console.log('PLUS stops (add luminosity - lighter in light mode):');
console.log('  plus-max   → Lightest (100% L in light, 12% L in dark)');
console.log('  plus-eight → Very light');
console.log('  plus-seven → ...');
console.log('  plus-one   → Slightly lighter than base\n');

console.log('BASE stop:');
console.log('  base       → The base color (40% L in light, 38% L in dark)\n');

console.log('MINUS stops (remove luminosity - darker in light mode):');
console.log('  minus-one  → Slightly darker than base');
console.log('  minus-two  → ...');
console.log('  minus-eight→ Very dark');
console.log('  minus-max  → Darkest (0% L in light, 100% L in dark)\n');

console.log('Each stop has 3 colors:');
console.log('  • background: The main color for backgrounds/surfaces');
console.log('  • on:         Primary foreground color (high contrast)');
console.log('  • on-alt:     Alternative foreground color (medium contrast)\n');

// ============================================================================
// Example 6: Programmatic Usage
// ============================================================================
console.log('💻 Example 6: Programmatic Color Access');
console.log('=========================================\n');

const brandPalette = generateOpticsPalette('#8b5cf6', 'brand');

// Access specific stops
const baseStop = brandPalette.stops.find(s => s.name === 'base');
const plusMaxStop = brandPalette.stops.find(s => s.name === 'plus-max');

console.log('Accessing color values programmatically:\n');
console.log(`Base stop (light mode):`);
console.log(`  Background: ${baseStop.background.light.hex}`);
console.log(`  On color:   ${baseStop.on.light.hex}`);
console.log(`  On alt:     ${baseStop.onAlt.light.hex}`);
console.log(`  Contrast:   ${baseStop.lightModeContrast.on.toFixed(2)}:1\n`);

console.log(`Base stop (dark mode):`);
console.log(`  Background: ${baseStop.background.dark.hex}`);
console.log(`  On color:   ${baseStop.on.dark.hex}`);
console.log(`  On alt:     ${baseStop.onAlt.dark.hex}`);
console.log(`  Contrast:   ${baseStop.darkModeContrast.on.toFixed(2)}:1\n`);

// ============================================================================
// Example 7: Save All Formats
// ============================================================================
console.log('💾 Example 7: Save All Formats to Files');
console.log('=========================================\n');

try {
  const files = exportOpticsAll(primaryPalette, './output');
  console.log('Files created:');
  files.forEach(file => {
    console.log(`  ✓ ${file}`);
  });
  console.log('\n');
} catch (error) {
  console.log('Note: Files would be created in ./output directory\n');
}

// ============================================================================
// Summary
// ============================================================================
console.log('✨ Summary');
console.log('==========\n');
console.log('The Optics format provides:');
console.log('  • 19 semantic stops with meaningful names');
console.log('  • Built-in light and dark mode support');
console.log('  • Three colors per stop (bg, on, on-alt)');
console.log('  • Automatic contrast calculation');
console.log('  • CSS with light-dark() function');
console.log('  • Figma Variables with dual modes');
console.log('  • Design Tokens for interoperability\n');

console.log('Usage in CLI:');
console.log('  optics generate "#3b82f6" --name "primary" --optics\n');

console.log('Usage in code:');
console.log('  const palette = generateOpticsPalette("#3b82f6", "primary");');
console.log('  const css = exportOpticsToCSS(palette);\n');

console.log('🎉 All examples complete!\n');