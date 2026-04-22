import Papa from 'papaparse';
import { TableData, SupportedFormat } from '../domain/DataModel';

export class DataFileService {
  /**
   * Parses raw file content into a unified TableData shape.
   */
  public static parseRawData(rawContent: string, format: SupportedFormat, filePath?: string, fileName?: string): TableData {
    let headers: string[] = [];
    let rows: Record<string, any>[] = [];

    if (format === 'csv') {
      const parsed = Papa.parse(rawContent, { header: true, skipEmptyLines: true });
      if (parsed.meta.fields) {
        headers = parsed.meta.fields;
      } else if (parsed.data.length > 0) {
        headers = Object.keys(parsed.data[0] as object);
      }
      rows = parsed.data as Record<string, any>[];
    } else if (format === 'json') {
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(rawContent);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      // Handle simple arrays of objects
      if (Array.isArray(parsedJson)) {
        rows = parsedJson;
      } else if (typeof parsedJson === 'object' && parsedJson !== null) {
        // Handle {"data": [...]} patterns. If we can't find an array, wrap the object in an array.
        const arrayProps = Object.keys(parsedJson).filter((key) => Array.isArray(parsedJson[key]));
        if (arrayProps.length > 0) {
          rows = parsedJson[arrayProps[0]];
        } else {
          rows = [parsedJson];
        }
      } else {
        throw new Error('JSON is not an object or array suitable for table viewing.');
      }

      if (rows.length > 0) {
        // Collect all distinct keys across objects in case of sparse JSON arrays
        const keySet = new Set<string>();
        rows.forEach(r => {
          if (r && typeof r === 'object') {
            Object.keys(r).forEach(k => keySet.add(k));
          }
        });
        headers = Array.from(keySet);
      }
    }

    return {
      headers,
      rows,
      format,
      originalPath: filePath,
      originalFileName: fileName
    };
  }

  /**
   * Converts the unified TableData back to raw file content format strictly matching its original setup.
   */
  public static generateRawContent(table: TableData): string {
    if (table.format === 'csv') {
      return Papa.unparse({
        fields: table.headers,
        data: table.rows
      });
    } else {
      return JSON.stringify(table.rows, null, 2);
    }
  }

  /**
   * Identifies format essentially based on file extension.
   */
  public static detectFormat(fileName: string): SupportedFormat {
    if (fileName.toLowerCase().endsWith('.csv')) {
      return 'csv';
    }
    return 'json';
  }
}
