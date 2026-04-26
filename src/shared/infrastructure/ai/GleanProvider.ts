import { IAIProvider } from '../../domain/ai/IAIProvider';

export class GleanProvider implements IAIProvider {
  async getModels(_settings: Record<string, string>): Promise<string[]> {
    return ['chat'];
  }

  async prompt(_model: string, input: string, settings: Record<string, string>): Promise<string> {
    const apiKey = settings.apiKey;
    const instance = settings.instance;

    if (!apiKey || !instance) {
      throw new Error('Glean API Key or Instance is missing');
    }

    const url = `https://${instance}-be.glean.com/api/v1/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
}
