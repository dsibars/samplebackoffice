export type AIProviderType = 'gemini' | 'glean';

export interface AIProfile {
  id: string;
  name: string;
  description: string;
  provider: AIProviderType;
  settings: Record<string, string>;
}

export interface AIConfiguration {
  profiles: AIProfile[];
}
