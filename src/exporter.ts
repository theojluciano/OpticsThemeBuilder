import { ColorPalette, FigmaVariable } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Export palette to Figma Variables Import format
 * Matches the exact structure Figma expects for native Variables import
 */
export function exportToFigma(palette: ColorPalette, mode: string = 'Light'): any {
  const root: any = {};
  
  // Helper to convert RGB to components array for Figma
  const rgbToComponents = (rgb: { r: number; g: number; b: number }) => [
    rgb.r,
    rgb.g,
    rgb.b,
  ];
  
  // Helper to create color value object
  const createColorValue = (hex: string, rgb: { r: number; g: number; b: number }) => ({
    colorSpace: 'srgb',
    components: rgbToComponents(rgb),
    alpha: 1,
    hex: hex,
  });
  
  // Create nested structure for palette
  const paletteGroup: any = {};
  
  // Add background colors
  palette.stops.forEach((stop) => {
    paletteGroup[stop.stop] = {
      $type: 'color',
      $value: createColorValue(stop.background.hex, stop.background.rgb),
      $extensions: {
        'com.figma.variableId': `VariableID:${Math.random().toString(36).substring(2, 15)}`,
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
      $value: createColorValue(stop.foregrounds.light.hex, stop.foregrounds.light.rgb),
      $extensions: {
        'com.figma.variableId': `VariableID:${Math.random().toString(36).substring(2, 15)}`,
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
      $value: createColorValue(stop.foregrounds.dark.hex, stop.foregrounds.dark.rgb),
      $extensions: {
        'com.figma.variableId': `VariableID:${Math.random().toString(36).substring(2, 15)}`,
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
  
  // Add root-level extensions
  root.$extensions = {
    'com.figma.modeName': mode,
  };
  
  return root;
}

/**
 * Export palette to standard JSON format
 */
export function exportToJSON(palette: ColorPalette): string {
  return JSON.stringify(palette, null, 2);
}

/**
 * Export palette to CSS custom properties
 */
export function exportToCSS(palette: ColorPalette): string {
  let css = `:root {\n`;
  css += `  /* ${palette.name} - Generated from ${palette.baseColor.hex} */\n\n`;
  
  palette.stops.forEach((stop) => {
    css += `  /* Stop ${stop.stop} - ${stop.background.hex} */\n`;
    css += `  --${palette.name}-${stop.stop}: ${stop.background.hex};\n`;
    css += `  --${palette.name}-${stop.stop}-rgb: ${Math.round(stop.background.rgb.r * 255)}, ${Math.round(stop.background.rgb.g * 255)}, ${Math.round(stop.background.rgb.b * 255)};\n`;
    css += `  --${palette.name}-${stop.stop}-hsl: ${Math.round(stop.background.hsl.h)}, ${Math.round(stop.background.hsl.s * 100)}%, ${Math.round(stop.background.hsl.l * 100)}%;\n`;
    css += `  --${palette.name}-${stop.stop}-fg-light: ${stop.foregrounds.light.hex};\n`;
    css += `  --${palette.name}-${stop.stop}-fg-dark: ${stop.foregrounds.dark.hex};\n`;
    css += `  --${palette.name}-${stop.stop}-fg: ${stop.recommendedForeground === 'light' ? stop.foregrounds.light.hex : stop.foregrounds.dark.hex};\n`;
    css += `\n`;
  });
  
  css += `}\n`;
  return css;
}

/**
 * Export palette to Tailwind CSS configuration
 */
export function exportToTailwind(palette: ColorPalette): string {
  let config = `// Tailwind color configuration for ${palette.name}\n`;
  config += `// Add this to your tailwind.config.js colors object\n\n`;
  config += `'${palette.name}': {\n`;
  
  palette.stops.forEach((stop) => {
    config += `  ${stop.stop}: '${stop.background.hex}',\n`;
  });
  
  config += `},\n`;
  return config;
}

/**
 * Export palette to W3C Design Tokens format
 * This is compatible with many design token tools and plugins
 */
export function exportToDesignTokens(palette: ColorPalette): any {
  const tokens: any = {
    [palette.name]: {
      $type: 'color',
      $description: `Color palette generated from ${palette.baseColor.hex}`,
    },
  };
  
  // Add background colors
  palette.stops.forEach((stop) => {
    tokens[palette.name][stop.stop] = {
      $value: stop.background.hex,
      $type: 'color',
      $description: `Background color - Stop ${stop.stop}`,
      $extensions: {
        'com.opticsthemebuilder': {
          hsl: `hsl(${Math.round(stop.background.hsl.h)}, ${Math.round(stop.background.hsl.s * 100)}%, ${Math.round(stop.background.hsl.l * 100)}%)`,
          rgb: `rgb(${Math.round(stop.background.rgb.r * 255)}, ${Math.round(stop.background.rgb.g * 255)}, ${Math.round(stop.background.rgb.b * 255)})`,
          recommendedForeground: stop.recommendedForeground,
          lightContrast: stop.foregrounds.light.contrast.toFixed(2),
          darkContrast: stop.foregrounds.dark.contrast.toFixed(2),
          wcagAA: stop.foregrounds[stop.recommendedForeground].wcagAA,
          wcagAAA: stop.foregrounds[stop.recommendedForeground].wcagAAA,
        },
      },
    };
  });
  
  // Add foreground colors as a separate group
  tokens[`${palette.name}-foregrounds`] = {
    $type: 'color',
    $description: 'Foreground colors for accessibility',
  };
  
  palette.stops.forEach((stop) => {
    tokens[`${palette.name}-foregrounds`][`${stop.stop}-light`] = {
      $value: stop.foregrounds.light.hex,
      $type: 'color',
      $description: `Light foreground for ${palette.name}/${stop.stop} (contrast: ${stop.foregrounds.light.contrast.toFixed(2)}:1, WCAG AA: ${stop.foregrounds.light.wcagAA ? 'Pass' : 'Fail'})`,
    };
    
    tokens[`${palette.name}-foregrounds`][`${stop.stop}-dark`] = {
      $value: stop.foregrounds.dark.hex,
      $type: 'color',
      $description: `Dark foreground for ${palette.name}/${stop.stop} (contrast: ${stop.foregrounds.dark.contrast.toFixed(2)}:1, WCAG AA: ${stop.foregrounds.dark.wcagAA ? 'Pass' : 'Fail'})`,
    };
    
    // Add recommended foreground for convenience
    tokens[`${palette.name}-foregrounds`][`${stop.stop}-recommended`] = {
      $value: stop.foregrounds[stop.recommendedForeground].hex,
      $type: 'color',
      $description: `Recommended foreground (${stop.recommendedForeground}) for ${palette.name}/${stop.stop}`,
    };
  });
  
  return tokens;
}

/**
 * Save palette to file
 */
export function saveToFile(content: string, filepath: string): void {
  const dir = path.dirname(filepath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Generate all export formats and save to files
 */
export function exportAll(palette: ColorPalette, outputDir: string): {
  figma: string;
  designTokens: string;
  json: string;
  css: string;
  tailwind: string;
} {
  const figmaPath = path.join(outputDir, `${palette.name}-figma.json`);
  const designTokensPath = path.join(outputDir, `${palette.name}-design-tokens.json`);
  const jsonPath = path.join(outputDir, `${palette.name}.json`);
  const cssPath = path.join(outputDir, `${palette.name}.css`);
  const tailwindPath = path.join(outputDir, `${palette.name}-tailwind.js`);
  
  const figmaContent = JSON.stringify(exportToFigma(palette), null, 2);
  const designTokensContent = JSON.stringify(exportToDesignTokens(palette), null, 2);
  const jsonContent = exportToJSON(palette);
  const cssContent = exportToCSS(palette);
  const tailwindContent = exportToTailwind(palette);
  
  saveToFile(figmaContent, figmaPath);
  saveToFile(designTokensContent, designTokensPath);
  saveToFile(jsonContent, jsonPath);
  saveToFile(cssContent, cssPath);
  saveToFile(tailwindContent, tailwindPath);
  
  return {
    figma: figmaPath,
    designTokens: designTokensPath,
    json: jsonPath,
    css: cssPath,
    tailwind: tailwindPath,
  };
}