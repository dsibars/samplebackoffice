import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider } from '../../domain/ai/IAIProvider';

export class GeminiProvider implements IAIProvider {
  async getModels(settings: Record<string, string>): Promise<string[]> {
    const apiKey = settings.apiKey;
    if (!apiKey) throw new Error('Gemini API Key is missing');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch Gemini models: ${response.statusText}${
          errorData.error?.message ? ` - ${errorData.error.message}` : ''
        }`
      );
    }

    const data = await response.json();
    const models = data.models || [];

    return models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''));
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
