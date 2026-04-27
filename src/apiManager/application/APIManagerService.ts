import {
  APIManagerConfig,
  Action,
  ArgumentType,
  Environment,
  RequestResult,
  Service,
  Collection,
  HistoryEntry
} from '../domain/APIManager';
import { LocalStorageAPIManagerStore } from '../infrastructure/LocalStorageAPIManagerStore';

export class APIManagerService {
  private store: LocalStorageAPIManagerStore;

  constructor(store: LocalStorageAPIManagerStore) {
    this.store = store;
  }

  getConfig(): APIManagerConfig {
    return this.store.load();
  }

  saveConfig(config: APIManagerConfig): void {
    this.store.save(config);
  }

  async executeAction(
    environment: Environment,
    service: Service,
    collection: Collection,
    action: Action,
    args: Record<string, string>
  ): Promise<RequestResult> {
    let url = this.buildUrl(environment, service, collection, action, args);
    const method = action.method;
    const headers: Record<string, string> = {};
    let body: string | undefined = undefined;
    const bodyObj: Record<string, any> = {};

    action.arguments.forEach(arg => {
      const value = args[arg.name] || '';
      if (arg.type === ArgumentType.HEADER) {
        headers[arg.name] = value;
      } else if (arg.type === ArgumentType.BODY) {
        body = value;
      } else if (arg.type === ArgumentType.BODY_JSON_PROPERTY) {
        bodyObj[arg.name] = value;
      }
    });

    if (Object.keys(bodyObj).length > 0) {
      body = JSON.stringify(bodyObj);
      headers['Content-Type'] = 'application/json';
    }

    const requestDetails = { url, method, headers, body };
    let result: RequestResult;

    if (window.electronAPI) {
      try {
        result = await window.electronAPI.apiManager.request(requestDetails);
      } catch (e: any) {
        result = {
          status: 0,
          statusText: 'Error',
          body: '',
          headers: {},
          error: e.toString()
        };
      }
    } else {
      // Fallback for web environment (might hit CORS)
      try {
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseBody = await response.text();
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((v, k) => { responseHeaders[k] = v; });

        result = {
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          headers: responseHeaders
        };
      } catch (e: any) {
        result = {
          status: 0,
          statusText: 'Network Error',
          body: '',
          headers: {},
          error: e.toString()
        };
      }
    }

    result.request = requestDetails;
    this.addToHistory(environment, service, action, args, result);
    return result;
  }

  private addToHistory(
    environment: Environment,
    service: Service,
    action: Action,
    args: Record<string, string>,
    result: RequestResult
  ): void {
    const history = this.getHistory();
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      envName: environment.name,
      serviceName: service.name,
      actionName: action.name,
      method: action.method,
      url: result.request?.url || '',
      status: result.status,
      statusText: result.statusText,
      arguments: { ...args }
    };
    history.unshift(entry);
    localStorage.setItem('api-manager-history', JSON.stringify(history.slice(0, 100))); // Keep last 100
  }

  getHistory(): HistoryEntry[] {
    const historyStr = localStorage.getItem('api-manager-history');
    if (!historyStr) return [];
    try {
      return JSON.parse(historyStr);
    } catch {
      return [];
    }
  }

  clearHistory(): void {
    localStorage.removeItem('api-manager-history');
  }

  private buildUrl(
    environment: Environment,
    service: Service,
    collection: Collection,
    action: Action,
    args: Record<string, string>
  ): string {
    let baseUrl = environment.baseUrl.replace(/\/$/, '');
    let servicePath = service.path.replace(/^\/|\/$/g, '');
    let collectionPath = collection.path ? collection.path.replace(/^\/|\/$/g, '') : '';
    let actionPath = action.path.replace(/^\/|\/$/g, '');

    // Replace variables in paths
    const replaceVars = (path: string) => {
      return path.replace(/{(\w+)}/g, (_, name) => args[name] || `{${name}}`);
    };

    servicePath = replaceVars(servicePath);
    collectionPath = replaceVars(collectionPath);
    actionPath = replaceVars(actionPath);

    let fullPath = [servicePath, collectionPath, actionPath]
      .filter(p => p.length > 0)
      .join('/');

    return `${baseUrl}/${fullPath}`;
  }
}
