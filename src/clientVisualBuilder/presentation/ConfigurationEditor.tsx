import React, { useState, useEffect } from 'react';
import { BuilderConfiguration } from '../domain/models';

interface Props {
  config: BuilderConfiguration;
  onSave: (config: BuilderConfiguration) => void;
}

export const ConfigurationEditor: React.FC<Props> = ({ config, onSave }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2));
    setError(null);
  }, [config]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText) as BuilderConfiguration;
      if (!parsed.id || !parsed.name || !Array.isArray(parsed.entities) || !Array.isArray(parsed.functions)) {
        throw new Error("Invalid Configuration format. Must have id, name, entities array, and functions array.");
      }
      onSave(parsed);
      setError(null);
      alert('Configuration saved successfully!');
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Configuration</h2>
          <p className="text-sm text-gray-500">Edit the raw JSON to define functions and entities.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Save Configuration
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      <div className="flex-1">
        <textarea
          className="w-full h-full font-mono text-sm p-4 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
