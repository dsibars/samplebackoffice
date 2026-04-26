import { useState, useEffect } from 'react';
import { AIConfiguration, AIProfile, AIProviderType } from '../../shared/domain/ai/AIProfile';

export function AIConfigurationTab() {
  const [config, setConfig] = useState<AIConfiguration>({ profiles: [] });
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState<Partial<AIProfile> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
    const savedActive = localStorage.getItem('active-ai-profile');
    if (savedActive) setActiveProfileId(savedActive);
  }, []);

  const loadConfig = async () => {
    try {
      const loaded = await window.electronAPI?.ai.readConfiguration();
      if (loaded) setConfig(loaded);
    } catch (e) {
      console.error(e);
      setError('Failed to load AI configuration.');
    }
  };

  const handleSave = async (profile: Partial<AIProfile>) => {
    const apiKey = (profile as any).apiKey || profile.settings?.apiKey;
    const gleanInstance = (profile as any).gleanInstance || profile.settings?.instance;

    if (!profile.name || !profile.provider || !apiKey) {
      setError('Name, Provider, and API Key are required.');
      return;
    }

    if (profile.provider === 'glean' && !gleanInstance) {
        setError('Glean instance is required for Glean provider.');
        return;
    }

    const settings: Record<string, string> = { apiKey };
    if (gleanInstance) settings.instance = gleanInstance;

    const profileToSave: AIProfile = {
      id: profile.id || crypto.randomUUID(),
      name: profile.name!,
      description: profile.description || '',
      provider: profile.provider!,
      settings
    };

    const newProfiles = [...config.profiles];
    if (profile.id) {
      const index = newProfiles.findIndex(p => p.id === profile.id);
      newProfiles[index] = profileToSave;
    } else {
      newProfiles.push(profileToSave);
    }

    const newConfig = { profiles: newProfiles };
    try {
      await window.electronAPI?.ai.saveConfiguration(newConfig);
      setConfig(newConfig);
      setEditingProfile(null);
      setError(null);
    } catch (e) {
      setError('Failed to save. Please ensure you have write permissions to ~/.samplebackoffice/ai_credentials.json');
    }
  };

  const handleDelete = async (id: string) => {
      const newProfiles = config.profiles.filter(p => p.id !== id);
      const newConfig = { profiles: newProfiles };
      try {
        await window.electronAPI?.ai.saveConfiguration(newConfig);
        setConfig(newConfig);
        if (activeProfileId === id) {
            setActiveProfileId('');
            localStorage.removeItem('active-ai-profile');
        }
      } catch (e) {
          setError('Failed to delete profile.');
      }
  };

  const selectActive = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem('active-ai-profile', id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">AI Profiles</h2>
          <button
            onClick={() => setEditingProfile({ name: '', description: '', provider: 'gemini', settings: {} })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Profile
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {config.profiles.map((profile) => (
                <tr key={profile.id} className={activeProfileId === profile.id ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="radio"
                      name="activeProfile"
                      checked={activeProfileId === profile.id}
                      onChange={() => selectActive(profile.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{profile.provider}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{profile.description}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingProfile(profile)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {config.profiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                    No profiles configured. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingProfile.id ? 'Edit AI Profile' : 'New AI Profile'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingProfile.name || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Personal Gemini"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <select
                  value={editingProfile.provider || 'gemini'}
                  onChange={(e) => setEditingProfile({ ...editingProfile, provider: e.target.value as AIProviderType })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="gemini">Gemini</option>
                  <option value="glean">Glean</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={(editingProfile as any).apiKey || editingProfile.settings?.apiKey || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, apiKey: e.target.value } as any)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter API Key"
                />
              </div>
              {editingProfile.provider === 'glean' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Glean Instance</label>
                  <input
                    type="text"
                    value={(editingProfile as any).gleanInstance || editingProfile.settings?.instance || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, gleanInstance: e.target.value } as any)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="company-name"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingProfile.description || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="What is this profile for?"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingProfile)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
