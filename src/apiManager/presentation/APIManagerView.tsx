import React, { useState, useMemo } from 'react';
import { APIManagerService } from '../application/APIManagerService';
import { LocalStorageAPIManagerStore } from '../infrastructure/LocalStorageAPIManagerStore';
import { SetupTab } from './SetupTab';
import { UseTab } from './UseTab';
import { HistoryTab } from './HistoryTab';
import { APIManagerConfig } from '../domain/APIManager';

export const APIManagerView: React.FC = () => {
  const store = useMemo(() => new LocalStorageAPIManagerStore(), []);
  const service = useMemo(() => new APIManagerService(store), [store]);

  const [config, setConfig] = useState<APIManagerConfig>(service.getConfig());
  const [activeTab, setActiveTab] = useState<'use' | 'setup' | 'history'>('use');

  const handleSave = (newConfig: APIManagerConfig) => {
    service.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleExport = () => {
    const data = store.exportConfig();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-manager-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const content = re.target?.result as string;
          try {
            store.importConfig(content);
            setConfig(service.getConfig());
            alert('Configuration imported successfully!');
          } catch (err) {
            alert('Failed to import configuration: ' + err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">API Manager</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Export JSON
          </button>
          <button
            onClick={handleImport}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Import JSON
          </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-4 border-b">
        <button
          onClick={() => setActiveTab('use')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'use'
              ? 'bg-white border-x border-t -mb-px text-blue-600 border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Use
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'setup'
              ? 'bg-white border-x border-t -mb-px text-blue-600 border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Setup
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-white border-x border-t -mb-px text-blue-600 border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'setup' && <SetupTab config={config} onSave={handleSave} />}
        {activeTab === 'use' && <UseTab config={config} service={service} />}
        {activeTab === 'history' && <HistoryTab service={service} />}
      </div>
    </div>
  );
};
