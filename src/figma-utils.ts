/**
 * Shared utilities for Figma Variables Import format
 */

/**
 * Figma color value structure
 */
interface FigmaColorValue {
  colorSpace: string;
  components: number[];
  alpha: number;
  hex: string;
}

/**
 * Convert hex color to Figma color value format
 */
export function hexToFigmaColor(hex: string): FigmaColorValue {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert to 0-1 range
  return createFigmaColorValue([r / 255, g / 255, b / 255], hex.toUpperCase());
}

/**
 * Convert RGB components to Figma color value format
 */
export function rgbToFigmaColor(rgb: { r: number; g: number; b: number }, hex: string): FigmaColorValue {
  return createFigmaColorValue([rgb.r, rgb.g, rgb.b], hex);
}

/**
 * Create a Figma color value object
 * Unified builder to reduce duplication
 */
function createFigmaColorValue(components: number[], hex: string): FigmaColorValue {
  return {
    colorSpace: 'srgb',
    components,
    alpha: 1.0,
    hex,
  };
}

/**
 * Create a Figma variable extension object
 */
export function createFigmaExtensions(
  variableId: string,
  scopes: string[] = ['ALL_SCOPES'],
  webValue?: string
): Record<string, any> {
  const extensions: Record<string, any> = {
    'com.figma.variableId': variableId,
    'com.figma.scopes': scopes,
  };
  
  if (webValue) {
    extensions['com.figma.codeSyntax'] = { WEB: webValue };
  }
  
  return extensions;
}

/**
 * Create a Figma color token with all required fields
 */
export function createColorToken(
  hex: string,
  variableId?: string,
  webValue?: string
): Record<string, any> {
  const id = variableId || generateVariableId();
  
  return {
    $type: 'color',
    $value: hexToFigmaColor(hex),
    $extensions: createFigmaExtensions(id, ['ALL_SCOPES'], webValue),
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
export function createRootExtensions(modeName: string): Record<string, any> {
  return {
    $extensions: {
      'com.figma.modeName': modeName,
    },
  };
}