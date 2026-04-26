import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider } from '../../domain/ai/IAIProvider';

export class GeminiProvider implements IAIProvider {
  async getModels(_settings: Record<string, string>): Promise<string[]> {
    // In a real scenario, this could fetch from Google's models.list API
    return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  }

  async prompt(model: string, input: string, settings: Record<string, string>): Promise<string> {
    const apiKey = settings.apiKey;
    if (!apiKey) throw new Error('Gemini API Key is missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(input);
    const response = await result.response;
    return response.text();
  }
}
