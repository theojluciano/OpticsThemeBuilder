import { OpticsPalette } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Convert hex color to Figma color value format
 */
function hexToFigmaColor(hex: string): any {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert to 0-1 range
  return {
    colorSpace: 'srgb',
    components: [r / 255, g / 255, b / 255],
    alpha: 1.0,
    hex: hex.toUpperCase()
  };
}

/**
 * Export Optics palette to Figma Variables Import format
 * Matches the Design Tokens format that Figma's Variables plugin expects
 * Structure matches Figma's format with nested groups for plus/minus stops
 * @param palette The Optics palette to export
 * @param mode The mode to export: 'Light' or 'Dark'
 */
export function exportOpticsToFigma(palette: OpticsPalette, mode: 'Light' | 'Dark' = 'Light'): string {
  const isLightMode = mode === 'Light';
  const collectionName = 'op-color';
  
  // Build tokens with nested structure matching Figma's format
  // Structure: palette/group/stop for background colors
  // and palette/on/group/stop for foreground colors
  const tokens: any = {};
  
  // Initialize palette level
  if (!tokens[palette.name]) {
    tokens[palette.name] = {};
  }
  
  // Process each stop - create nested structure matching Figma
  palette.stops.forEach((stop) => {
    const stopName = stop.name;
    
    // Determine group structure based on stop name
    let groupName: string;
    let stopLevel: string;
    
    if (stopName === 'base') {
      // Base goes directly under palette
      groupName = 'base';
      stopLevel = '';
    } else if (stopName.startsWith('plus-')) {
      groupName = 'plus';
      stopLevel = stopName.replace('plus-', '');
    } else if (stopName.startsWith('minus-')) {
      groupName = 'minus';
      stopLevel = stopName.replace('minus-', '');
    } else {
      // Fallback
      groupName = stopName;
      stopLevel = '';
    }
    
    // Create background color variable
    const bgVariable = {
      $type: 'color',
      $value: hexToFigmaColor(isLightMode ? stop.background.light.hex : stop.background.dark.hex),
      $extensions: {
        'com.figma.variableId': `${palette.name}-${stop.name}-bg`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: `var(--op-color-${palette.name}-${stop.name}-bg)`
        }
      }
    };
    
    // Create on (foreground) variable
    const onVariable = {
      $type: 'color',
      $value: hexToFigmaColor(isLightMode ? stop.on.light.hex : stop.on.dark.hex),
      $extensions: {
        'com.figma.variableId': `${palette.name}-${stop.name}-on`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: `var(--op-color-${palette.name}-${stop.name}-on)`
        }
      }
    };
    
    // Create on-alt variable
    const onAltVariable = {
      $type: 'color',
      $value: hexToFigmaColor(isLightMode ? stop.onAlt.light.hex : stop.onAlt.dark.hex),
      $extensions: {
        'com.figma.variableId': `${palette.name}-${stop.name}-on-alt`,
        'com.figma.scopes': ['ALL_SCOPES'],
        'com.figma.codeSyntax': {
          WEB: `var(--op-color-${palette.name}-${stop.name}-on-alt)`
        }
      }
    };
    
    // Place background colors in the palette structure
    if (stopLevel === '') {
      // Base case - place directly under palette/base
      if (!tokens[palette.name][groupName]) {
        tokens[palette.name][groupName] = {};
      }
      tokens[palette.name][groupName]['bg'] = bgVariable;
    } else {
      // Nested case - place under palette/group/stop
      if (!tokens[palette.name][groupName]) {
        tokens[palette.name][groupName] = {};
      }
      if (!tokens[palette.name][groupName][stopLevel]) {
        tokens[palette.name][groupName][stopLevel] = {};
      }
      tokens[palette.name][groupName][stopLevel]['bg'] = bgVariable;
    }
    
    // Place foreground colors in the on structure
    if (!tokens[palette.name]['on']) {
      tokens[palette.name]['on'] = {};
    }
    
    if (stopLevel === '') {
      // Base case - place under palette/on/base
      if (!tokens[palette.name]['on'][groupName]) {
        tokens[palette.name]['on'][groupName] = {};
      }
      tokens[palette.name]['on'][groupName]['on'] = onVariable;
      tokens[palette.name]['on'][groupName]['on-alt'] = onAltVariable;
    } else {
      // Nested case - place under palette/on/group/stop
      if (!tokens[palette.name]['on'][groupName]) {
        tokens[palette.name]['on'][groupName] = {};
      }
      if (!tokens[palette.name]['on'][groupName][stopLevel]) {
        tokens[palette.name]['on'][groupName][stopLevel] = {};
      }
      tokens[palette.name]['on'][groupName][stopLevel]['on'] = onVariable;
      tokens[palette.name]['on'][groupName][stopLevel]['on-alt'] = onAltVariable;
    }
  });
  
  // Build the final structure matching actual Figma export format
  const figmaExport = {
    [collectionName]: tokens,
    $extensions: {
      'com.figma.modeName': mode
    }
  };
  
  return JSON.stringify(figmaExport, null, 2);
}

/**
 * Export Optics palette to standard JSON format
 */
export function exportOpticsToJSON(palette: OpticsPalette): string {
  return JSON.stringify(palette, null, 2);
}

/**
 * Export Optics palette to CSS with light-dark() function
 */
export function exportOpticsToCSS(palette: OpticsPalette): string {
  let css = `:root {\n`;
  css += `  /* ${palette.name} Optics Scale - Generated from ${palette.baseColor.hex} */\n`;
  css += `  /* Supports automatic theme switching with light-dark() */\n\n`;
  
  palette.stops.forEach((stop) => {
    css += `  /* ${stop.name} */\n`;
    
    // Background
    css += `  --op-${palette.name}-${stop.name}-bg: light-dark(${stop.background.light.hex}, ${stop.background.dark.hex});\n`;
    
    // On (primary foreground)
    css += `  --op-${palette.name}-${stop.name}-on: light-dark(${stop.on.light.hex}, ${stop.on.dark.hex});\n`;
    
    // On-alt (alternative foreground)
    css += `  --op-${palette.name}-${stop.name}-on-alt: light-dark(${stop.onAlt.light.hex}, ${stop.onAlt.dark.hex});\n`;
    
    css += `\n`;
  });
  
  css += `}\n`;
  return css;
}

/**
 * Export Optics palette to W3C Design Tokens format
 */
export function exportOpticsToDesignTokens(palette: OpticsPalette): any {
  const tokens: any = {
    [palette.name]: {
      $type: 'color',
      $description: `Optics scale palette generated from ${palette.baseColor.hex}`,
    },
  };
  
  palette.stops.forEach((stop) => {
    const stopName = stop.name;
    
    tokens[palette.name][stopName] = {
      background: {
        light: {
          $value: stop.background.light.hex,
          $type: 'color',
          $description: 'Light mode background'
        },
        dark: {
          $value: stop.background.dark.hex,
          $type: 'color',
          $description: 'Dark mode background'
        }
      },
      on: {
        light: {
          $value: stop.on.light.hex,
          $type: 'color',
          $description: `Light mode foreground (contrast: ${stop.lightModeContrast.on.toFixed(2)}:1)`
        },
        dark: {
          $value: stop.on.dark.hex,
          $type: 'color',
          $description: `Dark mode foreground (contrast: ${stop.darkModeContrast.on.toFixed(2)}:1)`
        }
      },
      onAlt: {
        light: {
          $value: stop.onAlt.light.hex,
          $type: 'color',
          $description: `Light mode alternative foreground (contrast: ${stop.lightModeContrast.onAlt.toFixed(2)}:1)`
        },
        dark: {
          $value: stop.onAlt.dark.hex,
          $type: 'color',
          $description: `Dark mode alternative foreground (contrast: ${stop.darkModeContrast.onAlt.toFixed(2)}:1)`
        }
      }
    };
  });
  
  return tokens;
}

/**
 * Export Optics palette to Tailwind CSS configuration
 */
export function exportOpticsToTailwind(palette: OpticsPalette): string {
  let config = `// Tailwind color configuration for Optics ${palette.name}\n`;
  config += `// Add this to your tailwind.config.js colors object\n\n`;
  config += `'${palette.name}': {\n`;
  
  palette.stops.forEach((stop) => {
    // Use light mode colors as defaults for Tailwind
    config += `  '${stop.name}': {\n`;
    config += `    bg: '${stop.background.light.hex}',\n`;
    config += `    on: '${stop.on.light.hex}',\n`;
    config += `    'on-alt': '${stop.onAlt.light.hex}',\n`;
    config += `  },\n`;
  });
  
  config += `},\n`;
  return config;
}

/**
 * Save content to file
 */
export function saveOpticsToFile(content: string, filepath: string): void {
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Generate all Optics export formats and save to files
 */
export function exportOpticsAll(palette: OpticsPalette, outputDir: string): {
  figmaLight: string;
  figmaDark: string;
  designTokens: string;
  json: string;
  css: string;
  tailwind: string;
} {
  const figmaLightPath = path.join(outputDir, `${palette.name}-light.tokens.json`);
  const figmaDarkPath = path.join(outputDir, `${palette.name}-dark.tokens.json`);
  const designTokensPath = path.join(outputDir, `${palette.name}-optics-tokens.json`);
  const jsonPath = path.join(outputDir, `${palette.name}-optics.json`);
  const cssPath = path.join(outputDir, `${palette.name}-optics.css`);
  const tailwindPath = path.join(outputDir, `${palette.name}-optics-tailwind.js`);
  
  const figmaLightContent = exportOpticsToFigma(palette, 'Light');
  const figmaDarkContent = exportOpticsToFigma(palette, 'Dark');
  const designTokensContent = JSON.stringify(exportOpticsToDesignTokens(palette), null, 2);
  const jsonContent = exportOpticsToJSON(palette);
  const cssContent = exportOpticsToCSS(palette);
  const tailwindContent = exportOpticsToTailwind(palette);
  
  saveOpticsToFile(figmaLightContent, figmaLightPath);
  saveOpticsToFile(figmaDarkContent, figmaDarkPath);
  saveOpticsToFile(designTokensContent, designTokensPath);
  saveOpticsToFile(jsonContent, jsonPath);
  saveOpticsToFile(cssContent, cssPath);
  saveOpticsToFile(tailwindContent, tailwindPath);
  
  return {
    figmaLight: figmaLightPath,
    figmaDark: figmaDarkPath,
    designTokens: designTokensPath,
    json: jsonPath,
    css: cssPath,
    tailwind: tailwindPath,
  };
}