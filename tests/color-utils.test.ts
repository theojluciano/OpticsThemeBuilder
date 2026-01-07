import {
  parseColor,
  toHSLColor,
  toRGBColor,
  hslToRgb,
  rgbToHsl,
  createHsl,
} from '../src/color-utils';
import { HSLColor } from '../src/types';

describe('color-utils', () => {
  describe('parseColor', () => {
    it('should parse hex color', () => {
      const result = parseColor('#3b82f6');
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeDefined();
      expect(result.s).toBeDefined();
      expect(result.l).toBeDefined();
    });

    it('should parse rgb color string', () => {
      const result = parseColor('rgb(59, 130, 246)');
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeDefined();
      expect(result.s).toBeDefined();
      expect(result.l).toBeDefined();
    });

    it('should parse hsl color string', () => {
      const result = parseColor('hsl(217, 91%, 60%)');
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeCloseTo(217, 0);
      expect(result.s).toBeCloseTo(0.91, 2);
      expect(result.l).toBeCloseTo(0.60, 2);
    });

    it('should parse HSL object', () => {
      // Note: parseColor passes HSLColor values directly to culori
      // HSLColor type uses percentages but parseColor expects 0-1 range when passed as object
      const input: HSLColor = { h: 217, s: 0.91, l: 0.60 };
      const result = parseColor(input);
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeCloseTo(217, 0);
      expect(result.s).toBeCloseTo(0.91, 2);
      expect(result.l).toBeCloseTo(0.60, 2);
    });

    it('should parse named colors', () => {
      const result = parseColor('red');
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeDefined();
      expect(result.s).toBeDefined();
      expect(result.l).toBeDefined();
    });

    it('should throw error for invalid color', () => {
      expect(() => parseColor('not-a-color')).toThrow();
    });

    it('should handle HSL object with NaN values', () => {
      // culori handles NaN by converting to valid values
      const invalid = { h: NaN, s: NaN, l: NaN };
      const result = parseColor(invalid);
      expect(result).toBeDefined();
      expect(result.mode).toBe('hsl');
    });
  });

  describe('toHSLColor', () => {
    it('should convert culori HSL to HSLColor type', () => {
      const culoriHsl = { mode: 'hsl' as const, h: 217, s: 0.91, l: 0.60 };
      const result = toHSLColor(culoriHsl);
      expect(result).toEqual({ h: 217, s: 0.91, l: 0.60 });
    });

    it('should handle undefined hue', () => {
      const culoriHsl: any = { mode: 'hsl' as const, h: undefined, s: 0.5, l: 0.5 };
      const result = toHSLColor(culoriHsl);
      expect(result).toEqual({ h: 0, s: 0.5, l: 0.5 });
    });

    it('should handle undefined saturation', () => {
      const culoriHsl: any = { mode: 'hsl' as const, h: 217, s: undefined, l: 0.5 };
      const result = toHSLColor(culoriHsl);
      expect(result).toEqual({ h: 217, s: 0, l: 0.5 });
    });

    it('should handle undefined lightness', () => {
      const culoriHsl: any = { mode: 'hsl' as const, h: 217, s: 0.5, l: undefined };
      const result = toHSLColor(culoriHsl);
      expect(result).toEqual({ h: 217, s: 0.5, l: 0 });
    });
  });

  describe('toRGBColor', () => {
    it('should convert culori RGB to RGBColor type', () => {
      const culoriRgb = { mode: 'rgb' as const, r: 0.5, g: 0.6, b: 0.7 };
      const result = toRGBColor(culoriRgb);
      expect(result).toEqual({ r: 0.5, g: 0.6, b: 0.7 });
    });

    it('should handle zero values', () => {
      const culoriRgb = { mode: 'rgb' as const, r: 0, g: 0, b: 0 };
      const result = toRGBColor(culoriRgb);
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle max values', () => {
      const culoriRgb = { mode: 'rgb' as const, r: 1, g: 1, b: 1 };
      const result = toRGBColor(culoriRgb);
      expect(result).toEqual({ r: 1, g: 1, b: 1 });
    });
  });

  describe('createHsl', () => {
    it('should create HSL color from percentage values', () => {
      const result = createHsl(217, 91, 60);
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeCloseTo(217, 0);
      expect(result.s).toBeCloseTo(0.91, 2);
      expect(result.l).toBeCloseTo(0.60, 2);
    });

    it('should handle zero values', () => {
      const result = createHsl(0, 0, 0);
      expect(result.mode).toBe('hsl');
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBe(0);
    });

    it('should handle max values', () => {
      const result = createHsl(360, 100, 100);
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeCloseTo(360, 0);
      expect(result.s).toBe(1);
      expect(result.l).toBe(1);
    });

    it('should handle decimal hue values', () => {
      const result = createHsl(217.5, 50, 50);
      expect(result.mode).toBe('hsl');
      expect(result.h).toBeCloseTo(217.5, 1);
    });
  });

  describe('hslToRgb', () => {
    it('should convert HSL to RGB', () => {
      const hsl = createHsl(217, 91, 60);
      const rgb = hslToRgb(hsl);
      expect(rgb.mode).toBe('rgb');
      expect(rgb.r).toBeGreaterThanOrEqual(0);
      expect(rgb.r).toBeLessThanOrEqual(1);
      expect(rgb.g).toBeGreaterThanOrEqual(0);
      expect(rgb.g).toBeLessThanOrEqual(1);
      expect(rgb.b).toBeGreaterThanOrEqual(0);
      expect(rgb.b).toBeLessThanOrEqual(1);
    });

    it('should convert white correctly', () => {
      const hsl = createHsl(0, 0, 100);
      const rgb = hslToRgb(hsl);
      expect(rgb.r).toBeCloseTo(1, 2);
      expect(rgb.g).toBeCloseTo(1, 2);
      expect(rgb.b).toBeCloseTo(1, 2);
    });

    it('should convert black correctly', () => {
      const hsl = createHsl(0, 0, 0);
      const rgb = hslToRgb(hsl);
      expect(rgb.r).toBeCloseTo(0, 2);
      expect(rgb.g).toBeCloseTo(0, 2);
      expect(rgb.b).toBeCloseTo(0, 2);
    });

    it('should convert pure red correctly', () => {
      const hsl = createHsl(0, 100, 50);
      const rgb = hslToRgb(hsl);
      expect(rgb.r).toBeCloseTo(1, 2);
      expect(rgb.g).toBeCloseTo(0, 2);
      expect(rgb.b).toBeCloseTo(0, 2);
    });

    it('should convert pure green correctly', () => {
      const hsl = createHsl(120, 100, 50);
      const rgb = hslToRgb(hsl);
      expect(rgb.r).toBeCloseTo(0, 2);
      expect(rgb.g).toBeCloseTo(1, 2);
      expect(rgb.b).toBeCloseTo(0, 2);
    });

    it('should convert pure blue correctly', () => {
      const hsl = createHsl(240, 100, 50);
      const rgb = hslToRgb(hsl);
      expect(rgb.r).toBeCloseTo(0, 2);
      expect(rgb.g).toBeCloseTo(0, 2);
      expect(rgb.b).toBeCloseTo(1, 2);
    });
  });

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL', () => {
      const rgb = { mode: 'rgb' as const, r: 0.23, g: 0.51, b: 0.96 };
      const hsl = rgbToHsl(rgb);
      expect(hsl.mode).toBe('hsl');
      expect(hsl.h).toBeDefined();
      expect(hsl.s).toBeDefined();
      expect(hsl.l).toBeDefined();
    });

    it('should convert white correctly', () => {
      const rgb = { mode: 'rgb' as const, r: 1, g: 1, b: 1 };
      const hsl = rgbToHsl(rgb);
      expect(hsl.l).toBeCloseTo(1, 2);
      expect(hsl.s).toBeCloseTo(0, 2);
    });

    it('should convert black correctly', () => {
      const rgb = { mode: 'rgb' as const, r: 0, g: 0, b: 0 };
      const hsl = rgbToHsl(rgb);
      expect(hsl.l).toBeCloseTo(0, 2);
      expect(hsl.s).toBeCloseTo(0, 2);
    });

    it('should round-trip conversion', () => {
      const originalHsl = createHsl(217, 91, 60);
      const rgb = hslToRgb(originalHsl);
      const resultHsl = rgbToHsl(rgb);
      
      expect(resultHsl.h).toBeCloseTo(originalHsl.h || 0, 0);
      expect(resultHsl.s).toBeCloseTo(originalHsl.s || 0, 2);
      expect(resultHsl.l).toBeCloseTo(originalHsl.l || 0, 2);
    });
  });

  describe('integration tests', () => {
    it('should parse and convert color through full pipeline', () => {
      const color = parseColor('#3b82f6');
      const hslColor = toHSLColor(color);
      const rgb = hslToRgb(color);
      const rgbColor = toRGBColor(rgb);
      
      expect(hslColor.h).toBeDefined();
      expect(hslColor.s).toBeDefined();
      expect(hslColor.l).toBeDefined();
      expect(rgbColor.r).toBeGreaterThanOrEqual(0);
      expect(rgbColor.r).toBeLessThanOrEqual(1);
      expect(rgbColor.g).toBeGreaterThanOrEqual(0);
      expect(rgbColor.g).toBeLessThanOrEqual(1);
      expect(rgbColor.b).toBeGreaterThanOrEqual(0);
      expect(rgbColor.b).toBeLessThanOrEqual(1);
    });

    it('should maintain color accuracy through conversions', () => {
      const hsl = createHsl(180, 50, 50);
      const rgb = hslToRgb(hsl);
      const backToHsl = rgbToHsl(rgb);
      
      expect(backToHsl.h).toBeCloseTo(hsl.h || 0, 0);
      expect(backToHsl.s).toBeCloseTo(hsl.s || 0, 2);
      expect(backToHsl.l).toBeCloseTo(hsl.l || 0, 2);
    });
  });
});