import {
  hexToFigmaColor,
  rgbToFigmaColor,
  createFigmaExtensions,
  createColorToken,
  generateVariableId,
  createRootExtensions,
} from '../src/figma-utils';

describe('figma-utils', () => {
  describe('hexToFigmaColor', () => {
    it('should convert hex color to Figma format', () => {
      const result = hexToFigmaColor('#3b82f6');
      
      expect(result.colorSpace).toBe('srgb');
      expect(result.components).toHaveLength(3);
      expect(result.alpha).toBe(1.0);
      expect(result.hex).toBe('#3B82F6');
    });

    it('should convert hex without # prefix', () => {
      const result = hexToFigmaColor('3b82f6');
      
      expect(result.colorSpace).toBe('srgb');
      expect(result.components).toHaveLength(3);
      expect(result.hex).toBe('3B82F6');
    });

    it('should convert white correctly', () => {
      const result = hexToFigmaColor('#ffffff');
      
      expect(result.components[0]).toBeCloseTo(1, 5);
      expect(result.components[1]).toBeCloseTo(1, 5);
      expect(result.components[2]).toBeCloseTo(1, 5);
    });

    it('should convert black correctly', () => {
      const result = hexToFigmaColor('#000000');
      
      expect(result.components[0]).toBeCloseTo(0, 5);
      expect(result.components[1]).toBeCloseTo(0, 5);
      expect(result.components[2]).toBeCloseTo(0, 5);
    });

    it('should uppercase the hex value', () => {
      const result = hexToFigmaColor('#abcdef');
      expect(result.hex).toBe('#ABCDEF');
    });

    it('should normalize components to 0-1 range', () => {
      const result = hexToFigmaColor('#ff8000'); // Orange
      
      expect(result.components[0]).toBeGreaterThanOrEqual(0);
      expect(result.components[0]).toBeLessThanOrEqual(1);
      expect(result.components[1]).toBeGreaterThanOrEqual(0);
      expect(result.components[1]).toBeLessThanOrEqual(1);
      expect(result.components[2]).toBeGreaterThanOrEqual(0);
      expect(result.components[2]).toBeLessThanOrEqual(1);
    });

    it('should convert RGB values correctly', () => {
      const result = hexToFigmaColor('#3b82f6'); // RGB(59, 130, 246)
      
      expect(result.components[0]).toBeCloseTo(59 / 255, 5);
      expect(result.components[1]).toBeCloseTo(130 / 255, 5);
      expect(result.components[2]).toBeCloseTo(246 / 255, 5);
    });
  });

  describe('rgbToFigmaColor', () => {
    it('should convert RGB object to Figma format', () => {
      const rgb = { r: 0.23, g: 0.51, b: 0.96 };
      const hex = '#3b82f6';
      const result = rgbToFigmaColor(rgb, hex);
      
      expect(result.colorSpace).toBe('srgb');
      expect(result.components).toEqual([0.23, 0.51, 0.96]);
      expect(result.alpha).toBe(1.0);
      expect(result.hex).toBe(hex);
    });

    it('should handle black', () => {
      const rgb = { r: 0, g: 0, b: 0 };
      const hex = '#000000';
      const result = rgbToFigmaColor(rgb, hex);
      
      expect(result.components).toEqual([0, 0, 0]);
    });

    it('should handle white', () => {
      const rgb = { r: 1, g: 1, b: 1 };
      const hex = '#ffffff';
      const result = rgbToFigmaColor(rgb, hex);
      
      expect(result.components).toEqual([1, 1, 1]);
    });

    it('should preserve hex value', () => {
      const rgb = { r: 0.5, g: 0.5, b: 0.5 };
      const hex = '#CUSTOM';
      const result = rgbToFigmaColor(rgb, hex);
      
      expect(result.hex).toBe('#CUSTOM');
    });
  });

  describe('createFigmaExtensions', () => {
    it('should create basic extensions object', () => {
      const result = createFigmaExtensions('test-id');
      
      expect(result['com.figma.variableId']).toBe('test-id');
      expect(result['com.figma.scopes']).toEqual(['ALL_SCOPES']);
      expect(result['com.figma.codeSyntax']).toBeUndefined();
    });

    it('should include web value when provided', () => {
      const result = createFigmaExtensions('test-id', ['ALL_SCOPES'], '#ffffff');
      
      expect(result['com.figma.variableId']).toBe('test-id');
      expect(result['com.figma.scopes']).toEqual(['ALL_SCOPES']);
      expect(result['com.figma.codeSyntax']).toEqual({
        WEB: '#ffffff',
      });
    });

    it('should handle custom scopes', () => {
      const customScopes = ['TEXT_FILL', 'FRAME_FILL'];
      const result = createFigmaExtensions('test-id', customScopes);
      
      expect(result['com.figma.scopes']).toEqual(customScopes);
    });

    it('should default to ALL_SCOPES when not specified', () => {
      const result = createFigmaExtensions('test-id');
      
      expect(result['com.figma.scopes']).toEqual(['ALL_SCOPES']);
    });

    it('should handle CSS variable in web value', () => {
      const result = createFigmaExtensions(
        'test-id',
        ['ALL_SCOPES'],
        'var(--color-primary)'
      );
      
      expect(result['com.figma.codeSyntax'].WEB).toBe('var(--color-primary)');
    });
  });

  describe('createColorToken', () => {
    it('should create complete color token', () => {
      const result = createColorToken('#3b82f6', 'test-var-id', 'var(--blue)');
      
      expect(result.$type).toBe('color');
      expect(result.$value).toBeDefined();
      expect(result.$value.colorSpace).toBe('srgb');
      expect(result.$value.hex).toBe('#3B82F6');
      expect(result.$extensions).toBeDefined();
      expect(result.$extensions['com.figma.variableId']).toBe('test-var-id');
      expect(result.$extensions['com.figma.codeSyntax'].WEB).toBe('var(--blue)');
    });

    it('should work without web value', () => {
      const result = createColorToken('#ffffff', 'white-var');
      
      expect(result.$type).toBe('color');
      expect(result.$value.hex).toBe('#FFFFFF');
      expect(result.$extensions['com.figma.variableId']).toBe('white-var');
      expect(result.$extensions['com.figma.codeSyntax']).toBeUndefined();
    });

    it('should create valid token structure', () => {
      const result = createColorToken('#000000', 'black-var', '#000');
      
      expect(result).toHaveProperty('$type');
      expect(result).toHaveProperty('$value');
      expect(result).toHaveProperty('$extensions');
      expect(result.$value).toHaveProperty('colorSpace');
      expect(result.$value).toHaveProperty('components');
      expect(result.$value).toHaveProperty('alpha');
      expect(result.$value).toHaveProperty('hex');
    });

    it('should handle different hex formats', () => {
      const result1 = createColorToken('#abc', 'short-hex');
      const result2 = createColorToken('abc', 'no-hash');
      const result3 = createColorToken('#ABCDEF', 'full-hex');
      
      expect(result1.$value.hex).toBeDefined();
      expect(result2.$value.hex).toBeDefined();
      expect(result3.$value.hex).toBe('#ABCDEF');
    });
  });

  describe('generateVariableId', () => {
    it('should generate a valid variable ID', () => {
      const result = generateVariableId();
      
      expect(result).toMatch(/^VariableID:/);
      expect(result.length).toBeGreaterThan(11); // 'VariableID:' + random string
    });

    it('should generate unique IDs', () => {
      const id1 = generateVariableId();
      const id2 = generateVariableId();
      const id3 = generateVariableId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs with consistent format', () => {
      const ids = Array.from({ length: 100 }, () => generateVariableId());
      
      ids.forEach(id => {
        expect(id).toMatch(/^VariableID:[a-z0-9]+$/);
      });
    });

    it('should generate reasonably long IDs', () => {
      const result = generateVariableId();
      const idPart = result.replace('VariableID:', '');
      
      expect(idPart.length).toBeGreaterThan(5);
    });
  });

  describe('createRootExtensions', () => {
    it('should create root extensions with mode name', () => {
      const result = createRootExtensions('Light');
      
      expect(result).toHaveProperty('$extensions');
      expect(result.$extensions['com.figma.modeName']).toBe('Light');
    });

    it('should handle Dark mode', () => {
      const result = createRootExtensions('Dark');
      
      expect(result.$extensions['com.figma.modeName']).toBe('Dark');
    });

    it('should handle custom mode names', () => {
      const result = createRootExtensions('Custom Mode');
      
      expect(result.$extensions['com.figma.modeName']).toBe('Custom Mode');
    });

    it('should have correct structure', () => {
      const result = createRootExtensions('Light');
      
      expect(Object.keys(result)).toEqual(['$extensions']);
      expect(Object.keys(result.$extensions)).toEqual(['com.figma.modeName']);
    });
  });

  describe('integration tests', () => {
    it('should create a complete token with all utilities', () => {
      const hex = '#3b82f6';
      const varId = generateVariableId();
      const token = createColorToken(hex, varId, 'var(--primary)');
      
      expect(token.$type).toBe('color');
      expect(token.$value.hex).toMatch(/^#[0-9A-F]{6}$/);
      expect(token.$extensions['com.figma.variableId']).toMatch(/^VariableID:/);
    });

    it('should create consistent Figma export structure', () => {
      const tokens = {
        primary: createColorToken('#3b82f6', generateVariableId(), 'var(--primary)'),
        secondary: createColorToken('#8b5cf6', generateVariableId(), 'var(--secondary)'),
      };
      
      const root = {
        colors: tokens,
        ...createRootExtensions('Light'),
      };
      
      expect(root).toHaveProperty('colors');
      expect(root).toHaveProperty('$extensions');
      expect(root.colors.primary.$type).toBe('color');
      expect(root.colors.secondary.$type).toBe('color');
    });

    it('should handle hex to Figma color conversion pipeline', () => {
      const hex = '#ff5733';
      const figmaColor = hexToFigmaColor(hex);
      const rgb = {
        r: figmaColor.components[0],
        g: figmaColor.components[1],
        b: figmaColor.components[2],
      };
      const figmaColor2 = rgbToFigmaColor(rgb, hex);
      
      expect(figmaColor.components).toEqual(figmaColor2.components);
      expect(figmaColor.hex.toLowerCase()).toBe(figmaColor2.hex.toLowerCase());
    });
  });
});