import { describe, it, expect } from 'vitest';
import { parseImportJSON } from '../import';
import { exportFigmaJSON, type PaletteData } from '../export';
import { OPTICS_STOPS } from '../../data/defaults';
import type { OpticsStopName } from '../../data/defaults';

function makePaletteData(overrides?: Partial<PaletteData>): PaletteData {
  const stops = Object.fromEntries(
    OPTICS_STOPS.map((stop, i) => [stop, {
      bg: 10 + i * 4,
      on: 90 - i * 3,
      onAlt: 80 - i * 2
    }])
  ) as Record<OpticsStopName, { bg: number; on: number; onAlt: number }>;

  return {
    name: 'primary',
    h: 217,
    s: 91,
    mode: 'light',
    stops,
    ...overrides
  };
}

describe('parseImportJSON', () => {
  describe('valid input', () => {
    it('should parse a single color type in light mode', () => {
      const palette = makePaletteData();
      const json = exportFigmaJSON([palette]);
      const result = parseImportJSON(json);

      expect(result.mode).toBe('light');
      expect(result.colorTypes).toHaveLength(1);
      expect(result.colorTypes[0].name).toBe('primary');
    });

    it('should parse dark mode', () => {
      const palette = makePaletteData({ mode: 'dark' });
      const json = exportFigmaJSON([palette]);
      const result = parseImportJSON(json);

      expect(result.mode).toBe('dark');
    });

    it('should parse multiple color types', () => {
      const palettes = [
        makePaletteData({ name: 'primary', h: 217, s: 91 }),
        makePaletteData({ name: 'neutral', h: 217, s: 4 }),
        makePaletteData({ name: 'danger', h: 0, s: 84 })
      ];
      const json = exportFigmaJSON(palettes);
      const result = parseImportJSON(json);

      expect(result.colorTypes).toHaveLength(3);
      expect(result.colorTypes.map(ct => ct.name)).toEqual(['primary', 'neutral', 'danger']);
    });

    it('should recover hue and saturation from the base stop', () => {
      const palette = makePaletteData({ h: 260, s: 60 });
      const json = exportFigmaJSON([palette]);
      const result = parseImportJSON(json);

      // HSL round-trip through hex introduces small rounding — allow ±1
      expect(result.colorTypes[0].h).toBeCloseTo(260, -1);
      expect(result.colorTypes[0].s).toBeCloseTo(60, -1);
    });

    it('should recover achromatic colors (near-zero saturation)', () => {
      const palette = makePaletteData({ h: 0, s: 0 });
      const json = exportFigmaJSON([palette]);
      const result = parseImportJSON(json);

      expect(result.colorTypes[0].s).toBeLessThanOrEqual(1);
    });
  });

  describe('round-trip fidelity', () => {
    it('should recover lightness values within ±1 of the originals', () => {
      const palette = makePaletteData();
      const json = exportFigmaJSON([palette]);
      const result = parseImportJSON(json);

      const imported = result.colorTypes[0];
      for (const stop of OPTICS_STOPS) {
        const original = palette.stops[stop];
        expect(imported.bgValues[stop]).toBeCloseTo(original.bg, -1);
        expect(imported.onValues[stop]).toBeCloseTo(original.on, -1);
        expect(imported.onAltValues[stop]).toBeCloseTo(original.onAlt, -1);
      }
    });

    it('should handle extreme lightness values (0 and 100)', () => {
      const stops = Object.fromEntries(
        OPTICS_STOPS.map((stop, i) => [stop, {
          bg: i === 0 ? 0 : i === OPTICS_STOPS.length - 1 ? 100 : 50,
          on: 100,
          onAlt: 0
        }])
      ) as Record<OpticsStopName, { bg: number; on: number; onAlt: number }>;

      const palette = makePaletteData({ stops });
      const json = exportFigmaJSON([palette]);
      const result = parseImportJSON(json);

      const imported = result.colorTypes[0];
      expect(imported.bgValues['plus-max']).toBe(0);
      expect(imported.bgValues['minus-max']).toBe(100);
      expect(imported.onValues['base']).toBe(100);
      expect(imported.onAltValues['base']).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should reject invalid JSON', () => {
      expect(() => parseImportJSON('not json')).toThrow('Invalid JSON');
    });

    it('should reject non-object JSON', () => {
      expect(() => parseImportJSON('"hello"')).toThrow('expected a JSON object');
    });

    it('should reject JSON without $extensions', () => {
      expect(() => parseImportJSON('{"primary": {}}')).toThrow('missing or unknown mode');
    });

    it('should reject unknown mode value', () => {
      const json = JSON.stringify({
        $extensions: { 'com.figma.modeName': 'Custom' },
        primary: {}
      });
      expect(() => parseImportJSON(json)).toThrow('missing or unknown mode');
    });

    it('should reject file with no color types', () => {
      const json = JSON.stringify({
        $extensions: { 'com.figma.modeName': 'Light' }
      });
      expect(() => parseImportJSON(json)).toThrow('No color types found');
    });

    it('should reject color type missing base/plus/minus/on', () => {
      const json = JSON.stringify({
        $extensions: { 'com.figma.modeName': 'Light' },
        primary: { base: { $type: 'color', $value: { hex: '#3b82f6' } } }
      });
      expect(() => parseImportJSON(json)).toThrow("doesn't match the expected Optics export format");
    });

    it('should reject color type with malformed base token', () => {
      const json = JSON.stringify({
        $extensions: { 'com.figma.modeName': 'Light' },
        primary: {
          base: { notAToken: true },
          plus: {},
          minus: {},
          on: { base: {}, 'base-alt': {}, plus: {}, minus: {} }
        }
      });
      expect(() => parseImportJSON(json)).toThrow('base color entry is missing or malformed');
    });

    it('should reject color type with missing on structure', () => {
      const json = JSON.stringify({
        $extensions: { 'com.figma.modeName': 'Light' },
        primary: {
          base: { $type: 'color', $value: { hex: '#3b82f6' } },
          plus: {},
          minus: {},
          on: { base: {} }
        }
      });
      expect(() => parseImportJSON(json)).toThrow('"on" foreground colors are missing');
    });

    it('should reject color type with missing stop data', () => {
      const json = JSON.stringify({
        $extensions: { 'com.figma.modeName': 'Light' },
        primary: {
          base: { $type: 'color', $value: { hex: '#3b82f6' } },
          plus: {},
          minus: {},
          on: { base: {}, 'base-alt': {}, plus: {}, minus: {} }
        }
      });
      expect(() => parseImportJSON(json)).toThrow('missing or malformed color stops');
    });
  });
});
