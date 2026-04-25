import { useState, useEffect } from 'react';
import { AWSClient } from '../../shared/application/aws/AWSClient';
import { ParameterMetadata } from '@aws-sdk/client-ssm';

export function ParameterStoreTab() {
  const [parameters, setParameters] = useState<ParameterMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParam, setSelectedParam] = useState<ParameterMetadata | null>(null);
  const [paramValue, setParamValue] = useState<string | null>(null);
  const [fetchingValue, setFetchingValue] = useState(false);

  useEffect(() => {
    fetchParameters();
  }, [AWSClient.getInstance().getRegion(), AWSClient.getInstance().getProfile()]);

  const fetchParameters = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = await AWSClient.getInstance().listParameters();
      setParameters(params);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleShowValue = async (param: ParameterMetadata) => {
    if (!param.Name) return;
    setSelectedParam(param);
    setFetchingValue(true);
    setParamValue(null);
    try {
      const fullParam = await AWSClient.getInstance().getParameter(param.Name);
      setParamValue(fullParam?.Value || 'No value');
    } catch (err: any) {
      setParamValue(`Error: ${err.message}`);
    } finally {
      setFetchingValue(false);
    }
  };

  const filteredParams = parameters.filter(p =>
    p.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search parameters..."
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchParameters}
          className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 bg-white shadow overflow-hidden border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading parameters...</td></tr>
              ) : filteredParams.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No parameters found</td></tr>
              ) : (
                filteredParams.map((param) => (
                  <tr key={param.Name} className={selectedParam?.Name === param.Name ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs" title={param.Name}>
                      {param.Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {param.Type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleShowValue(param)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedParam && (
          <div className="lg:w-1/3 bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4 self-start">
            <h3 className="text-lg font-medium text-gray-900">Parameter Details</h3>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
              <p className="text-sm font-mono break-all">{selectedParam.Name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
              <p className="text-sm">{selectedParam.Type}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Value</label>
              {fetchingValue ? (
                <p className="text-sm text-gray-400">Fetching value...</p>
              ) : (
                <div className="mt-1 relative">
                  <pre className="text-sm font-mono bg-white p-2 border border-gray-300 rounded overflow-auto max-h-64 whitespace-pre-wrap break-all">
                    {paramValue}
                  </pre>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedParam(null)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Close Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
