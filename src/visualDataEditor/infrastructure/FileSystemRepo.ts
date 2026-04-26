import { ElectronFileResult } from '../domain/DataModel';

export class FileSystemRepo {
  /**
   * Triggers the OS file picker and returns file details.
   */
  public static async pickFile(): Promise<ElectronFileResult | null> {
    if (window.electronAPI) {
      return await window.electronAPI.files.openFile();
    } else {
      // Basic fallback using HTML5 input could be implemented here for Web environments
      alert('File picking natively requires the Electron environment context.');
      return null;
    }
  }

  /**
   * Overwrites the provided file path with the content securely via IPC.
   */
  public static async overwriteFile(filePath: string, content: string): Promise<boolean> {
    if (window.electronAPI) {
      return await window.electronAPI.files.saveFile(filePath, content);
    } else {
      alert('Overwriting files natively requires the Electron environment context.');
      return false;
    }
  }

  /**
   * Copies string content to clipboard.
   */
  public static async copyToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      // Fallback could be done here
    }
  }
}
