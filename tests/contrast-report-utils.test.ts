import {
  generateReportHeader,
  generateFailuresSummary,
  generateContrastEntry,
  generateStandardsFooter,
  passesWCAG_AA,
  getWCAGLevel,
  ContrastFailure,
  ContrastEntry,
} from '../src/contrast-report-utils';

describe('contrast-report-utils', () => {
  describe('generateReportHeader', () => {
    it('should generate a complete header', () => {
      const result = generateReportHeader('primary', '#3b82f6', 19);

      expect(result).toContain('# WCAG Contrast Report');
      expect(result).toContain('# Palette: primary');
      expect(result).toContain('# Base Color: #3b82f6');
      expect(result).toContain('# Total Stops: 19');
      expect(result).toContain('='.repeat(80));
    });

    it('should handle different palette names', () => {
      const result = generateReportHeader('secondary', '#ff0000', 10);

      expect(result).toContain('Palette: secondary');
      expect(result).toContain('Base Color: #ff0000');
      expect(result).toContain('Total Stops: 10');
    });

    it('should format with consistent structure', () => {
      const result = generateReportHeader('test', '#000000', 5);
      const lines = result.split('\n');

      expect(lines[0]).toBe('# WCAG Contrast Report');
      expect(lines[1]).toContain('# Palette:');
      expect(lines[2]).toContain('# Base Color:');
      expect(lines[3]).toContain('# Total Stops:');
    });
  });

  describe('generateFailuresSummary', () => {
    it('should show success message when no failures', () => {
      const result = generateFailuresSummary([]);

      expect(result).toContain('⚠️  FAILURES SUMMARY');
      expect(result).toContain('✅ ALL COMBINATIONS PASS WCAG AA STANDARD');
      expect(result).toContain('No contrast issues found!');
    });

    it('should list failures when present', () => {
      const failures: ContrastFailure[] = [
        {
          stop: 1,
          background: '#ffffff',
          backgroundLightness: 100,
          foreground: '#cccccc',
          foregroundLightness: 80,
          foregroundType: 'light',
          ratio: 3.2,
        },
        {
          stop: 2,
          background: '#000000',
          backgroundLightness: 0,
          foreground: '#333333',
          foregroundLightness: 20,
          foregroundType: 'dark',
          ratio: 2.5,
        },
      ];

      const result = generateFailuresSummary(failures);

      expect(result).toContain('Found 2 combinations that FAIL');
      expect(result).toContain('Stop 1');
      expect(result).toContain('Stop 2');
      expect(result).toContain('#ffffff');
      expect(result).toContain('#cccccc');
      expect(result).toContain('#000000');
      expect(result).toContain('#333333');
      expect(result).toContain('3.20:1');
      expect(result).toContain('2.50:1');
    });

    it('should show mode when provided', () => {
      const failures: ContrastFailure[] = [
        {
          mode: 'Light',
          stop: 'primary/base',
          background: '#ffffff',
          backgroundLightness: 100,
          foreground: '#cccccc',
          foregroundLightness: 80,
          foregroundType: 'on',
          ratio: 3.2,
        },
      ];

      const result = generateFailuresSummary(failures);

      expect(result).toContain('Light Mode');
      expect(result).toContain('primary/base');
    });

    it('should handle single failure', () => {
      const failures: ContrastFailure[] = [
        {
          stop: 5,
          background: '#aaaaaa',
          backgroundLightness: 67,
          foreground: '#bbbbbb',
          foregroundLightness: 73,
          foregroundType: 'light',
          ratio: 1.2,
        },
      ];

      const result = generateFailuresSummary(failures);

      expect(result).toContain('Found 1 combinations that FAIL');
      expect(result).toContain('1.20:1');
    });

    it('should include lightness percentages', () => {
      const failures: ContrastFailure[] = [
        {
          stop: 1,
          background: '#ffffff',
          backgroundLightness: 100,
          foreground: '#cccccc',
          foregroundLightness: 80,
          foregroundType: 'light',
          ratio: 3.2,
        },
      ];

      const result = generateFailuresSummary(failures);

      expect(result).toContain('(L:100%)');
      expect(result).toContain('(L:80%)');
    });
  });

  describe('generateContrastEntry', () => {
    it('should generate entry for passing contrast', () => {
      const entry: ContrastEntry = {
        label: 'Light Foreground (#ffffff)',
        hex: '#ffffff',
        lightness: 100,
        ratio: 7.5,
      };

      const result = generateContrastEntry(entry);

      expect(result).toContain('Light Foreground (#ffffff)');
      expect(result).toContain('#ffffff');
      expect(result).toContain('(L:100%)');
      expect(result).toContain('7.50:1');
      expect(result).toContain('PASS');
      expect(result).toContain('AAA ✓');
    });

    it('should generate entry for AA passing contrast', () => {
      const entry: ContrastEntry = {
        label: 'Test Color',
        hex: '#333333',
        lightness: 20,
        ratio: 5.0,
      };

      const result = generateContrastEntry(entry);

      expect(result).toContain('5.00:1');
      expect(result).toContain('PASS');
      expect(result).toContain('AA ✓');
      expect(result).not.toContain('AAA');
    });

    it('should generate entry for failing contrast', () => {
      const entry: ContrastEntry = {
        label: 'Bad Contrast',
        hex: '#aaaaaa',
        lightness: 67,
        ratio: 2.5,
      };

      const result = generateContrastEntry(entry);

      expect(result).toContain('2.50:1');
      expect(result).toContain('FAIL');
      expect(result).toContain('Does not meet WCAG standards');
    });

    it('should format ratio with 2 decimal places', () => {
      const entry: ContrastEntry = {
        label: 'Test',
        hex: '#000000',
        lightness: 0,
        ratio: 4.567,
      };

      const result = generateContrastEntry(entry);

      expect(result).toContain('4.57:1');
    });

    it('should include all required information', () => {
      const entry: ContrastEntry = {
        label: 'Complete Entry',
        hex: '#ff5733',
        lightness: 55,
        ratio: 6.2,
      };

      const result = generateContrastEntry(entry);

      expect(result).toContain('Complete Entry');
      expect(result).toContain('#ff5733');
      expect(result).toContain('(L:55%)');
      expect(result).toContain('Contrast:');
      expect(result).toContain('Status:');
      expect(result).toContain('Level:');
    });
  });

  describe('generateStandardsFooter', () => {
    it('should generate complete footer', () => {
      const result = generateStandardsFooter();

      expect(result).toContain('='.repeat(80));
      expect(result).toContain('WCAG STANDARDS');
      expect(result).toContain('AA:');
      expect(result).toContain('AAA:');
      expect(result).toContain('4.5:1');
      expect(result).toContain('7:1');
    });

    it('should include both normal and large text standards', () => {
      const result = generateStandardsFooter();

      expect(result).toContain('normal text');
      expect(result).toContain('large text');
      expect(result).toContain('18pt+');
    });

    it('should include all required ratios', () => {
      const result = generateStandardsFooter();

      expect(result).toContain('4.5:1');
      expect(result).toContain('3:1');
      expect(result).toContain('7:1');
    });
  });

  describe('passesWCAG_AA', () => {
    it('should return true for ratio >= 4.5', () => {
      expect(passesWCAG_AA(4.5)).toBe(true);
      expect(passesWCAG_AA(5.0)).toBe(true);
      expect(passesWCAG_AA(10.0)).toBe(true);
      expect(passesWCAG_AA(21.0)).toBe(true);
    });

    it('should return false for ratio < 4.5', () => {
      expect(passesWCAG_AA(4.49)).toBe(false);
      expect(passesWCAG_AA(4.0)).toBe(false);
      expect(passesWCAG_AA(3.0)).toBe(false);
      expect(passesWCAG_AA(1.0)).toBe(false);
    });

    it('should handle edge case at exactly 4.5', () => {
      expect(passesWCAG_AA(4.5)).toBe(true);
    });

    it('should handle very small differences', () => {
      expect(passesWCAG_AA(4.500001)).toBe(true);
      expect(passesWCAG_AA(4.499999)).toBe(false);
    });
  });

  describe('getWCAGLevel', () => {
    it('should return "AAA ✓" for ratio >= 7', () => {
      expect(getWCAGLevel(7.0)).toBe('AAA ✓');
      expect(getWCAGLevel(10.0)).toBe('AAA ✓');
      expect(getWCAGLevel(21.0)).toBe('AAA ✓');
    });

    it('should return "AA ✓" for ratio >= 4.5 and < 7', () => {
      expect(getWCAGLevel(4.5)).toBe('AA ✓');
      expect(getWCAGLevel(5.0)).toBe('AA ✓');
      expect(getWCAGLevel(6.9)).toBe('AA ✓');
    });

    it('should return "AA Large ✓" for ratio >= 3 and < 4.5', () => {
      expect(getWCAGLevel(3.0)).toBe('AA Large ✓');
      expect(getWCAGLevel(3.5)).toBe('AA Large ✓');
      expect(getWCAGLevel(4.4)).toBe('AA Large ✓');
    });

    it('should return fail message for ratio < 3', () => {
      expect(getWCAGLevel(2.9)).toBe('Does not meet WCAG standards');
      expect(getWCAGLevel(2.0)).toBe('Does not meet WCAG standards');
      expect(getWCAGLevel(1.0)).toBe('Does not meet WCAG standards');
    });

    it('should handle edge cases', () => {
      expect(getWCAGLevel(7.0)).toBe('AAA ✓');
      expect(getWCAGLevel(6.999)).toBe('AA ✓');
      expect(getWCAGLevel(4.5)).toBe('AA ✓');
      expect(getWCAGLevel(4.499)).toBe('AA Large ✓');
      expect(getWCAGLevel(3.0)).toBe('AA Large ✓');
      expect(getWCAGLevel(2.999)).toBe('Does not meet WCAG standards');
    });
  });

  describe('integration tests', () => {
    it('should generate complete report with all components', () => {
      const header = generateReportHeader('test-palette', '#3b82f6', 5);
      
      const failures: ContrastFailure[] = [
        {
          stop: 1,
          background: '#ffffff',
          backgroundLightness: 100,
          foreground: '#cccccc',
          foregroundLightness: 80,
          foregroundType: 'light',
          ratio: 3.2,
        },
      ];
      const summary = generateFailuresSummary(failures);
      
      const entry: ContrastEntry = {
        label: 'Test Entry',
        hex: '#ffffff',
        lightness: 100,
        ratio: 7.5,
      };
      const entryText = generateContrastEntry(entry);
      
      const footer = generateStandardsFooter();

      const fullReport = header + summary + entryText + footer;

      expect(fullReport).toContain('WCAG Contrast Report');
      expect(fullReport).toContain('test-palette');
      expect(fullReport).toContain('FAILURES SUMMARY');
      expect(fullReport).toContain('Test Entry');
      expect(fullReport).toContain('WCAG STANDARDS');
    });

    it('should handle empty failures correctly', () => {
      const summary = generateFailuresSummary([]);
      expect(summary).toContain('✅');
      expect(summary).not.toContain('❌');
    });

    it('should format multiple failures consistently', () => {
      const failures: ContrastFailure[] = [
        {
          stop: 1,
          background: '#fff',
          backgroundLightness: 100,
          foreground: '#ccc',
          foregroundLightness: 80,
          foregroundType: 'light',
          ratio: 3.0,
        },
        {
          stop: 2,
          background: '#000',
          backgroundLightness: 0,
          foreground: '#333',
          foregroundLightness: 20,
          foregroundType: 'dark',
          ratio: 2.0,
        },
        {
          stop: 3,
          background: '#aaa',
          backgroundLightness: 67,
          foreground: '#bbb',
          foregroundLightness: 73,
          foregroundType: 'light',
          ratio: 1.5,
        },
      ];

      const result = generateFailuresSummary(failures);
      const failureCount = (result.match(/❌/g) || []).length;

      expect(failureCount).toBe(3);
      expect(result).toContain('Found 3 combinations');
    });
  });
});