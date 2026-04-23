export interface ClientItem {
  code: string;
  mandatory: boolean;
  description: string;
  allowed_values?: string[];
}

export interface ClientFunction {
  code: string;
  description?: string;
  arguments: ClientItem[];
  result: ClientItem;
}

export interface ClientEntity {
  code: string;
  description: string;
  allowed_values: string[];
}

export interface BuilderConfiguration {
  id: string;
  name: string;
  entities: ClientEntity[];
  functions: ClientFunction[];
}

export type ActionNodeType = 'item' | 'function';

export interface ActionNode {
  type: ActionNodeType;
  value?: string; // If 'item'
  functionCode?: string; // If 'function'
  args?: Record<string, ActionNode>; // If 'function' keys are argument codes
}

export interface ImplementationActionRow {
  id: string; // for drag & drop or ordering
  name?: string; // friendly name for the row
  entities: Record<string, string>; // e.g. { moment: 'IN', target: 'HEADER' }
  action: ActionNode | null;
}

export interface ClientImplementation {
  id: string;
  name?: string;
  timestamp: number;
  configurationId: string;
  actions: ImplementationActionRow[];
}
