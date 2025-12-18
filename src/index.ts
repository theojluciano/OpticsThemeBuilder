// Main entry point for OpticsThemeBuilder

export { generatePalette, parseHSLInput } from './generator';
export { 
  getContrastRatio, 
  getRelativeLuminance, 
  meetsWCAG_AA, 
  meetsWCAG_AAA,
  getContrastLabel 
} from './contrast';
export { 
  exportToFigma, 
  exportContrastReport,
  exportAll,
  saveToFile 
} from './exporter';

// Optics scale generator and exporters
export { generateOpticsPalette } from './optics-generator';
export {
  exportOpticsToFigma,
  exportOpticsContrastReport,
  exportOpticsAll,
  saveOpticsToFile
} from './optics-exporter';

// Shared color utilities
export {
  parseColor,
  toHSLColor,
  toRGBColor,
  createHsl,
  hslToRgb,
  rgbToHsl
} from './color-utils';

export * from './types';