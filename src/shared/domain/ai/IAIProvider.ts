export interface IAIProvider {
  prompt(model: string, input: string, settings: Record<string, string>): Promise<string>;
  getModels(settings: Record<string, string>): Promise<string[]>;
}
