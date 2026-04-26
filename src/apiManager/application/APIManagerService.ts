import {
  APIManagerConfig,
  Action,
  ArgumentType,
  Environment,
  RequestResult,
  Service,
  Collection
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
    const bodyObj: Record<string, any> = {};

    action.arguments.forEach(arg => {
      const value = args[arg.name] || '';
      if (arg.type === ArgumentType.HEADER) {
        headers[arg.name] = value;
      } else if (arg.type === ArgumentType.BODY) {
        bodyObj[arg.name] = value;
      }
    });

    const body = Object.keys(bodyObj).length > 0 ? JSON.stringify(bodyObj) : undefined;
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    if (window.electronAPI) {
      return await window.electronAPI.apiManager.request({
        url,
        method,
        headers,
        body
      });
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

        return {
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          headers: responseHeaders
        };
      } catch (e: any) {
        return {
          status: 0,
          statusText: e.message || 'Network Error',
          body: '',
          headers: {}
        };
      }
    }
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
