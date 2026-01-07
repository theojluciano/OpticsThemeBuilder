// Main entry point for OpticsThemeBuilder

// Core generators
export { generatePalette, parseHSLInput } from './generator';
export { generateOpticsPalette } from './optics-generator';

// Contrast utilities
export { 
  getContrastRatio, 
  getRelativeLuminance, 
  meetsWCAG_AA, 
  meetsWCAG_AAA,
  getContrastLabel 
} from './contrast';

// Standard exporters
export { 
  exportToFigma, 
  exportContrastReport,
  exportAll,
} from './exporter';

// Optics exporters
export {
  exportOpticsToFigma,
  exportOpticsContrastReport,
  exportOpticsAll,
} from './optics-exporter';

// Color utilities
export {
  parseColor,
  toHSLColor,
  toRGBColor,
  createHsl,
  hslToRgb,
  rgbToHsl
} from './color-utils';

// File utilities
export {
  saveToFile,
  saveJsonToFile,
  ensureDirectory,
} from './file-utils';

// Figma utilities
export {
  hexToFigmaColor,
  rgbToFigmaColor,
  createFigmaExtensions,
  createColorToken,
  generateVariableId,
  createRootExtensions,
} from './figma-utils';

// Contrast report utilities
export {
  generateReportHeader,
  generateFailuresSummary,
  generateContrastEntry,
  generateStandardsFooter,
  passesWCAG_AA,
  getWCAGLevel,
} from './contrast-report-utils';

// Console utilities
export {
  printHeader,
  printSuccess,
  printError,
  printInfo,
  printTip,
  printFileExport,
  printPaletteSummary,
  printBaseColorInfo,
  printContrastAnalysisHeader,
  printSampleContrastHeader,
  printExportHeader,
  printCompletion,
  printFigmaInstructions,
  printContrastLine,
  printOpticsContrastSample,
  printAnalysisResult,
} from './console-utils';

// Types
export * from './types';