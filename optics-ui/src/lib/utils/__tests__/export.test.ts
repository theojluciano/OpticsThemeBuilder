import { describe, it, expect } from 'vitest';
import { parseStopName, exportFigmaJSON, type PaletteData } from '../export';
import { OPTICS_STOPS } from '../../data/defaults';
import type { OpticsStopName } from '../../data/defaults';

describe('parseStopName', () => {
  it('should parse base stop', () => {
    expect(parseStopName('base')).toEqual({ group: 'base', key: 'base' });
  });

  it('should parse plus stops', () => {
    expect(parseStopName('plus-max')).toEqual({ group: 'plus', key: 'max' });
    expect(parseStopName('plus-one')).toEqual({ group: 'plus', key: 'one' });
    expect(parseStopName('plus-eight')).toEqual({ group: 'plus', key: 'eight' });
  });

  it('should parse minus stops', () => {
    expect(parseStopName('minus-one')).toEqual({ group: 'minus', key: 'one' });
    expect(parseStopName('minus-max')).toEqual({ group: 'minus', key: 'max' });
    expect(parseStopName('minus-five')).toEqual({ group: 'minus', key: 'five' });
  });

  it('should handle all OPTICS_STOPS without error', () => {
    for (const stop of OPTICS_STOPS) {
      const result = parseStopName(stop);
      expect(result.group).toMatch(/^(base|plus|minus)$/);
      expect(result.key).toBeTruthy();
    }
  });
});

describe('exportFigmaJSON', () => {
  function makePalette(overrides?: Partial<PaletteData>): PaletteData {
    const stops = Object.fromEntries(
      OPTICS_STOPS.map((stop, i) => [stop, { bg: 50, on: 90, onAlt: 80 }])
    ) as Record<OpticsStopName, { bg: number; on: number; onAlt: number }>;

    return { name: 'test', h: 200, s: 50, mode: 'light', stops, ...overrides };
  }

  it('should return empty object for no palettes', () => {
    expect(exportFigmaJSON([])).toBe('{}');
  });

  it('should include mode in $extensions', () => {
    const json = JSON.parse(exportFigmaJSON([makePalette()]));
    expect(json.$extensions['com.figma.modeName']).toBe('Light');
  });

  it('should include dark mode in $extensions', () => {
    const json = JSON.parse(exportFigmaJSON([makePalette({ mode: 'dark' })]));
    expect(json.$extensions['com.figma.modeName']).toBe('Dark');
  });

  it('should create nested structure for each palette', () => {
    const json = JSON.parse(exportFigmaJSON([makePalette()]));
    expect(json.test).toBeDefined();
    expect(json.test.base).toBeDefined();
    expect(json.test.plus).toBeDefined();
    expect(json.test.minus).toBeDefined();
    expect(json.test.on).toBeDefined();
    expect(json.test.on.plus).toBeDefined();
    expect(json.test.on.minus).toBeDefined();
  });

  it('should create valid color tokens with hex values', () => {
    const json = JSON.parse(exportFigmaJSON([makePalette()]));
    const base = json.test.base;

    expect(base.$type).toBe('color');
    expect(base.$value.colorSpace).toBe('srgb');
    expect(base.$value.components).toHaveLength(3);
    expect(base.$value.alpha).toBe(1.0);
    expect(base.$value.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should populate all plus and minus stops', () => {
    const json = JSON.parse(exportFigmaJSON([makePalette()]));

    const plusKeys = ['max', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one'];
    for (const key of plusKeys) {
      expect(json.test.plus[key]).toBeDefined();
      expect(json.test.on.plus[key]).toBeDefined();
      expect(json.test.on.plus[`${key}-alt`]).toBeDefined();
    }

    const minusKeys = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'max'];
    for (const key of minusKeys) {
      expect(json.test.minus[key]).toBeDefined();
      expect(json.test.on.minus[key]).toBeDefined();
      expect(json.test.on.minus[`${key}-alt`]).toBeDefined();
    }
  });
});
