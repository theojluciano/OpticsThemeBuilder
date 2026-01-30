import * as fs from 'fs';
import * as path from 'path';

/**
 * Save content to file, creating directories as needed
 */
export function saveToFile(content: string, filepath: string): void {
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Save JSON content to file with formatting
 */
export function saveJsonToFile(data: any, filepath: string): void {
  const content = JSON.stringify(data, null, 2);
  saveToFile(content, filepath);
}

/**
 * Ensure directory exists, creating it if necessary
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Export multiple files at once
 * Returns the paths of all exported files
 */
export interface FileExport {
  label: string;
  filename: string;
  content: string;
}

export function exportFiles(outputDir: string, files: FileExport[]): string[] {
  ensureDirectory(outputDir);
  
  const exportedPaths: string[] = [];
  
  files.forEach(file => {
    const filepath = path.join(outputDir, file.filename);
    saveToFile(file.content, filepath);
    exportedPaths.push(filepath);
  });
  
  return exportedPaths;
}