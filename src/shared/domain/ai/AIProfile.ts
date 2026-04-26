export type AIProvider = 'gemini' | 'glean';

export interface AIProfile {
  id: string;
  name: string;
  description: string;
  provider: AIProvider;
  apiKey: string;
  gleanInstance?: string; // Required for Glean
}

export interface AIConfiguration {
  profiles: AIProfile[];
}
