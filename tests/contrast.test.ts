import {
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getContrastLabel,
} from '../src/contrast';
import { Rgb } from 'culori';

describe('contrast', () => {
  describe('getRelativeLuminance', () => {
    it('should return 1 for white', () => {
      const white: Rgb = { mode: 'rgb', r: 1, g: 1, b: 1 };
      expect(getRelativeLuminance(white)).toBeCloseTo(1, 2);
    });

    it('should return 0 for black', () => {
      const black: Rgb = { mode: 'rgb', r: 0, g: 0, b: 0 };
      expect(getRelativeLuminance(black)).toBeCloseTo(0, 2);
    });

    it('should calculate correct luminance for gray', () => {
      const gray: Rgb = { mode: 'rgb', r: 0.5, g: 0.5, b: 0.5 };
      const luminance = getRelativeLuminance(gray);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
      expect(luminance).toBeCloseTo(0.214, 2);
    });

    it('should calculate correct luminance for red', () => {
      const red: Rgb = { mode: 'rgb', r: 1, g: 0, b: 0 };
      const luminance = getRelativeLuminance(red);
      expect(luminance).toBeCloseTo(0.2126, 3);
    });

    it('should calculate correct luminance for green', () => {
      const green: Rgb = { mode: 'rgb', r: 0, g: 1, b: 0 };
      const luminance = getRelativeLuminance(green);
      expect(luminance).toBeCloseTo(0.7152, 3);
    });

    it('should calculate correct luminance for blue', () => {
      const blue: Rgb = { mode: 'rgb', r: 0, g: 0, b: 1 };
      const luminance = getRelativeLuminance(blue);
      expect(luminance).toBeCloseTo(0.0722, 3);
    });
  });

  describe('getContrastRatio', () => {
    it('should return 21 for black on white', () => {
      const white: Rgb = { mode: 'rgb', r: 1, g: 1, b: 1 };
      const black: Rgb = { mode: 'rgb', r: 0, g: 0, b: 0 };
      expect(getContrastRatio(white, black)).toBeCloseTo(21, 0);
    });

    it('should return 21 for white on black', () => {
      const white: Rgb = { mode: 'rgb', r: 1, g: 1, b: 1 };
      const black: Rgb = { mode: 'rgb', r: 0, g: 0, b: 0 };
      expect(getContrastRatio(black, white)).toBeCloseTo(21, 0);
    });

    it('should return 1 for identical colors', () => {
      const color: Rgb = { mode: 'rgb', r: 0.5, g: 0.5, b: 0.5 };
      expect(getContrastRatio(color, color)).toBeCloseTo(1, 2);
    });

    it('should calculate correct ratio for common color pairs', () => {
      const white: Rgb = { mode: 'rgb', r: 1, g: 1, b: 1 };
      const darkGray: Rgb = { mode: 'rgb', r: 0.3, g: 0.3, b: 0.3 };
      const ratio = getContrastRatio(white, darkGray);
      expect(ratio).toBeGreaterThan(4.5); // Should pass WCAG AA
      expect(ratio).toBeCloseTo(8.52, 1);
    });

    it('should be symmetric', () => {
      const color1: Rgb = { mode: 'rgb', r: 0.2, g: 0.4, b: 0.6 };
      const color2: Rgb = { mode: 'rgb', r: 0.8, g: 0.6, b: 0.4 };
      expect(getContrastRatio(color1, color2)).toBeCloseTo(
        getContrastRatio(color2, color1),
        5
      );
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should pass for contrast ratio >= 4.5 (normal text)', () => {
      expect(meetsWCAG_AA(4.5)).toBe(true);
      expect(meetsWCAG_AA(5.0)).toBe(true);
      expect(meetsWCAG_AA(21)).toBe(true);
    });

    it('should fail for contrast ratio < 4.5 (normal text)', () => {
      expect(meetsWCAG_AA(4.4)).toBe(false);
      expect(meetsWCAG_AA(3.0)).toBe(false);
      expect(meetsWCAG_AA(1.0)).toBe(false);
    });

    it('should pass for contrast ratio >= 3 (large text)', () => {
      expect(meetsWCAG_AA(3.0, true)).toBe(true);
      expect(meetsWCAG_AA(4.0, true)).toBe(true);
      expect(meetsWCAG_AA(21, true)).toBe(true);
    });

    it('should fail for contrast ratio < 3 (large text)', () => {
      expect(meetsWCAG_AA(2.9, true)).toBe(false);
      expect(meetsWCAG_AA(2.0, true)).toBe(false);
      expect(meetsWCAG_AA(1.0, true)).toBe(false);
    });
  });

  describe('meetsWCAG_AAA', () => {
    it('should pass for contrast ratio >= 7 (normal text)', () => {
      expect(meetsWCAG_AAA(7.0)).toBe(true);
      expect(meetsWCAG_AAA(10.0)).toBe(true);
      expect(meetsWCAG_AAA(21)).toBe(true);
    });

    it('should fail for contrast ratio < 7 (normal text)', () => {
      expect(meetsWCAG_AAA(6.9)).toBe(false);
      expect(meetsWCAG_AAA(4.5)).toBe(false);
      expect(meetsWCAG_AAA(1.0)).toBe(false);
    });

    it('should pass for contrast ratio >= 4.5 (large text)', () => {
      expect(meetsWCAG_AAA(4.5, true)).toBe(true);
      expect(meetsWCAG_AAA(5.0, true)).toBe(true);
      expect(meetsWCAG_AAA(21, true)).toBe(true);
    });

    it('should fail for contrast ratio < 4.5 (large text)', () => {
      expect(meetsWCAG_AAA(4.4, true)).toBe(false);
      expect(meetsWCAG_AAA(3.0, true)).toBe(false);
      expect(meetsWCAG_AAA(1.0, true)).toBe(false);
    });
  });

  describe('getContrastLabel', () => {
    it('should return "AAA" for ratio >= 7', () => {
      expect(getContrastLabel(7.0)).toBe('AAA');
      expect(getContrastLabel(10.0)).toBe('AAA');
      expect(getContrastLabel(21.0)).toBe('AAA');
    });

    it('should return "AA" for ratio >= 4.5 and < 7', () => {
      expect(getContrastLabel(4.5)).toBe('AA');
      expect(getContrastLabel(5.0)).toBe('AA');
      expect(getContrastLabel(6.9)).toBe('AA');
    });

    it('should return "AA Large" for ratio >= 3 and < 4.5', () => {
      expect(getContrastLabel(3.0)).toBe('AA Large');
      expect(getContrastLabel(3.5)).toBe('AA Large');
      expect(getContrastLabel(4.4)).toBe('AA Large');
    });

    it('should return "Fail" for ratio < 3', () => {
      expect(getContrastLabel(2.9)).toBe('Fail');
      expect(getContrastLabel(2.0)).toBe('Fail');
      expect(getContrastLabel(1.0)).toBe('Fail');
    });
  });
});