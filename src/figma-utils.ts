/**
 * Shared utilities for Figma Variables Import format
 */

/**
 * Convert hex color to Figma color value format
 */
export function hexToFigmaColor(hex: string): {
  colorSpace: string;
  components: number[];
  alpha: number;
  hex: string;
} {
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
    hex: hex.toUpperCase(),
  };
}

/**
 * Convert RGB components to Figma color value format
 */
export function rgbToFigmaColor(rgb: { r: number; g: number; b: number }, hex: string): {
  colorSpace: string;
  components: number[];
  alpha: number;
  hex: string;
} {
  return {
    colorSpace: 'srgb',
    components: [rgb.r, rgb.g, rgb.b],
    alpha: 1.0,
    hex: hex,
  };
}

/**
 * Create a Figma variable extension object
 */
export function createFigmaExtensions(
  variableId: string,
  scopes: string[] = ['ALL_SCOPES'],
  webValue?: string
): any {
  const extensions: any = {
    'com.figma.variableId': variableId,
    'com.figma.scopes': scopes,
  };
  
  if (webValue) {
    extensions['com.figma.codeSyntax'] = {
      WEB: webValue,
    };
  }
  
  return extensions;
}

/**
 * Create a Figma color token
 */
export function createColorToken(
  hex: string,
  variableId: string,
  webValue?: string
): any {
  return {
    $type: 'color',
    $value: hexToFigmaColor(hex),
    $extensions: createFigmaExtensions(variableId, ['ALL_SCOPES'], webValue),
  };
}

/**
 * Generate a random Figma variable ID
 */
export function generateVariableId(): string {
  return `VariableID:${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create root-level extensions for a Figma export
 */
export function createRootExtensions(modeName: string): any {
  return {
    $extensions: {
      'com.figma.modeName': modeName,
    },
  };
}