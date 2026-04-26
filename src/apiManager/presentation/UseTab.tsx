import React, { useState, useEffect } from 'react';
import {
  APIManagerConfig,
  Service,
  Collection,
  Action,
  RequestResult,
  Environment
} from '../domain/APIManager';
import { APIManagerService } from '../application/APIManagerService';

interface UseTabProps {
  config: APIManagerConfig;
  service: APIManagerService;
}

export const UseTab: React.FC<UseTabProps> = ({ config, service }) => {
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(config.environments[0] || null);
  const [selectedAction, setSelectedAction] = useState<{
    service: Service,
    collection: Collection,
    action: Action
  } | null>(null);

  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RequestResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAction) {
      const initialArgs: Record<string, string> = {};
      selectedAction.action.arguments.forEach(arg => {
        initialArgs[arg.name] = '';
      });
      setArgValues(initialArgs);
      setResult(null);
    }
  }, [selectedAction]);

  const handleExecute = async () => {
    if (!selectedEnv || !selectedAction) return;

    setLoading(true);
    try {
      const res = await service.executeAction(
        selectedEnv,
        selectedAction.service,
        selectedAction.collection,
        selectedAction.action,
        argValues
      );
      setResult(res);
    } catch (e: any) {
      setResult({
        status: 0,
        statusText: e.message || 'Error',
        body: '',
        headers: {}
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b bg-white">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Environment</label>
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={selectedEnv?.id || ''}
            onChange={(e) => setSelectedEnv(config.environments.find(env => env.id === e.target.value) || null)}
          >
            {config.environments.map(env => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
        </div>
        <div className="p-2">
          {config.services.map(s => (
            <div key={s.id} className="mb-2">
              <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase">{s.name}</div>
              {s.collections.map(c => (
                <div key={c.id} className="ml-2">
                  <div className="px-2 py-1 text-xs text-gray-400 italic">{c.name}</div>
                  {c.actions.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAction({ service: s, collection: c, action: a })}
                      className={`w-full text-left px-4 py-1 text-sm rounded ${
                        selectedAction?.action.id === a.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className={`inline-block w-8 text-[10px] font-bold mr-1 ${
                        a.method === 'GET' ? 'text-green-600' :
                        a.method === 'POST' ? 'text-blue-600' :
                        a.method === 'PUT' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {a.method}
                      </span>
                      {a.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedAction ? (
          <>
            <div className="p-6 border-b overflow-y-auto max-h-[50%]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAction.action.name}</h3>
                  <div className="text-sm text-gray-500 font-mono mt-1">
                    <span className="font-bold text-blue-600 mr-2">{selectedAction.action.method}</span>
                    {selectedEnv?.baseUrl}/{selectedAction.service.path}/{selectedAction.collection.path ? selectedAction.collection.path + '/' : ''}{selectedAction.action.path}
                  </div>
                </div>
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className={`bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>

              {selectedAction.action.arguments.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase border-b pb-1">Arguments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAction.action.arguments.map((arg, idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {arg.name} <span className="text-[10px] text-gray-400">({arg.type})</span>
                          {arg.type === 'body' ? (
                            <textarea
                              value={argValues[arg.name] || ''}
                              onChange={(e) => setArgValues({ ...argValues, [arg.name]: e.target.value })}
                              className="w-full border rounded px-3 py-2 text-sm font-mono h-20 font-normal"
                            />
                          ) : (
                            <input
                              type="text"
                              value={argValues[arg.name] || ''}
                              onChange={(e) => setArgValues({ ...argValues, [arg.name]: e.target.value })}
                              className="w-full border rounded px-3 py-2 text-sm font-normal"
                            />
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="flex-1 bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Response</span>
                {result && (
                  <div className="flex space-x-4 text-xs">
                    <span className={result.status >= 200 && result.status < 300 ? 'text-green-400' : 'text-red-400'}>
                      Status: <b>{result.status} {result.statusText}</b>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {result ? (
                  <pre className="whitespace-pre-wrap">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(result.body), null, 2);
                      } catch {
                        return result.body;
                      }
                    })()}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 italic">
                    {loading ? 'Executing request...' : 'Ready to send request'}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select an action from the sidebar to begin
          </div>
        )}
      </div>
    </div>
  );
};
