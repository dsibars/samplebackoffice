import React, { useState, useEffect } from 'react';
import { HistoryEntry } from '../domain/APIManager';
import { APIManagerService } from '../application/APIManagerService';

interface HistoryTabProps {
  service: APIManagerService;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ service }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sortField, setSortField] = useState<keyof HistoryEntry>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setHistory(service.getHistory());
  }, [service]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the entire history?')) {
      service.clearHistory();
      setHistory([]);
    }
  };

  const handleSort = (field: keyof HistoryEntry) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Request History</h2>
        <button
          onClick={handleClearHistory}
          className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 transition-colors border border-red-200"
        >
          Clear History
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 font-bold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('timestamp')}>
                Time {sortField === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 font-bold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('envName')}>
                Env {sortField === 'envName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 font-bold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('method')}>
                Method {sortField === 'method' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 font-bold text-gray-600">Action</th>
              <th className="px-4 py-3 font-bold text-gray-600">Arguments</th>
              <th className="px-4 py-3 font-bold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 font-bold text-gray-600">URL</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 italic">
                  No request history found
                </td>
              </tr>
            ) : (
              sortedHistory.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase border border-gray-200">
                      {entry.envName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-[10px] ${
                      entry.method === 'GET' ? 'text-green-600' :
                      entry.method === 'POST' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {entry.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{entry.actionName}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{entry.serviceName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[10px] text-gray-500 max-w-xs truncate" title={JSON.stringify(entry.arguments)}>
                      {Object.entries(entry.arguments).map(([k, v]) => (
                        <span key={k} className="mr-2">
                          <span className="font-bold">{k}:</span> {v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${entry.status >= 200 && entry.status < 300 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.status}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1">{entry.statusText}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-xs" title={entry.url}>
                    {entry.url}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
