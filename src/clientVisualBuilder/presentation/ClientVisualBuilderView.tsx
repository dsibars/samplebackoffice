import React, { useState, useEffect, useMemo } from 'react';
import { BuilderService } from '../application/BuilderService';
import { BuilderConfiguration, ClientImplementation } from '../domain/models';
import { ConfigurationEditor } from './ConfigurationEditor';
import { ImplementationComposer } from './ImplementationComposer';

export const ClientVisualBuilderView: React.FC = () => {
  const service = useMemo(() => new BuilderService(), []);
  
  const [configs, setConfigs] = useState<BuilderConfiguration[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'compose' | 'edit_config'>('compose');
  const [activeImplementation, setActiveImplementation] = useState<ClientImplementation | null>(null);

  useEffect(() => {
    const loaded = service.getConfigurations();
    setConfigs(loaded);
    if (loaded.length > 0 && !selectedConfigId) {
      setSelectedConfigId(loaded[0].id);
    }
  }, [service, selectedConfigId]);

  useEffect(() => {
    if (selectedConfigId) {
      const impls = service.getImplementationsForConfig(selectedConfigId);
      if (impls.length > 0) {
        setActiveImplementation(impls[0]);
      } else {
        setActiveImplementation(null);
      }
    } else {
      setActiveImplementation(null);
    }
  }, [selectedConfigId, service]);

  const handleConfigSave = (newConfig: BuilderConfiguration) => {
    service.saveConfiguration(newConfig);
    setConfigs(service.getConfigurations());
  };

  const handleImplementationSave = (impl: ClientImplementation) => {
    service.saveImplementation(impl);
    setActiveImplementation(impl);
  };

  const selectedConfig = configs.find(c => c.id === selectedConfigId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* LEFT SIDEBAR (30%) */}
      <div className="w-1/4 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Configurations</h3>
          <button 
             className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
             onClick={() => {
                const newId = crypto.randomUUID();
                const newConfig: BuilderConfiguration = { id: newId, name: 'New Config', entities: [], functions: [] };
                handleConfigSave(newConfig);
                setSelectedConfigId(newId);
             }}
          >
             + Add
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {configs.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedConfigId(c.id)}
              className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-200 transition-colors ${selectedConfigId === c.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''}`}
            >
              <p className="font-medium text-gray-800 text-sm truncate">{c.name}</p>
              <p className="text-xs text-gray-500">{c.functions.length} functions, {c.entities.length} entities</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT (70%) */}
      <div className="w-3/4 flex flex-col bg-white">
        {selectedConfig ? (
          <>
            <div className="border-b border-gray-200 bg-white px-4 py-3 flex space-x-4">
              <button 
                onClick={() => setActiveTab('compose')}
                className={`text-sm font-medium px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'compose' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                Compose Actions
              </button>
              <button 
                onClick={() => setActiveTab('edit_config')}
                className={`text-sm font-medium px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'edit_config' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                Edit Config Setup
              </button>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              {activeTab === 'edit_config' ? (
                <ConfigurationEditor 
                   config={selectedConfig} 
                   onSave={handleConfigSave} 
                />
              ) : (
                <ImplementationComposer 
                   config={selectedConfig} 
                   implementation={activeImplementation} 
                   onSave={handleImplementationSave} 
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select or create a configuration to begin
          </div>
        )}
      </div>
    </div>
  );
};
