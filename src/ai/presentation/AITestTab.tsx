import { useState, useEffect } from 'react';
import { AIConfiguration } from '../../shared/domain/ai/AIProfile';

export function AITestTab() {
  const [config, setConfig] = useState<AIConfiguration>({ profiles: [] });
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const loaded = await window.electronAPI?.readAIConfiguration();
      if (loaded) {
        setConfig(loaded);
        const savedActive = localStorage.getItem('active-ai-profile');
        if (savedActive && loaded.profiles.some(p => p.id === savedActive)) {
          setSelectedProfileId(savedActive);
          loadModels(savedActive);
        } else if (loaded.profiles.length > 0) {
          setSelectedProfileId(loaded.profiles[0].id);
          loadModels(loaded.profiles[0].id);
        }
      }
    } catch (e) {
      setError('Failed to load AI configuration.');
    }
  };

  const loadModels = async (profileId: string) => {
    try {
      const availableModels = await window.electronAPI?.aiGetModels(profileId);
      if (availableModels) {
        setModels(availableModels);
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0]);
        }
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load models for the selected profile.');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProfileId(id);
    loadModels(id);
  };

  const handleSend = async () => {
    if (!prompt.trim() || !selectedProfileId || !selectedModel) return;

    setLoading(true);
    setError(null);
    setResult('');
    try {
      const response = await window.electronAPI?.aiPrompt(selectedProfileId, selectedModel, prompt);
      setResult(response || 'No response received.');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while generating the response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Profile</label>
            <select
              value={selectedProfileId}
              onChange={handleProfileChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="" disabled>Select a profile</option>
              {config.profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.provider})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={models.length === 0}
            >
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              {models.length === 0 && <option value="">No models available</option>}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-3 min-h-[100px]"
              placeholder="Type your message here..."
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim() || !selectedProfileId || !selectedModel}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
              loading || !prompt.trim() || !selectedProfileId || !selectedModel
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Prompt'}
          </button>
        </div>
      </div>

      {(result || error) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Result</h3>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm mb-4">
              {error}
            </div>
          )}
          {result && (
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
