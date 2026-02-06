import { generateOpticsPalette } from '../src/optics-generator';
import { OpticsPalette } from '../src/types';

describe('optics-generator', () => {
  describe('generateOpticsPalette', () => {
    it('should generate a valid Optics palette from hex color', () => {
      const palette = generateOpticsPalette('#3b82f6');

      expect(palette.name).toBe('primary');
      expect(palette.stops).toHaveLength(19);
      expect(palette.baseColor).toBeDefined();
      expect(palette.metadata).toBeDefined();
    });

    it('should generate palette with custom name', () => {
      const palette = generateOpticsPalette('#3b82f6', 'secondary');

      expect(palette.name).toBe('secondary');
    });

    it('should generate palette from HSL object', () => {
      const hsl = { h: 217, s: 0.91, l: 0.60 };
      const palette = generateOpticsPalette(hsl, 'custom');

      expect(palette.name).toBe('custom');
      expect(palette.stops).toHaveLength(19);
    });

    it('should include base color information', () => {
      const palette = generateOpticsPalette('#3b82f6', 'test');

      expect(palette.baseColor).toHaveProperty('h');
      expect(palette.baseColor).toHaveProperty('s');
      expect(palette.baseColor).toHaveProperty('l');
      expect(palette.baseColor).toHaveProperty('hsl');
      expect(palette.baseColor).toHaveProperty('rgb');
      expect(palette.baseColor).toHaveProperty('hex');
    });

    it('should set metadata correctly', () => {
      const beforeTime = new Date();
      const palette = generateOpticsPalette('#ff0000', 'danger');
      const afterTime = new Date();

      expect(palette.metadata.totalStops).toBe(19);
      expect(palette.metadata.format).toBe('optics');
      expect(palette.metadata.generatedAt).toBeDefined();

      const generatedTime = new Date(palette.metadata.generatedAt);
      expect(generatedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(generatedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    describe('stops', () => {
      let palette: OpticsPalette;

      beforeEach(() => {
        palette = generateOpticsPalette('#3b82f6', 'test');
      });

      it('should have all 19 Optics stops', () => {
        const expectedStops = [
          'plus-max',
          'plus-eight',
          'plus-seven',
          'plus-six',
          'plus-five',
          'plus-four',
          'plus-three',
          'plus-two',
          'plus-one',
          'base',
          'minus-one',
          'minus-two',
          'minus-three',
          'minus-four',
          'minus-five',
          'minus-six',
          'minus-seven',
          'minus-eight',
          'minus-max',
        ];

        expect(palette.stops).toHaveLength(19);
        palette.stops.forEach((stop, index) => {
          expect(stop.name).toBe(expectedStops[index]);
        });
      });

      it('should include background colors for light and dark modes', () => {
        palette.stops.forEach((stop) => {
          expect(stop.background).toHaveProperty('light');
          expect(stop.background).toHaveProperty('dark');
          expect(stop.background.light).toHaveProperty('hex');
          expect(stop.background.light).toHaveProperty('hsl');
          expect(stop.background.light).toHaveProperty('rgb');
          expect(stop.background.dark).toHaveProperty('hex');
          expect(stop.background.dark).toHaveProperty('hsl');
          expect(stop.background.dark).toHaveProperty('rgb');
        });
      });

      it('should include on foreground colors for light and dark modes', () => {
        palette.stops.forEach((stop) => {
          expect(stop.on).toHaveProperty('light');
          expect(stop.on).toHaveProperty('dark');
          expect(stop.on.light).toHaveProperty('hex');
          expect(stop.on.dark).toHaveProperty('hex');
        });
      });

      it('should include onAlt foreground colors for light and dark modes', () => {
        palette.stops.forEach((stop) => {
          expect(stop.onAlt).toHaveProperty('light');
          expect(stop.onAlt).toHaveProperty('dark');
          expect(stop.onAlt.light).toHaveProperty('hex');
          expect(stop.onAlt.dark).toHaveProperty('hex');
        });
      });

      it('should have contrast ratios for light and dark modes', () => {
        palette.stops.forEach((stop) => {
          expect(stop.lightModeContrast).toHaveProperty('on');
          expect(stop.lightModeContrast).toHaveProperty('onAlt');
          expect(stop.darkModeContrast).toHaveProperty('on');
          expect(stop.darkModeContrast).toHaveProperty('onAlt');
          
          expect(typeof stop.lightModeContrast.on).toBe('number');
          expect(typeof stop.lightModeContrast.onAlt).toBe('number');
          expect(typeof stop.darkModeContrast.on).toBe('number');
          expect(typeof stop.darkModeContrast.onAlt).toBe('number');
          
          expect(stop.lightModeContrast.on).toBeGreaterThan(0);
          expect(stop.lightModeContrast.onAlt).toBeGreaterThan(0);
          expect(stop.darkModeContrast.on).toBeGreaterThan(0);
          expect(stop.darkModeContrast.onAlt).toBeGreaterThan(0);
        });
      });

      it('should have valid hex colors for all color values', () => {
        const hexRegex = /^#[0-9a-f]{6}$/i;
        
        palette.stops.forEach((stop) => {
          expect(stop.background.light.hex).toMatch(hexRegex);
          expect(stop.background.dark.hex).toMatch(hexRegex);
          expect(stop.on.light.hex).toMatch(hexRegex);
          expect(stop.on.dark.hex).toMatch(hexRegex);
          expect(stop.onAlt.light.hex).toMatch(hexRegex);
          expect(stop.onAlt.dark.hex).toMatch(hexRegex);
        });
      });

      it('should have lightness values in valid range', () => {
        palette.stops.forEach((stop) => {
          expect(stop.background.light.hsl.l).toBeGreaterThanOrEqual(0);
          expect(stop.background.light.hsl.l).toBeLessThanOrEqual(1);
          expect(stop.background.dark.hsl.l).toBeGreaterThanOrEqual(0);
          expect(stop.background.dark.hsl.l).toBeLessThanOrEqual(1);
          
          expect(stop.on.light.hsl.l).toBeGreaterThanOrEqual(0);
          expect(stop.on.light.hsl.l).toBeLessThanOrEqual(1);
          expect(stop.on.dark.hsl.l).toBeGreaterThanOrEqual(0);
          expect(stop.on.dark.hsl.l).toBeLessThanOrEqual(1);
        });
      });

      it('should preserve hue from base color across all stops', () => {
        const baseHue = palette.baseColor.h;
        
        palette.stops.forEach((stop) => {
          expect(stop.background.light.hsl.h).toBeCloseTo(baseHue, 0);
          expect(stop.background.dark.hsl.h).toBeCloseTo(baseHue, 0);
        });
      });
    });

    describe('different base colors', () => {
      it('should generate palette from red color', () => {
        const palette = generateOpticsPalette('#ff0000', 'danger');

        expect(palette.name).toBe('danger');
        expect(palette.stops).toHaveLength(19);
        expect(palette.baseColor.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });

      it('should generate palette from blue color', () => {
        const palette = generateOpticsPalette('#0000ff', 'info');

        expect(palette.name).toBe('info');
        expect(palette.stops).toHaveLength(19);
      });

      it('should generate palette from green color', () => {
        const palette = generateOpticsPalette('#00ff00', 'success');

        expect(palette.name).toBe('success');
        expect(palette.stops).toHaveLength(19);
      });

      it('should generate palette from named color', () => {
        const palette = generateOpticsPalette('purple', 'accent');

        expect(palette.name).toBe('accent');
        expect(palette.stops).toHaveLength(19);
        expect(palette.baseColor.hex).toBeDefined();
      });
    });

    describe('consistency across runs', () => {
      it('should generate consistent results for same input', () => {
        const palette1 = generateOpticsPalette('#3b82f6', 'primary');
        const palette2 = generateOpticsPalette('#3b82f6', 'primary');

        // Compare stops (excluding metadata timestamp)
        expect(palette1.stops).toHaveLength(palette2.stops.length);
        palette1.stops.forEach((stop1, index) => {
          const stop2 = palette2.stops[index];
          expect(stop1.background.light.hex).toBe(stop2.background.light.hex);
          expect(stop1.background.dark.hex).toBe(stop2.background.dark.hex);
          expect(stop1.on.light.hex).toBe(stop2.on.light.hex);
          expect(stop1.on.dark.hex).toBe(stop2.on.dark.hex);
          expect(stop1.lightModeContrast.on).toBeCloseTo(stop2.lightModeContrast.on, 2);
        });
      });
    });
  });
});
