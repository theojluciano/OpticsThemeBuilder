import { generatePalette, parseHSLInput } from '../src/generator';
import { ColorPalette } from '../src/types';

describe('generator', () => {
  describe('generatePalette', () => {
    it('should generate palette from hex color', () => {
      const palette = generatePalette('#3b82f6', 'test-palette', 5);

      expect(palette.name).toBe('test-palette');
      expect(palette.stops).toHaveLength(5);
      expect(palette.baseColor.hex).toBeDefined();
      expect(palette.metadata.totalStops).toBe(5);
    });

    it('should generate palette from HSL string', () => {
      const palette = generatePalette('hsl(217, 91%, 60%)', 'test-palette', 5);

      expect(palette.name).toBe('test-palette');
      expect(palette.stops).toHaveLength(5);
      expect(palette.baseColor.hsl).toBeDefined();
    });

    it('should generate palette from HSL object', () => {
      const hsl = { h: 217, s: 91, l: 60 };
      const palette = generatePalette(hsl, 'test-palette', 5);

      expect(palette.name).toBe('test-palette');
      expect(palette.stops).toHaveLength(5);
    });

    it('should generate palette from RGB string', () => {
      const palette = generatePalette('rgb(59, 130, 246)', 'test-palette', 5);

      expect(palette.name).toBe('test-palette');
      expect(palette.stops).toHaveLength(5);
    });

    it('should use default name when not provided', () => {
      const palette = generatePalette('#3b82f6');

      expect(palette.name).toBe('palette');
    });

    it('should use default stops (16) when not provided', () => {
      const palette = generatePalette('#3b82f6', 'test');

      expect(palette.stops).toHaveLength(16);
      expect(palette.metadata.totalStops).toBe(16);
    });

    it('should generate correct number of stops', () => {
      const palette3 = generatePalette('#3b82f6', 'test', 3);
      const palette10 = generatePalette('#3b82f6', 'test', 10);
      const palette20 = generatePalette('#3b82f6', 'test', 20);

      expect(palette3.stops).toHaveLength(3);
      expect(palette10.stops).toHaveLength(10);
      expect(palette20.stops).toHaveLength(20);
    });

    it('should include base color information', () => {
      const palette = generatePalette('#3b82f6', 'test', 5);

      expect(palette.baseColor).toHaveProperty('hsl');
      expect(palette.baseColor).toHaveProperty('rgb');
      expect(palette.baseColor).toHaveProperty('hex');
      expect(palette.baseColor.hsl).toHaveProperty('h');
      expect(palette.baseColor.hsl).toHaveProperty('s');
      expect(palette.baseColor.hsl).toHaveProperty('l');
    });

    it('should include metadata', () => {
      const palette = generatePalette('#3b82f6', 'test', 5);

      expect(palette.metadata).toHaveProperty('generatedAt');
      expect(palette.metadata).toHaveProperty('totalStops');
      expect(palette.metadata.totalStops).toBe(5);
      expect(new Date(palette.metadata.generatedAt)).toBeInstanceOf(Date);
    });

    describe('color stops', () => {
      let palette: ColorPalette;

      beforeEach(() => {
        palette = generatePalette('#3b82f6', 'test', 10);
      });

      it('should generate stops with sequential indices', () => {
        palette.stops.forEach((stop, index) => {
          expect(stop.stop).toBe(index);
        });
      });

      it('should have background colors for all stops', () => {
        palette.stops.forEach((stop) => {
          expect(stop.background).toHaveProperty('hsl');
          expect(stop.background).toHaveProperty('rgb');
          expect(stop.background).toHaveProperty('hex');
          expect(stop.background.hex).toMatch(/^#[0-9a-f]{6}$/i);
        });
      });

      it('should have light foreground for all stops', () => {
        palette.stops.forEach((stop) => {
          expect(stop.foregrounds.light).toHaveProperty('hsl');
          expect(stop.foregrounds.light).toHaveProperty('rgb');
          expect(stop.foregrounds.light).toHaveProperty('hex');
          expect(stop.foregrounds.light).toHaveProperty('contrast');
          expect(stop.foregrounds.light).toHaveProperty('wcagAA');
          expect(stop.foregrounds.light).toHaveProperty('wcagAAA');
        });
      });

      it('should have dark foreground for all stops', () => {
        palette.stops.forEach((stop) => {
          expect(stop.foregrounds.dark).toHaveProperty('hsl');
          expect(stop.foregrounds.dark).toHaveProperty('rgb');
          expect(stop.foregrounds.dark).toHaveProperty('hex');
          expect(stop.foregrounds.dark).toHaveProperty('contrast');
          expect(stop.foregrounds.dark).toHaveProperty('wcagAA');
          expect(stop.foregrounds.dark).toHaveProperty('wcagAAA');
        });
      });

      it('should have recommended foreground', () => {
        palette.stops.forEach((stop) => {
          expect(stop.recommendedForeground).toMatch(/^(light|dark)$/);
        });
      });

      it('should have valid contrast ratios', () => {
        palette.stops.forEach((stop) => {
          expect(stop.foregrounds.light.contrast).toBeGreaterThan(0);
          expect(stop.foregrounds.light.contrast).toBeLessThanOrEqual(21);
          expect(stop.foregrounds.dark.contrast).toBeGreaterThan(0);
          expect(stop.foregrounds.dark.contrast).toBeLessThanOrEqual(21);
        });
      });

      it('should recommend foreground with better contrast', () => {
        palette.stops.forEach((stop) => {
          const lightContrast = stop.foregrounds.light.contrast;
          const darkContrast = stop.foregrounds.dark.contrast;

          if (stop.recommendedForeground === 'light') {
            expect(lightContrast).toBeGreaterThanOrEqual(darkContrast);
          } else {
            expect(darkContrast).toBeGreaterThanOrEqual(lightContrast);
          }
        });
      });

      it('should have RGB values in 0-1 range', () => {
        palette.stops.forEach((stop) => {
          expect(stop.background.rgb.r).toBeGreaterThanOrEqual(0);
          expect(stop.background.rgb.r).toBeLessThanOrEqual(1);
          expect(stop.background.rgb.g).toBeGreaterThanOrEqual(0);
          expect(stop.background.rgb.g).toBeLessThanOrEqual(1);
          expect(stop.background.rgb.b).toBeGreaterThanOrEqual(0);
          expect(stop.background.rgb.b).toBeLessThanOrEqual(1);
        });
      });

      it('should have HSL values in correct ranges', () => {
        palette.stops.forEach((stop) => {
          expect(stop.background.hsl.h).toBeGreaterThanOrEqual(0);
          expect(stop.background.hsl.h).toBeLessThanOrEqual(360);
          expect(stop.background.hsl.s).toBeGreaterThanOrEqual(0);
          expect(stop.background.hsl.s).toBeLessThanOrEqual(1);
          expect(stop.background.hsl.l).toBeGreaterThanOrEqual(0);
          expect(stop.background.hsl.l).toBeLessThanOrEqual(1);
        });
      });
    });

    describe('lightness distribution', () => {
      it('should have first stop lighter than last stop', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        const firstLightness = palette.stops[0].background.hsl.l;
        const lastLightness = palette.stops[palette.stops.length - 1].background.hsl.l;

        expect(firstLightness).toBeGreaterThan(lastLightness);
      });

      it('should distribute lightness across the scale', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        const lightnesses = palette.stops.map((s) => s.background.hsl.l);

        // Check that lightness generally decreases
        for (let i = 0; i < lightnesses.length - 1; i++) {
          expect(lightnesses[i]).toBeGreaterThanOrEqual(lightnesses[i + 1]);
        }
      });

      it('should avoid pure white and black extremes', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        palette.stops.forEach((stop) => {
          // Should not be exactly 0 or 1
          expect(stop.background.hsl.l).toBeGreaterThan(0.01);
          expect(stop.background.hsl.l).toBeLessThan(0.99);
        });
      });
    });

    describe('saturation adjustment', () => {
      it('should adjust saturation based on lightness', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        // Very light colors should have reduced saturation
        const lightestStop = palette.stops[0];
        if (lightestStop.background.hsl.l > 0.9) {
          expect(lightestStop.background.hsl.s).toBeLessThan(0.95);
        }

        // Very dark colors should have reduced saturation
        const darkestStop = palette.stops[palette.stops.length - 1];
        if (darkestStop.background.hsl.l < 0.2) {
          expect(darkestStop.background.hsl.s).toBeLessThan(0.95);
        }
      });
    });

    describe('foreground generation', () => {
      it('should generate light foregrounds near white', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        palette.stops.forEach((stop) => {
          expect(stop.foregrounds.light.hsl.l).toBeGreaterThan(0.9);
        });
      });

      it('should generate dark foregrounds near black', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        palette.stops.forEach((stop) => {
          expect(stop.foregrounds.dark.hsl.l).toBeLessThan(0.2);
        });
      });

      it('should calculate WCAG compliance correctly', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        palette.stops.forEach((stop) => {
          if (stop.foregrounds.light.wcagAA) {
            expect(stop.foregrounds.light.contrast).toBeGreaterThanOrEqual(4.5);
          }
          if (stop.foregrounds.dark.wcagAA) {
            expect(stop.foregrounds.dark.contrast).toBeGreaterThanOrEqual(4.5);
          }
        });
      });

      it('should calculate AAA compliance correctly', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);

        palette.stops.forEach((stop) => {
          if (stop.foregrounds.light.wcagAAA) {
            expect(stop.foregrounds.light.contrast).toBeGreaterThanOrEqual(7);
          }
          if (stop.foregrounds.dark.wcagAAA) {
            expect(stop.foregrounds.dark.contrast).toBeGreaterThanOrEqual(7);
          }
        });
      });
    });

    describe('color consistency', () => {
      it('should maintain hue across all stops', () => {
        const palette = generatePalette('#3b82f6', 'test', 10);
        const baseHue = palette.baseColor.hsl.h;

        palette.stops.forEach((stop) => {
          // Hue should be close to base hue (allowing for some variation)
          expect(Math.abs(stop.background.hsl.h - baseHue)).toBeLessThan(10);
        });
      });

      it('should handle different colors correctly', () => {
        const blue = generatePalette('#0000ff', 'blue', 5);
        const red = generatePalette('#ff0000', 'red', 5);
        const green = generatePalette('#00ff00', 'green', 5);

        expect(blue.stops).toHaveLength(5);
        expect(red.stops).toHaveLength(5);
        expect(green.stops).toHaveLength(5);
      });
    });

    describe('error handling', () => {
      it('should throw error for invalid color', () => {
        expect(() => generatePalette('not-a-color', 'test', 5)).toThrow();
      });
    });
  });

  describe('parseHSLInput', () => {
    it('should parse HSL string', () => {
      const result = parseHSLInput('hsl(217, 91%, 60%)');

      expect(result).toHaveProperty('h');
      expect(result).toHaveProperty('s');
      expect(result).toHaveProperty('l');
      expect(result.h).toBeCloseTo(217, 0);
    });

    it('should parse hex color', () => {
      const result = parseHSLInput('#3b82f6');

      expect(result).toHaveProperty('h');
      expect(result).toHaveProperty('s');
      expect(result).toHaveProperty('l');
    });

    it('should parse RGB string', () => {
      const result = parseHSLInput('rgb(59, 130, 246)');

      expect(result).toHaveProperty('h');
      expect(result).toHaveProperty('s');
      expect(result).toHaveProperty('l');
    });

    it('should throw error for invalid input', () => {
      expect(() => parseHSLInput('invalid-color')).toThrow();
    });
  });

  describe('integration tests', () => {
    it('should generate consistent results for same input', () => {
      const palette1 = generatePalette('#3b82f6', 'test', 5);
      const palette2 = generatePalette('#3b82f6', 'test', 5);

      expect(palette1.stops.length).toBe(palette2.stops.length);
      expect(palette1.baseColor.hex).toBe(palette2.baseColor.hex);

      palette1.stops.forEach((stop, index) => {
        expect(stop.background.hex).toBe(palette2.stops[index].background.hex);
      });
    });

    it('should generate valid palette for multiple sizes', () => {
      const sizes = [2, 5, 10, 16, 20, 50];

      sizes.forEach((size) => {
        const palette = generatePalette('#3b82f6', 'test', size);
        expect(palette.stops).toHaveLength(size);
        expect(palette.metadata.totalStops).toBe(size);
      });
    });

    it('should handle grayscale colors', () => {
      const palette = generatePalette('#808080', 'gray', 10);

      expect(palette.stops).toHaveLength(10);
      palette.stops.forEach((stop) => {
        expect(stop.background.hsl.s).toBeLessThanOrEqual(0.2);
      });
    });

    it('should handle edge case colors', () => {
      const white = generatePalette('#ffffff', 'white', 5);
      const black = generatePalette('#000000', 'black', 5);

      expect(white.stops).toHaveLength(5);
      expect(black.stops).toHaveLength(5);
    });
  });
});