import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIService } from '../domain/ai/IAIService';
import { AIConfiguration } from '../domain/ai/AIProfile';

export class AIService implements IAIService {
  constructor(private getConfig: () => AIConfiguration) {}

  async getModels(profileId: string): Promise<string[]> {
    const config = this.getConfig();
    const profile = config.profiles.find(p => p.id === profileId);
    if (!profile) throw new Error('Profile not found');

    if (profile.provider === 'gemini') {
      return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    } else if (profile.provider === 'glean') {
      return ['chat'];
    }
    return [];
  }

  async prompt(profileId: string, model: string, input: string): Promise<string> {
    const config = this.getConfig();
    const profile = config.profiles.find(p => p.id === profileId);
    if (!profile) throw new Error('Profile not found');

    if (profile.provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(profile.apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });
      const result = await geminiModel.generateContent(input);
      const response = await result.response;
      return response.text();
    } else if (profile.provider === 'glean') {
      if (!profile.gleanInstance) throw new Error('Glean instance not configured');

      const url = `https://${profile.gleanInstance}-be.glean.com/api/v1/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ fragments: [{ text: input }] }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Glean API error: ${response.status} ${errorText}`);
      }

      const data: any = await response.json();
      return data.messages?.[0]?.fragments?.[0]?.text || 'No response from Glean';
    }

    throw new Error('Unsupported provider');
  }
}
