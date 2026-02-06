import {
  printHeader,
  printSuccess,
  printError,
  printInfo,
  printTip,
  printFileExport,
  printPaletteSummary,
  printBaseColorInfo,
  printContrastAnalysisHeader,
  printSampleContrastHeader,
  printExportHeader,
  printCompletion,
  printFigmaInstructions,
  printContrastLine,
  printOpticsContrastSample,
  printAnalysisResult,
} from '../src/console-utils';

describe('console-utils', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('printHeader', () => {
    it('should print header with newlines', () => {
      printHeader('Test Header');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nTest Header\n');
    });

    it('should handle empty string', () => {
      printHeader('');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n\n');
    });
  });

  describe('printSuccess', () => {
    it('should print success message with checkmark', () => {
      printSuccess('All tests passed');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ All tests passed');
    });
  });

  describe('printError', () => {
    it('should print error message with X mark', () => {
      printError('Something went wrong');
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error: Something went wrong');
    });
  });

  describe('printInfo', () => {
    it('should print info message without indent', () => {
      printInfo('Info message');
      expect(consoleLogSpy).toHaveBeenCalledWith('Info message');
    });

    it('should print info message with indent', () => {
      printInfo('Indented message', 4);
      expect(consoleLogSpy).toHaveBeenCalledWith('    Indented message');
    });

    it('should handle large indents', () => {
      printInfo('Message', 10);
      expect(consoleLogSpy).toHaveBeenCalledWith('          Message');
    });
  });

  describe('printTip', () => {
    it('should print tip message with lightbulb', () => {
      printTip('This is helpful');
      expect(consoleLogSpy).toHaveBeenCalledWith('💡 Tip: This is helpful');
    });
  });

  describe('printFileExport', () => {
    it('should print file export message', () => {
      printFileExport('Figma export', 'palette.json');
      expect(consoleLogSpy).toHaveBeenCalledWith('   ✓ Figma export: palette.json');
    });

    it('should handle different labels and filenames', () => {
      printFileExport('Report', 'contrast-report.txt');
      expect(consoleLogSpy).toHaveBeenCalledWith('   ✓ Report: contrast-report.txt');
    });
  });

  describe('printPaletteSummary', () => {
    it('should print palette summary with color, name, and stops', () => {
      printPaletteSummary('#3b82f6', 'primary', 16);
      expect(consoleLogSpy).toHaveBeenCalledWith('🎨 OpticsThemeBuilder\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('Generating palette from color: #3b82f6');
      expect(consoleLogSpy).toHaveBeenCalledWith('Palette name: primary');
      expect(consoleLogSpy).toHaveBeenCalledWith('Stops: 16\n');
    });

    it('should print palette summary with format string', () => {
      printPaletteSummary('#ff0000', 'danger', 'optics');
      expect(consoleLogSpy).toHaveBeenCalledWith('Format: optics\n');
    });
  });

  describe('printBaseColorInfo', () => {
    it('should print base color info with HSL values', () => {
      printBaseColorInfo(16, '#3b82f6', 217, 91, 60);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated 16 color stops');
      expect(consoleLogSpy).toHaveBeenCalledWith('   Base color: #3b82f6');
      expect(consoleLogSpy).toHaveBeenCalledWith('   H: 217° S: 91% L: 60%\n');
    });

    it('should print base color info without HSL values', () => {
      printBaseColorInfo(10, '#ffffff');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated 10 color stops');
      expect(consoleLogSpy).toHaveBeenCalledWith('   Base color: #ffffff\n');
    });

    it('should handle undefined HSL values', () => {
      printBaseColorInfo(5, '#000000', undefined, undefined, undefined);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Generated 5 color stops');
      expect(consoleLogSpy).toHaveBeenCalledWith('   Base color: #000000\n');
    });
  });

  describe('printContrastAnalysisHeader', () => {
    it('should print contrast analysis header', () => {
      printContrastAnalysisHeader();
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Contrast Analysis:');
    });
  });

  describe('printSampleContrastHeader', () => {
    it('should print sample contrast analysis header', () => {
      printSampleContrastHeader();
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Contrast Analysis (sample):');
    });
  });

  describe('printExportHeader', () => {
    it('should print export header', () => {
      printExportHeader();
      expect(consoleLogSpy).toHaveBeenCalledWith('\n📦 Exporting Figma files...');
    });
  });

  describe('printCompletion', () => {
    it('should print completion message without format', () => {
      printCompletion();
      expect(consoleLogSpy).toHaveBeenCalledWith('\n✨ Done! Your palette is ready.\n');
    });

    it('should print completion message with format', () => {
      printCompletion('Optics');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n✨ Done! Your Optics palette is ready.\n');
    });
  });

  describe('printFigmaInstructions', () => {
    it('should print single mode instructions', () => {
      printFigmaInstructions(false);
      expect(consoleLogSpy).toHaveBeenCalledWith('💡 Tip: Import the .json file into Figma Variables panel');
    });

    it('should print multiple modes instructions', () => {
      printFigmaInstructions(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('💡 Tip: Import each .tokens.json file into Figma Variables panel');
      expect(consoleLogSpy).toHaveBeenCalledWith('   1. Open Figma → Variables panel');
      expect(consoleLogSpy).toHaveBeenCalledWith('   2. Import Light mode file, then Dark mode file');
      expect(consoleLogSpy).toHaveBeenCalledWith('   3. Figma will automatically create a variable collection with both modes');
    });

    it('should print single mode instructions by default', () => {
      printFigmaInstructions();
      expect(consoleLogSpy).toHaveBeenCalledWith('💡 Tip: Import the .json file into Figma Variables panel');
    });
  });

  describe('printContrastLine', () => {
    it('should print contrast line with numeric stop', () => {
      printContrastLine(0, '#ffffff', '#000000', '✅', 21, '✅', 21);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '   Stop  0: #ffffff → #000000 (L:✅ 21.0 D:✅ 21.0)'
      );
    });

    it('should print contrast line with string stop', () => {
      printContrastLine('plus-max', '#ffffff', '#000000', '✅', 21, '❌', 3);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '   Stop plus-max    : #ffffff → #000000 (L:✅ 21.0 D:❌ 3.0)'
      );
    });

    it('should format decimal contrast ratios', () => {
      printContrastLine(5, '#f0f0f0', '#050505', '✅', 12.5, '✅', 18.3);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('12.5');
      expect(call).toContain('18.3');
    });
  });

  describe('printOpticsContrastSample', () => {
    it('should print Optics contrast sample for light mode', () => {
      printOpticsContrastSample('plus-max', 'light', '#ffffff', 21, 18);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('plus-max');
      expect(call).toContain('Light');
      expect(call).toContain('#ffffff');
      expect(call).toContain('21.0');
      expect(call).toContain('18.0');
    });

    it('should print Optics contrast sample for dark mode', () => {
      printOpticsContrastSample('base', 'dark', '#000000', 18, 15);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('base');
      expect(call).toContain('Dark');
      expect(call).toContain('#000000');
      expect(call).toContain('18.0');
      expect(call).toContain('15.0');
    });
  });

  describe('printAnalysisResult', () => {
    it('should print analysis result with passing contrast', () => {
      printAnalysisResult('#ffffff', '#000000', 21, true, true);
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🔍 Contrast Analysis\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('   Background: #ffffff');
      expect(consoleLogSpy).toHaveBeenCalledWith('   Foreground: #000000');
      expect(consoleLogSpy).toHaveBeenCalledWith('   Contrast Ratio: 21.00:1\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('   WCAG AA (4.5:1):  ✅ Pass');
      expect(consoleLogSpy).toHaveBeenCalledWith('   WCAG AAA (7:1):   ✅ Pass\n');
    });

    it('should print analysis result with failing contrast', () => {
      printAnalysisResult('#f0f0f0', '#e0e0e0', 1.2, false, false);
      expect(consoleLogSpy).toHaveBeenCalledWith('   Contrast Ratio: 1.20:1\n');
      expect(consoleLogSpy).toHaveBeenCalledWith('   WCAG AA (4.5:1):  ❌ Fail');
      expect(consoleLogSpy).toHaveBeenCalledWith('   WCAG AAA (7:1):   ❌ Fail\n');
    });

    it('should print analysis result with partial pass', () => {
      printAnalysisResult('#ffffff', '#404040', 12, true, false);
      expect(consoleLogSpy).toHaveBeenCalledWith('   WCAG AA (4.5:1):  ✅ Pass');
      expect(consoleLogSpy).toHaveBeenCalledWith('   WCAG AAA (7:1):   ❌ Fail\n');
    });
  });
});
