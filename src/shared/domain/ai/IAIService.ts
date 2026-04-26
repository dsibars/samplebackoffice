export interface IAIService {
  prompt(profileId: string, model: string, input: string): Promise<string>;
  getModels(profileId: string): Promise<string[]>;
}
