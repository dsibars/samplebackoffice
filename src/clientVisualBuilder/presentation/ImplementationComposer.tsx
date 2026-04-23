import React, { useState, useEffect } from 'react';
import { BuilderConfiguration, ClientImplementation, ImplementationActionRow } from '../domain/models';
import { ActionRow } from './ActionRow';

interface Props {
  config: BuilderConfiguration;
  implementation: ClientImplementation | null;
  onSave: (impl: ClientImplementation) => void;
}

export const ImplementationComposer: React.FC<Props> = ({ config, implementation, onSave }) => {
  const [impl, setImpl] = useState<ClientImplementation | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (implementation) {
      setImpl({ ...implementation });
    } else {
      setImpl({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        configurationId: config.id,
        actions: []
      });
    }
  }, [implementation, config.id]);

  if (!impl) return null;

  const handleAddRow = () => {
    const newRow: ImplementationActionRow = {
      id: crypto.randomUUID(),
      entities: {},
      action: null
    };
    setImpl({ ...impl, actions: [...impl.actions, newRow] });
  };

  const handleRowChange = (id: string, newRow: ImplementationActionRow) => {
    setImpl({
      ...impl,
      actions: impl.actions.map(r => r.id === id ? newRow : r)
    });
  };

  const handleRemoveRow = (id: string) => {
    setImpl({
      ...impl,
      actions: impl.actions.filter(r => r.id !== id)
    });
  };

  const handleSave = () => {
    const updated = { ...impl, timestamp: Date.now() };
    setImpl(updated);
    onSave(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Needed for Firefox
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDragOverIndex(null);
      setDraggedIndex(null);
      return;
    }

    const newActions = [...impl.actions];
    const item = newActions.splice(draggedIndex, 1)[0];
    newActions.splice(index, 0, item);

    setImpl({ ...impl, actions: newActions });
    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col space-y-1 w-1/2">
          <div className="flex items-center space-x-3">
             <h2 className="text-2xl font-bold text-gray-800">Visual Composer</h2>
             <input 
               type="text" 
               className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
               placeholder="Implementation Name..." 
               value={impl.name || ''} 
               onChange={e => setImpl({ ...impl, name: e.target.value })}
             />
          </div>
          <p className="text-sm text-gray-500">Config: {config.name}</p>
        </div>
        <div className="space-x-3 flex">
           <button 
            onClick={() => setShowJson(!showJson)}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            {showJson ? 'Hide JSON' : 'Export JSON'}
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save Implementation
          </button>
        </div>
      </div>

      {showJson && (
        <div className="mb-6 bg-gray-900 rounded p-4 relative">
           <div className="absolute top-2 right-2 text-xs text-gray-400">Read-Only Result</div>
           <pre className="text-sm text-green-400 overflow-auto max-h-64">
             {JSON.stringify(
               {
                 name: impl.name,
                 timestamp: impl.timestamp,
                 configuration: impl.configurationId,
                 actions: impl.actions.map(a => ({
                    name: a.name,
                    ...a.entities,
                    value: a.action
                 }))
               }, 
               null, 
               2
             )}
           </pre>
        </div>
      )}

      <div className="flex-1 overflow-auto p-1">
        {impl.actions.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No actions defined yet.</p>
            <button 
              onClick={handleAddRow}
              className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded shadow font-medium"
            >
              Add First Row
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {impl.actions.map((row, index) => (
              <div
                key={row.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`transition-all duration-200 ${draggedIndex === index ? 'opacity-50' : 'opacity-100'} ${dragOverIndex === index ? 'border-t-4 border-t-blue-500' : ''}`}
              >
                  <ActionRow 
                    row={row} 
                    config={config} 
                    onChange={(r) => handleRowChange(row.id, r)}
                    onRemove={() => handleRemoveRow(row.id)}
                  />
              </div>
            ))}
            
            <button 
              onClick={handleAddRow}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded transition font-medium"
            >
              + Add Another Row
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
