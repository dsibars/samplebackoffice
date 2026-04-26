import { APIManagerConfig } from '../domain/APIManager';

const STORAGE_KEY = 'api-manager-config';

export class LocalStorageAPIManagerStore {
  save(config: APIManagerConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  load(): APIManagerConfig {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        environments: [
          { id: '1', name: 'dev', baseUrl: '' },
          { id: '2', name: 'sbox', baseUrl: '' },
          { id: '3', name: 'live', baseUrl: '' }
        ],
        services: []
      };
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse API Manager config', e);
      return { environments: [], services: [] };
    }
  }

  exportConfig(): string {
    return JSON.stringify(this.load(), null, 2);
  }

  importConfig(json: string): void {
    try {
      const config = JSON.parse(json);
      this.save(config);
    } catch (e) {
      throw new Error('Invalid JSON configuration');
    }
  }
}
