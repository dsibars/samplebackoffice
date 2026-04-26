import { IAIService } from '../domain/ai/IAIService';
import { IAIProvider } from '../domain/ai/IAIProvider';
import { AIConfiguration, AIProviderType } from '../domain/ai/AIProfile';

export class AIService implements IAIService {
  private providers: Map<AIProviderType, IAIProvider> = new Map();

  constructor(private getConfig: () => AIConfiguration) {}

  registerProvider(type: AIProviderType, provider: IAIProvider) {
    this.providers.set(type, provider);
  }

  async getModels(profileId: string): Promise<string[]> {
    const profile = this.getProfile(profileId);
    const provider = this.getProvider(profile.provider);
    return provider.getModels(profile.settings);
  }

  async prompt(profileId: string, model: string, input: string): Promise<string> {
    const profile = this.getProfile(profileId);
    const provider = this.getProvider(profile.provider);
    return provider.prompt(model, input, profile.settings);
  }

  private getProfile(profileId: string) {
    const config = this.getConfig();
    const profile = config.profiles.find(p => p.id === profileId);
    if (!profile) throw new Error(`Profile with id ${profileId} not found`);
    return profile;
  }

  private getProvider(type: AIProviderType) {
    const provider = this.providers.get(type);
    if (!provider) throw new Error(`AI Provider ${type} not registered`);
    return provider;
  }
}
