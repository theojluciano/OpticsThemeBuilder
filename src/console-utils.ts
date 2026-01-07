/**
 * Shared utilities for console output formatting
 */

/**
 * Print a section header
 */
export function printHeader(text: string): void {
  console.log(`\n${text}\n`);
}

/**
 * Print a success message
 */
export function printSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

/**
 * Print an error message
 */
export function printError(message: string): void {
  console.error(`❌ Error: ${message}`);
}

/**
 * Print an info message with indentation
 */
export function printInfo(message: string, indent: number = 0): void {
  const spaces = ' '.repeat(indent);
  console.log(`${spaces}${message}`);
}

/**
 * Print a tip message
 */
export function printTip(message: string): void {
  console.log(`💡 Tip: ${message}`);
}

/**
 * Print a file export message
 */
export function printFileExport(label: string, filename: string): void {
  console.log(`   ✓ ${label}: ${filename}`);
}

/**
 * Print palette generation summary
 */
export function printPaletteSummary(
  color: string,
  name: string,
  stopsOrFormat: string | number
): void {
  console.log('🎨 OpticsThemeBuilder\n');
  console.log(`Generating palette from color: ${color}`);
  console.log(`Palette name: ${name}`);
  console.log(`${typeof stopsOrFormat === 'number' ? 'Stops' : 'Format'}: ${stopsOrFormat}\n`);
}

/**
 * Print base color information
 */
export function printBaseColorInfo(
  stopsCount: number,
  baseColorHex: string,
  h?: number,
  s?: number,
  l?: number
): void {
  console.log(`✅ Generated ${stopsCount} color stops`);
  
  if (h !== undefined && s !== undefined && l !== undefined) {
    console.log(`   Base color: ${baseColorHex}`);
    console.log(`   H: ${Math.round(h)}° S: ${Math.round(s)}% L: ${Math.round(l)}%\n`);
  } else {
    console.log(`   Base color: ${baseColorHex}\n`);
  }
}

/**
 * Print a contrast analysis header
 */
export function printContrastAnalysisHeader(): void {
  console.log('📊 Contrast Analysis:');
}

/**
 * Print a sample contrast analysis header
 */
export function printSampleContrastHeader(): void {
  console.log('📊 Contrast Analysis (sample):');
}

/**
 * Print export section header
 */
export function printExportHeader(): void {
  console.log('\n📦 Exporting Figma files...');
}

/**
 * Print completion message
 */
export function printCompletion(format?: string): void {
  const formatText = format ? ` ${format}` : '';
  console.log(`\n✨ Done! Your${formatText} palette is ready.\n`);
}

/**
 * Print Figma import instructions
 */
export function printFigmaInstructions(hasMultipleModes: boolean = false): void {
  if (hasMultipleModes) {
    printTip('Import each .tokens.json file into Figma Variables panel');
    printInfo('1. Open Figma → Variables panel', 3);
    printInfo('2. Import Light mode file, then Dark mode file', 3);
    printInfo('3. Figma will automatically create a variable collection with both modes', 3);
  } else {
    printTip('Import the .json file into Figma Variables panel');
  }
}

/**
 * Print a standard contrast analysis line
 */
export function printContrastLine(
  stop: number | string,
  bgHex: string,
  recommended: string,
  lightMark: string,
  lightRatio: number,
  darkMark: string,
  darkRatio: number
): void {
  const stopStr = typeof stop === 'number' ? String(stop).padStart(2) : stop.padEnd(12);
  console.log(
    `   Stop ${stopStr}: ${bgHex} → ${recommended} ` +
    `(L:${lightMark} ${lightRatio.toFixed(1)} D:${darkMark} ${darkRatio.toFixed(1)})`
  );
}

/**
 * Print an Optics contrast sample line
 */
export function printOpticsContrastSample(
  name: string,
  mode: 'light' | 'dark',
  bgHex: string,
  onRatio: number,
  onAltRatio: number
): void {
  const padding = mode === 'light' ? 12 : 12;
  const modeLabel = mode === 'light' ? 'Light' : 'Dark ';
  console.log(
    `   ${name.padEnd(padding)}: ${modeLabel} ${bgHex} → ` +
    `on:${onRatio.toFixed(1)} alt:${onAltRatio.toFixed(1)}`
  );
}

/**
 * Print analysis result for a color combination
 */
export function printAnalysisResult(
  bgHex: string,
  fgHex: string,
  contrast: number,
  aa: boolean,
  aaa: boolean
): void {
  console.log('\n🔍 Contrast Analysis\n');
  console.log(`   Background: ${bgHex}`);
  console.log(`   Foreground: ${fgHex}`);
  console.log(`   Contrast Ratio: ${contrast.toFixed(2)}:1\n`);
  console.log(`   WCAG AA (4.5:1):  ${aa ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   WCAG AAA (7:1):   ${aaa ? '✅ Pass' : '❌ Fail'}\n`);
}