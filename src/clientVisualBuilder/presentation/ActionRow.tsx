import React from 'react';
import { BuilderConfiguration, ImplementationActionRow, ActionNode } from '../domain/models';
import { FunctionNodeEditor } from './FunctionNodeEditor';

interface Props {
  row: ImplementationActionRow;
  config: BuilderConfiguration;
  onChange: (newRow: ImplementationActionRow) => void;
  onRemove: () => void;
}

export const ActionRow: React.FC<Props> = ({ row, config, onChange, onRemove }) => {
  
  const handleEntityChange = (entityCode: string, val: string) => {
    onChange({
      ...row,
      entities: {
        ...row.entities,
        [entityCode]: val
      }
    });
  };

  const handleActionChange = (newAction: ActionNode) => {
    onChange({
      ...row,
      action: newAction
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
      {/* Row Header (Entities & Name) */}
      <div className="bg-gray-50 rounded-t-md border-b border-gray-200 p-3 flex justify-between items-center flex-wrap gap-3 cursor-move">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <svg className="w-5 h-5 text-gray-400 cursor-move" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700 text-sm">Action Name:</span>
            <input 
              type="text" 
              placeholder="e.g. body encoder"
              value={row.name || ''}
              onChange={(e) => onChange({ ...row, name: e.target.value })}
              className="border px-2 py-1 text-sm rounded bg-white w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <span className="font-semibold text-gray-700 text-sm">Entities Context:</span>
          {config.entities.map(ent => (
            <div key={ent.code} className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-500">{ent.description || ent.code}:</label>
              <select 
                value={row.entities[ent.code] || ''}
                onChange={(e) => handleEntityChange(ent.code, e.target.value)}
                className="border p-1 text-sm rounded bg-white"
              >
                <option value="">- unset -</option>
                {ent.allowed_values.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button 
          onClick={onRemove}
          className="text-red-500 hover:bg-red-50 p-1.5 rounded-full"
          title="Remove row"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>

      {/* Row Body (Action) */}
      <div className="p-4">
        {!row.action ? (
          <button 
            onClick={() => handleActionChange({ type: 'function', functionCode: '', args: {} })}
            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow text-sm font-medium transition-colors"
          >
            + Set Root Function
          </button>
        ) : (
          <FunctionNodeEditor 
            node={row.action} 
            config={config} 
            onChange={handleActionChange} 
          />
        )}
      </div>
    </div>
  );
};
