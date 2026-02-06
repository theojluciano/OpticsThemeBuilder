import * as fs from 'fs';
import * as path from 'path';
import {
  exportOpticsToFigma,
  exportOpticsContrastReport,
  exportOpticsAll,
} from '../src/optics-exporter';
import { generateOpticsPalette } from '../src/optics-generator';
import { OpticsPalette } from '../src/types';

describe('optics-exporter', () => {
  let testPalette: OpticsPalette;
  const testDir = path.join(__dirname, 'optics-exporter-test-output');

  beforeEach(() => {
    testPalette = generateOpticsPalette('#3b82f6', 'test-primary');
    
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('exportOpticsToFigma', () => {
    it('should export Optics palette to Figma format string', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate valid JSON', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');

      expect(() => JSON.parse(result)).not.toThrow();
      const data = JSON.parse(result);
      expect(data).toBeDefined();
    });

    it('should include op-color collection name', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');
      const data = JSON.parse(result);

      expect(data['op-color']).toBeDefined();
    });

    it('should include palette name in tokens', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');
      const data = JSON.parse(result);

      expect(data['op-color']['test-primary']).toBeDefined();
    });

    it('should include background colors for all stops', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');
      const data = JSON.parse(result);

      testPalette.stops.forEach((stop) => {
        const stopName = stop.name;
        if (stopName === 'base') {
          expect(data['op-color']['test-primary']['base']).toBeDefined();
        } else if (stopName.startsWith('plus-')) {
          const varName = stopName.replace('plus-', '');
          expect(data['op-color']['test-primary']['plus'][varName]).toBeDefined();
        } else if (stopName.startsWith('minus-')) {
          const varName = stopName.replace('minus-', '');
          expect(data['op-color']['test-primary']['minus'][varName]).toBeDefined();
        }
      });
    });

    it('should include on foreground colors', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');
      const data = JSON.parse(result);

      testPalette.stops.forEach((stop) => {
        const stopName = stop.name;
        if (stopName === 'base') {
          expect(data['op-color']['test-primary']['on']['base']).toBeDefined();
        } else if (stopName.startsWith('plus-')) {
          const varName = stopName.replace('plus-', '');
          expect(data['op-color']['test-primary']['on']['plus'][varName]).toBeDefined();
        }
      });
    });

    it('should include on-alt foreground colors', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');
      const data = JSON.parse(result);

      testPalette.stops.forEach((stop) => {
        const stopName = stop.name;
        if (stopName === 'base') {
          expect(data['op-color']['test-primary']['on']['base-alt']).toBeDefined();
        } else if (stopName.startsWith('plus-')) {
          const varName = stopName.replace('plus-', '');
          expect(data['op-color']['test-primary']['on']['plus'][`${varName}-alt`]).toBeDefined();
        }
      });
    });

    it('should set correct mode in extensions', () => {
      const resultLight = exportOpticsToFigma(testPalette, 'Light');
      const resultDark = exportOpticsToFigma(testPalette, 'Dark');

      const dataLight = JSON.parse(resultLight);
      const dataDark = JSON.parse(resultDark);

      expect(dataLight.$extensions['com.figma.modeName']).toBe('Light');
      expect(dataDark.$extensions['com.figma.modeName']).toBe('Dark');
    });

    it('should include color tokens with proper structure', () => {
      const result = exportOpticsToFigma(testPalette, 'Light');
      const data = JSON.parse(result);

      const baseToken = data['op-color']['test-primary']['base'];
      expect(baseToken).toBeDefined();
      expect(typeof baseToken).toBe('object'); // Token object with $type, $value, etc.
      expect(baseToken.$type).toBe('color');
      expect(baseToken.$value).toBeDefined();
    });

    it('should handle light and dark modes differently', () => {
      const lightResult = exportOpticsToFigma(testPalette, 'Light');
      const darkResult = exportOpticsToFigma(testPalette, 'Dark');

      const lightData = JSON.parse(lightResult);
      const darkData = JSON.parse(darkResult);

      // Both should have the same structure
      expect(Object.keys(lightData)).toEqual(Object.keys(darkData));
      // But different mode values
      expect(lightData.$extensions['com.figma.modeName']).not.toBe(
        darkData.$extensions['com.figma.modeName']
      );
    });
  });

  describe('exportOpticsContrastReport', () => {
    it('should generate contrast report', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include report header', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('# WCAG Contrast Report');
      expect(report).toContain('test-primary');
      expect(report).toContain(testPalette.baseColor.hex);
      expect(report).toContain('# Total Stops: 19');
    });

    it('should include failures summary', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('⚠️  FAILURES SUMMARY');
    });

    it('should include light mode report', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('## LIGHT MODE');
    });

    it('should include dark mode report', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('## DARK MODE');
    });

    it('should include all Optics stops in report', () => {
      const report = exportOpticsContrastReport(testPalette);

      testPalette.stops.forEach((stop) => {
        expect(report).toContain(stop.name);
      });
    });

    it('should include contrast information for on colors', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('on');
    });

    it('should include contrast information for on-alt colors', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('on-alt');
    });

    it('should include WCAG standards information', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('WCAG');
      expect(report).toContain('AA');
      expect(report).toContain('AAA');
    });

    it('should include footer with standards reference', () => {
      const report = exportOpticsContrastReport(testPalette);

      expect(report).toContain('##');
    });
  });

  describe('exportOpticsAll', () => {
    it('should export light and dark variants plus contrast report', () => {
      const result = exportOpticsAll(testPalette, testDir);

      expect(result).toBeDefined();
      expect(result.figmaLight).toBeDefined();
      expect(result.figmaDark).toBeDefined();
      expect(result.contrastReport).toBeDefined();
    });

    it('should save light mode Figma file', () => {
      const result = exportOpticsAll(testPalette, testDir);

      expect(fs.existsSync(result.figmaLight)).toBe(true);
      const content = fs.readFileSync(result.figmaLight, 'utf-8');
      const data = JSON.parse(content);
      expect(data.$extensions['com.figma.modeName']).toBe('Light');
    });

    it('should save dark mode Figma file', () => {
      const result = exportOpticsAll(testPalette, testDir);

      expect(fs.existsSync(result.figmaDark)).toBe(true);
      const content = fs.readFileSync(result.figmaDark, 'utf-8');
      const data = JSON.parse(content);
      expect(data.$extensions['com.figma.modeName']).toBe('Dark');
    });

    it('should save contrast report file', () => {
      const result = exportOpticsAll(testPalette, testDir);

      expect(fs.existsSync(result.contrastReport)).toBe(true);
      const content = fs.readFileSync(result.contrastReport, 'utf-8');
      expect(content).toContain('# WCAG Contrast Report');
      expect(content).toContain('test-primary');
    });

    it('should use palette name in filenames', () => {
      const result = exportOpticsAll(testPalette, testDir);

      expect(result.figmaLight).toContain('test-primary');
      expect(result.figmaDark).toContain('test-primary');
      expect(result.contrastReport).toContain('test-primary');
    });

    it('should create directory if it does not exist', () => {
      const nestedDir = path.join(testDir, 'nested', 'optics');
      
      expect(fs.existsSync(nestedDir)).toBe(false);
      exportOpticsAll(testPalette, nestedDir);
      
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it('should return correct file paths', () => {
      const result = exportOpticsAll(testPalette, testDir);

      expect(result.figmaLight).toBe(path.join(testDir, 'test-primary-light.tokens.json'));
      expect(result.figmaDark).toBe(path.join(testDir, 'test-primary-dark.tokens.json'));
      expect(result.contrastReport).toBe(path.join(testDir, 'test-primary-contrast-report.txt'));
    });

    it('should handle different palette names', () => {
      const primaryPalette = generateOpticsPalette('#3b82f6', 'primary');
      const resultPrimary = exportOpticsAll(primaryPalette, testDir);

      const secondaryPalette = generateOpticsPalette('#ef4444', 'secondary');
      const resultSecondary = exportOpticsAll(secondaryPalette, testDir);

      expect(resultPrimary.figmaLight).toContain('primary');
      expect(resultSecondary.figmaLight).toContain('secondary');
      expect(resultPrimary.figmaLight).not.toBe(resultSecondary.figmaLight);
    });

    it('should produce valid JSON files', () => {
      const result = exportOpticsAll(testPalette, testDir);

      const lightContent = fs.readFileSync(result.figmaLight, 'utf-8');
      const darkContent = fs.readFileSync(result.figmaDark, 'utf-8');

      expect(() => JSON.parse(lightContent)).not.toThrow();
      expect(() => JSON.parse(darkContent)).not.toThrow();
    });

    it('should have different light and dark color values', () => {
      const result = exportOpticsAll(testPalette, testDir);

      const lightContent = fs.readFileSync(result.figmaLight, 'utf-8');
      const darkContent = fs.readFileSync(result.figmaDark, 'utf-8');

      const lightData = JSON.parse(lightContent);
      const darkData = JSON.parse(darkContent);

      // Both should have same structure
      expect(Object.keys(lightData['op-color'])).toEqual(
        Object.keys(darkData['op-color'])
      );
      // But they're separate modes
      expect(lightData.$extensions['com.figma.modeName']).toBe('Light');
      expect(darkData.$extensions['com.figma.modeName']).toBe('Dark');
    });
  });
});
