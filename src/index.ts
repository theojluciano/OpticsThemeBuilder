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
  exportToJSON, 
  exportToCSS, 
  exportToTailwind,
  exportToDesignTokens,
  exportAll,
  saveToFile 
} from './exporter';

// Optics scale generator and exporters
export { generateOpticsPalette } from './optics-generator';
export {
  exportOpticsToCSS,
  exportOpticsToJSON,
  exportOpticsToDesignTokens,
  exportOpticsToFigma,
  exportOpticsToTailwind,
  exportOpticsAll
} from './optics-exporter';

export * from './types';