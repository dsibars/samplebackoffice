import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from './GeminiProvider';

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    provider = new GeminiProvider();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch and filter models correctly', async () => {
    const mockModels = {
      models: [
        { name: 'models/gemini-1.5-pro', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/embedding-001', supportedGenerationMethods: ['embedContent'] },
      ]
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockModels,
    });

    const models = await provider.getModels({ apiKey: 'test-key' });

    expect(fetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models?key=test-key'
    );
    expect(models).toEqual(['gemini-1.5-pro', 'gemini-1.5-flash']);
    expect(models).not.toContain('embedding-001');
  });

  it('should throw error if apiKey is missing', async () => {
    await expect(provider.getModels({})).rejects.toThrow('Gemini API Key is missing');
  });

  it('should propagate API errors', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'Invalid API Key' } }),
    });

    await expect(provider.getModels({ apiKey: 'invalid' })).rejects.toThrow(
      'Failed to fetch Gemini models: Unauthorized - Invalid API Key'
    );
  });
});
