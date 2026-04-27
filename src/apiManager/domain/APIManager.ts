export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export enum ArgumentType {
  URL = 'url',
  BODY = 'body',
  BODY_JSON_PROPERTY = 'body_json_property',
  HEADER = 'header'
}

export interface ActionArgument {
  name: string;
  type: ArgumentType;
}

export interface Action {
  id: string;
  name: string;
  path: string;
  method: HTTPMethod;
  arguments: ActionArgument[];
}

export interface Collection {
  id: string;
  name: string;
  path?: string;
  actions: Action[];
}

export interface Service {
  id: string;
  name: string;
  path: string;
  collections: Collection[];
}

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
}

export interface APIManagerConfig {
  environments: Environment[];
  services: Service[];
}

export interface RequestResult {
  status: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  };
  error?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  envName: string;
  serviceName: string;
  actionName: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  arguments: Record<string, string>;
}
