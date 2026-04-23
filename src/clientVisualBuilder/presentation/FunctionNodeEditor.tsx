import React, { useState, useRef, useEffect } from 'react';
import { ActionNode, BuilderConfiguration, ClientFunction } from '../domain/models';

const SearchableFunctionSelect: React.FC<{
  value: string;
  functions: ClientFunction[];
  onChange: (val: string) => void;
}> = ({ value, functions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = functions.find(f => f.code === value);
  const displayVal = selected ? selected.code : '';

  const filtered = functions.filter(f => 
    f.code.toLowerCase().includes(search.toLowerCase()) || 
    (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative inline-block text-sm min-w-[250px]" ref={containerRef}>
      <div 
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="border border-blue-300 rounded p-1.5 bg-white cursor-pointer flex justify-between items-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[34px]"
      >
        <span className="font-medium text-gray-700">{displayVal || '-- Select Function --'}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[350px] bg-white border border-gray-300 rounded shadow-xl">
          <div className="p-2 border-b border-gray-200 bg-gray-50 rounded-t">
            <input 
              autoFocus
              type="text" 
              placeholder="Search functions (name or description)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border-gray-300 border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
               <div className="p-3 text-sm text-gray-500 text-center italic">No matches found</div>
            ) : filtered.map(f => (
              <div 
                key={f.code}
                onClick={() => { onChange(f.code); setIsOpen(false); }}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <div className="font-bold text-gray-800 text-sm">
                  {f.code} <span className="text-blue-600 font-medium text-xs ml-1 whitespace-nowrap">{f.result?.description ? `-> ${f.result.description}` : ''}</span>
                </div>
                {f.description && <div className="text-xs text-gray-500 mt-0.5 leading-tight">{f.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  node: ActionNode;
  config: BuilderConfiguration;
  onChange: (newNode: ActionNode) => void;
}

export const FunctionNodeEditor: React.FC<Props> = ({ node, config, onChange }) => {
  if (node.type === 'item') {
    // This shouldn't normally be the root of a function node, but handle it anyway 
    // or it means this node slot is currently just a raw item value.
    return (
      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={node.value || ''} 
          onChange={e => onChange({ ...node, value: e.target.value })}
          className="border p-1 rounded min-w-[150px] shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <button 
          onClick={() => onChange({ type: 'function', functionCode: '', args: {} })}
          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
        >
          Use Function
        </button>
      </div>
    );
  }

  // Node is a function
  const selectedFunc = config.functions.find(f => f.code === node.functionCode);

  return (
    <div className="border border-blue-200 bg-blue-50 rounded p-3 ml-2 my-2 shadow-sm relative">
      <div className="flex items-center space-x-2 mb-3">
        <span className="font-semibold text-blue-800 text-sm">Function:</span>
        <SearchableFunctionSelect 
           value={node.functionCode || ''}
           functions={config.functions}
           onChange={newFuncCode => onChange({ type: 'function', functionCode: newFuncCode, args: {} })}
        />
        <button 
          onClick={() => onChange({ type: 'item', value: '' })}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded absolute top-3 right-3"
        >
          Remove
        </button>
      </div>

      {selectedFunc && selectedFunc.arguments.length > 0 && (
        <div className="pl-2 border-l-2 border-blue-300 space-y-3">
          {selectedFunc.arguments.map(arg => {
            const argNode = node.args?.[arg.code] || { type: 'item', value: '' };
            
            const handleArgChange = (newArgNode: ActionNode) => {
              onChange({
                ...node,
                args: {
                  ...(node.args || {}),
                  [arg.code]: newArgNode
                }
              });
            };

            return (
              <div key={arg.code} className="flex flex-col space-y-1">
                <div className="flex justify-between items-center max-w-sm">
                  <label className="text-xs font-semibold text-gray-600 block">
                    {arg.description || arg.code} {arg.mandatory && <span className="text-red-500">*</span>}
                  </label>
                  {argNode.type === 'item' ? (
                     <button 
                       onClick={() => handleArgChange({ type: 'function', functionCode: '', args: {} })}
                       className="text-[10px] text-blue-600 hover:underline"
                     >
                       fx Use Function
                     </button>
                  ) : null}
                </div>
                
                <div className="flex items-start">
                  {argNode.type === 'item' ? (
                    arg.allowed_values && arg.allowed_values.length > 0 ? (
                      <select 
                        value={argNode.value || ''}
                        onChange={e => handleArgChange({ type: 'item', value: e.target.value })}
                        className="border p-1.5 rounded text-sm min-w-[200px] shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">-- Select --</option>
                        {arg.allowed_values.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={argNode.value || ''}
                        onChange={e => handleArgChange({ type: 'item', value: e.target.value })}
                        placeholder={`Enter ${arg.code}...`}
                        className="border p-1.5 rounded text-sm min-w-[200px] shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    )
                  ) : (
                    <div className="flex-1">
                      <FunctionNodeEditor 
                        node={argNode} 
                        config={config} 
                        onChange={handleArgChange} 
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedFunc && selectedFunc.arguments.length === 0 && (
         <div className="text-sm italic text-gray-400 pl-2">No arguments required.</div>
      )}
    </div>
  );
};
