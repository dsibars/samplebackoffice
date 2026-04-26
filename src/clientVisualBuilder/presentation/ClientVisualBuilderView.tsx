import React, { useState, useEffect, useMemo } from 'react';
import { BuilderService } from '../application/BuilderService';
import { BuilderConfiguration, ClientImplementation } from '../domain/models';
import { ConfigurationEditor } from './ConfigurationEditor';
import { ImplementationComposer } from './ImplementationComposer';

export const ClientVisualBuilderView: React.FC = () => {
  const service = useMemo(() => new BuilderService(), []);
  
  const [configs, setConfigs] = useState<BuilderConfiguration[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedImplementationId, setSelectedImplementationId] = useState<string | null>(null);
  const [expandedConfigIds, setExpandedConfigIds] = useState<Set<string>>(new Set());
  
  const [activeTab, setActiveTab] = useState<'compose' | 'edit_config'>('compose');

  useEffect(() => {
    const loaded = service.getConfigurations();
    setConfigs(loaded);
    if (loaded.length > 0 && !selectedConfigId) {
      const firstConfig = loaded[0];
      setSelectedConfigId(firstConfig.id);
      setExpandedConfigIds(new Set([firstConfig.id]));

      const impls = service.getImplementationsForConfig(firstConfig.id);
      if (impls.length > 0) {
        setSelectedImplementationId(impls[0].id);
      }
    }
  }, [service]);

  const activeImplementation = useMemo(() => {
    if (!selectedConfigId) return null;
    const impls = service.getImplementationsForConfig(selectedConfigId);
    if (selectedImplementationId) {
      return impls.find(i => i.id === selectedImplementationId) || (impls.length > 0 ? impls[0] : null);
    }
    return impls.length > 0 ? impls[0] : null;
  }, [selectedConfigId, selectedImplementationId, service, configs]);

  const handleConfigSave = (newConfig: BuilderConfiguration) => {
    service.saveConfiguration(newConfig);
    setConfigs(service.getConfigurations());
  };

  const handleImplementationSave = (impl: ClientImplementation) => {
    service.saveImplementation(impl);
    setSelectedImplementationId(impl.id);
    // Refresh configs to trigger memo update if necessary (though configs didn't change, service state did)
    setConfigs([...service.getConfigurations()]);
  };

  const selectedConfig = configs.find(c => c.id === selectedConfigId);

  const toggleExpand = (configId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedConfigIds);
    if (newExpanded.has(configId)) {
      newExpanded.delete(configId);
    } else {
      newExpanded.add(configId);
    }
    setExpandedConfigIds(newExpanded);
  };

  const handleAddImplementation = (configId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newImpl: ClientImplementation = {
      id: crypto.randomUUID(),
      name: 'New Implementation',
      timestamp: Date.now(),
      configurationId: configId,
      actions: []
    };
    service.saveImplementation(newImpl);
    setSelectedConfigId(configId);
    setSelectedImplementationId(newImpl.id);
    setActiveTab('compose');
    setExpandedConfigIds(prev => new Set(prev).add(configId));
    setConfigs([...service.getConfigurations()]);
  };

  const handleDeleteImplementation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this implementation?')) {
      service.deleteImplementation(id);
      if (selectedImplementationId === id) {
        setSelectedImplementationId(null);
      }
      setConfigs([...service.getConfigurations()]);
    }
  };

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
                setExpandedConfigIds(prev => new Set(prev).add(newId));
             }}
          >
             + Add Config
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {configs.map(c => {
            const impls = service.getImplementationsForConfig(c.id);
            const isExpanded = expandedConfigIds.has(c.id);
            return (
              <div key={c.id} className="border-b border-gray-100">
                <div
                  onClick={() => {
                    setSelectedConfigId(c.id);
                    const configImpls = service.getImplementationsForConfig(c.id);
                    if (configImpls.length > 0) {
                      if (!configImpls.some(i => i.id === selectedImplementationId)) {
                        setSelectedImplementationId(configImpls[0].id);
                      }
                    } else {
                      setSelectedImplementationId(null);
                    }
                  }}
                  className={`p-3 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-between ${selectedConfigId === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <button
                      onClick={(e) => toggleExpand(c.id, e)}
                      className="p-1 hover:bg-gray-300 rounded text-gray-500"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                    <div className="overflow-hidden">
                      <p className="font-medium text-gray-800 text-sm truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.functions.length} FNC / {c.entities.length} ENT</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleAddImplementation(c.id, e)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Add Implementation"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>

                {isExpanded && (
                  <div className="bg-white">
                    {impls.length === 0 ? (
                      <div className="p-2 pl-10 text-xs text-gray-400 italic">No implementations</div>
                    ) : (
                      impls.map(impl => (
                        <div
                          key={impl.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConfigId(c.id);
                            setSelectedImplementationId(impl.id);
                            setActiveTab('compose');
                          }}
                          className={`p-2 pl-10 cursor-pointer hover:bg-blue-50 flex items-center justify-between group transition-colors ${selectedImplementationId === impl.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'}`}
                        >
                          <span className="text-sm truncate pr-2">{impl.name || 'Unnamed Impl'}</span>
                          <button
                            onClick={(e) => handleDeleteImplementation(impl.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                            title="Delete Implementation"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
