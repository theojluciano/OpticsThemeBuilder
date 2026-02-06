import * as fs from 'fs';
import * as path from 'path';
import { exportToFigma, exportContrastReport, exportAll } from '../src/exporter';
import { generatePalette } from '../src/generator';
import { ColorPalette } from '../src/types';

describe('exporter', () => {
  let testPalette: ColorPalette;
  const testDir = path.join(__dirname, 'exporter-test-output');

  beforeEach(() => {
    testPalette = generatePalette('#3b82f6', 'test-palette', 5);
    
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

  describe('exportToFigma', () => {
    it('should export palette to Figma Variables format', () => {
      const result = exportToFigma(testPalette);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result['test-palette']).toBeDefined();
    });

    it('should include background colors group', () => {
      const result = exportToFigma(testPalette);

      expect(result['test-palette']).toBeDefined();
      testPalette.stops.forEach((stop) => {
        expect(result['test-palette'][stop.stop]).toBeDefined();
        expect(result['test-palette'][stop.stop].$type).toBe('color');
        expect(result['test-palette'][stop.stop].$value).toBeDefined();
      });
    });

    it('should include foreground colors group', () => {
      const result = exportToFigma(testPalette);

      expect(result['test-palette-foregrounds']).toBeDefined();
      expect(result['test-palette-foregrounds'].light).toBeDefined();
      expect(result['test-palette-foregrounds'].dark).toBeDefined();
    });

    it('should include light foreground colors', () => {
      const result = exportToFigma(testPalette);

      testPalette.stops.forEach((stop) => {
        expect(result['test-palette-foregrounds'].light[stop.stop]).toBeDefined();
        expect(result['test-palette-foregrounds'].light[stop.stop].$type).toBe('color');
        expect(result['test-palette-foregrounds'].light[stop.stop].$value).toBeDefined();
      });
    });

    it('should include dark foreground colors', () => {
      const result = exportToFigma(testPalette);

      testPalette.stops.forEach((stop) => {
        expect(result['test-palette-foregrounds'].dark[stop.stop]).toBeDefined();
        expect(result['test-palette-foregrounds'].dark[stop.stop].$type).toBe('color');
        expect(result['test-palette-foregrounds'].dark[stop.stop].$value).toBeDefined();
      });
    });

    it('should include Figma extensions', () => {
      const result = exportToFigma(testPalette);

      expect(result.$extensions).toBeDefined();
      expect(result.$extensions['com.figma.modeName']).toBe('Light');
    });

    it('should accept custom mode name', () => {
      const result = exportToFigma(testPalette, 'Dark');

      expect(result.$extensions['com.figma.modeName']).toBe('Dark');
    });

    it('should include Figma variable IDs and code syntax', () => {
      const result = exportToFigma(testPalette);

      const stop = testPalette.stops[0];
      const bgColor = result['test-palette'][stop.stop];
      
      expect(bgColor.$extensions).toBeDefined();
      expect(bgColor.$extensions['com.figma.variableId']).toBeDefined();
      expect(bgColor.$extensions['com.figma.scopes']).toEqual(['ALL_SCOPES']);
      expect(bgColor.$extensions['com.figma.codeSyntax']).toBeDefined();
      expect(bgColor.$extensions['com.figma.codeSyntax'].WEB).toBe(stop.background.hex);
    });
  });

  describe('exportContrastReport', () => {
    it('should generate contrast report', () => {
      const report = exportContrastReport(testPalette);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include report header', () => {
      const report = exportContrastReport(testPalette);

      expect(report).toContain('# WCAG Contrast Report');
      expect(report).toContain('# Palette: test-palette');
      expect(report).toContain(`# Base Color: ${testPalette.baseColor.hex}`);
      expect(report).toContain(`# Total Stops: ${testPalette.stops.length}`);
    });

    it('should include failures summary section', () => {
      const report = exportContrastReport(testPalette);

      expect(report).toContain('⚠️  FAILURES SUMMARY');
    });

    it('should include detailed contrast analysis section', () => {
      const report = exportContrastReport(testPalette);

      expect(report).toContain('## DETAILED CONTRAST ANALYSIS');
      testPalette.stops.forEach((stop) => {
        expect(report).toContain(`### Stop ${stop.stop}`);
        expect(report).toContain(`Background: ${stop.background.hex}`);
      });
    });

    it('should include WCAG standards information', () => {
      const report = exportContrastReport(testPalette);

      expect(report).toContain('WCAG');
      expect(report).toContain('AA');
      expect(report).toContain('AAA');
    });

    it('should include contrast analysis for all stops', () => {
      const report = exportContrastReport(testPalette);

      testPalette.stops.forEach((stop) => {
        expect(report).toContain(stop.background.hex);
        expect(report).toContain(stop.foregrounds.light.hex);
        expect(report).toContain(stop.foregrounds.dark.hex);
      });
    });

    it('should handle palette with different number of stops', () => {
      const smallPalette = generatePalette('#ff0000', 'danger', 3);
      const report = exportContrastReport(smallPalette);

      expect(report).toBeDefined();
      expect(report).toContain('danger');
      expect(report).toContain('# Total Stops: 3');
    });
  });

  describe('exportAll', () => {
    it('should export both Figma format and contrast report', () => {
      const result = exportAll(testPalette, testDir);

      expect(result).toBeDefined();
      expect(result.figma).toBeDefined();
      expect(result.contrastReport).toBeDefined();
    });

    it('should save Figma JSON file', () => {
      const result = exportAll(testPalette, testDir);

      expect(fs.existsSync(result.figma)).toBe(true);
      const content = fs.readFileSync(result.figma, 'utf-8');
      const data = JSON.parse(content);
      expect(data['test-palette']).toBeDefined();
    });

    it('should save contrast report text file', () => {
      const result = exportAll(testPalette, testDir);

      expect(fs.existsSync(result.contrastReport)).toBe(true);
      const content = fs.readFileSync(result.contrastReport, 'utf-8');
      expect(content).toContain('# WCAG Contrast Report');
      expect(content).toContain('test-palette');
    });

    it('should use palette name in filenames', () => {
      const result = exportAll(testPalette, testDir);

      expect(result.figma).toContain('test-palette');
      expect(result.contrastReport).toContain('test-palette');
    });

    it('should create output directory if it does not exist', () => {
      const nestedDir = path.join(testDir, 'nested', 'output');
      
      expect(fs.existsSync(nestedDir)).toBe(false);
      exportAll(testPalette, nestedDir);
      
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it('should handle different palette names', () => {
      const primaryPalette = generatePalette('#3b82f6', 'primary', 5);
      const resultPrimary = exportAll(primaryPalette, testDir);

      const secondaryPalette = generatePalette('#ef4444', 'secondary', 5);
      const resultSecondary = exportAll(secondaryPalette, testDir);

      expect(resultPrimary.figma).toContain('primary');
      expect(resultSecondary.figma).toContain('secondary');
      expect(resultPrimary.figma).not.toBe(resultSecondary.figma);
    });

    it('should return correct file paths', () => {
      const result = exportAll(testPalette, testDir);

      expect(result.figma).toBe(path.join(testDir, 'test-palette-figma.json'));
      expect(result.contrastReport).toBe(path.join(testDir, 'test-palette-contrast-report.txt'));
    });
  });
});
