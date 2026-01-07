import * as fs from 'fs';
import * as path from 'path';
import { saveToFile, saveJsonToFile, ensureDirectory } from '../src/file-utils';

describe('file-utils', () => {
  const testDir = path.join(__dirname, 'test-output');
  const nestedDir = path.join(testDir, 'nested', 'deep', 'path');

  beforeEach(() => {
    // Clean up test directory before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('saveToFile', () => {
    it('should save content to a file', () => {
      const filepath = path.join(testDir, 'test.txt');
      const content = 'Hello, World!';

      saveToFile(content, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('should create directories if they do not exist', () => {
      const filepath = path.join(nestedDir, 'test.txt');
      const content = 'Nested content';

      saveToFile(content, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('should overwrite existing files', () => {
      const filepath = path.join(testDir, 'test.txt');
      const content1 = 'First content';
      const content2 = 'Second content';

      saveToFile(content1, filepath);
      saveToFile(content2, filepath);

      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(content2);
    });

    it('should save empty string', () => {
      const filepath = path.join(testDir, 'empty.txt');
      const content = '';

      saveToFile(content, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe('');
    });

    it('should save multiline content', () => {
      const filepath = path.join(testDir, 'multiline.txt');
      const content = 'Line 1\nLine 2\nLine 3';

      saveToFile(content, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('should handle special characters', () => {
      const filepath = path.join(testDir, 'special.txt');
      const content = 'Special chars: åäö €£¥ 你好 🎨';

      saveToFile(content, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(content);
    });
  });

  describe('saveJsonToFile', () => {
    it('should save JSON object to file with formatting', () => {
      const filepath = path.join(testDir, 'data.json');
      const data = { name: 'test', value: 42, nested: { key: 'value' } };

      saveJsonToFile(data, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      const parsedData = JSON.parse(savedContent);
      expect(parsedData).toEqual(data);
    });

    it('should format JSON with 2-space indentation', () => {
      const filepath = path.join(testDir, 'formatted.json');
      const data = { key: 'value' };

      saveJsonToFile(data, filepath);

      const savedContent = fs.readFileSync(filepath, 'utf-8');
      const expected = JSON.stringify(data, null, 2);
      expect(savedContent).toBe(expected);
    });

    it('should create directories for JSON files', () => {
      const filepath = path.join(nestedDir, 'data.json');
      const data = { test: true };

      saveJsonToFile(data, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it('should save empty object', () => {
      const filepath = path.join(testDir, 'empty.json');
      const data = {};

      saveJsonToFile(data, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual({});
    });

    it('should save array', () => {
      const filepath = path.join(testDir, 'array.json');
      const data = [1, 2, 3, { key: 'value' }];

      saveJsonToFile(data, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(data);
    });

    it('should handle nested objects', () => {
      const filepath = path.join(testDir, 'nested.json');
      const data = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };

      saveJsonToFile(data, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(data);
    });

    it('should handle null values', () => {
      const filepath = path.join(testDir, 'null.json');
      const data = { value: null };

      saveJsonToFile(data, filepath);

      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(data);
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', () => {
      const dirPath = path.join(testDir, 'new-dir');

      ensureDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it('should create nested directories', () => {
      ensureDirectory(nestedDir);

      expect(fs.existsSync(nestedDir)).toBe(true);
      expect(fs.statSync(nestedDir).isDirectory()).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      const dirPath = path.join(testDir, 'existing-dir');

      ensureDirectory(dirPath);
      expect(() => ensureDirectory(dirPath)).not.toThrow();

      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should handle multiple levels of nesting', () => {
      const deepPath = path.join(testDir, 'a', 'b', 'c', 'd', 'e');

      ensureDirectory(deepPath);

      expect(fs.existsSync(deepPath)).toBe(true);
      expect(fs.statSync(deepPath).isDirectory()).toBe(true);
    });

    it('should be idempotent', () => {
      const dirPath = path.join(testDir, 'idempotent');

      ensureDirectory(dirPath);
      ensureDirectory(dirPath);
      ensureDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should work with saveToFile and ensureDirectory together', () => {
      const dirPath = path.join(testDir, 'integration-dir');
      const filepath = path.join(dirPath, 'file.txt');

      ensureDirectory(dirPath);
      saveToFile('test content', filepath);

      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.existsSync(filepath)).toBe(true);
      expect(fs.readFileSync(filepath, 'utf-8')).toBe('test content');
    });

    it('should save multiple files to the same directory', () => {
      const dirPath = path.join(testDir, 'multi-files');

      saveToFile('file 1', path.join(dirPath, 'file1.txt'));
      saveToFile('file 2', path.join(dirPath, 'file2.txt'));
      saveJsonToFile({ data: 'json' }, path.join(dirPath, 'data.json'));

      expect(fs.existsSync(path.join(dirPath, 'file1.txt'))).toBe(true);
      expect(fs.existsSync(path.join(dirPath, 'file2.txt'))).toBe(true);
      expect(fs.existsSync(path.join(dirPath, 'data.json'))).toBe(true);
    });
  });
});