import { useState } from 'react';
import { AIConfigurationTab } from './AIConfigurationTab';
import { AITestTab } from './AITestTab';

export function AIView() {
  const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Artificial Intelligence</h1>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'config' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'test' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Test Chat
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'config' && <AIConfigurationTab />}
        {activeTab === 'test' && <AITestTab />}
      </div>
    </div>
  );
}
