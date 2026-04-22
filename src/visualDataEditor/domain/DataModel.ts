export type SupportedFormat = 'json' | 'csv';

export interface TableData {
  headers: string[];
  rows: Record<string, any>[];
  originalPath?: string;
  originalFileName?: string;
  format: SupportedFormat;
}

export interface ElectronFileResult {
  filePath: string;
  content: string;
  fileName: string;
}
