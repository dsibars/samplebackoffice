import { useState, useEffect, useMemo } from 'react';
import { AWSClient } from '../../shared/application/aws/AWSClient';
import { ParameterMetadata, ParameterType } from '@aws-sdk/client-ssm';
import { SSMPathService, ParsedPath } from '../../shared/application/aws/SSMPathService';

interface ExtendedParameterMetadata extends ParameterMetadata {
  parsed: ParsedPath;
}

export function ParameterStoreTab() {
  const [parameters, setParameters] = useState<ParameterMetadata[]>([]);
  const [categorizations, setCategorizations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParam, setSelectedParam] = useState<ExtendedParameterMetadata | null>(null);
  const [paramValue, setParamValue] = useState<string | null>(null);
  const [fetchingValue, setFetchingValue] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for adding/editing
  const [formPattern, setFormPattern] = useState<string | null>(null);
  const [formVariables, setFormVariables] = useState<Record<string, string>>({});
  const [formProperty, setFormProperty] = useState('');
  const [formType, setFormType] = useState<ParameterType>('String');
  const [formValue, setFormValue] = useState('');

  // Categorization management state
  const [showCatManager, setShowCatManager] = useState(false);
  const [newPattern, setNewPattern] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [AWSClient.getInstance().getRegion(), AWSClient.getInstance().getProfile()]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [params, cats] = await Promise.all([
        AWSClient.getInstance().listParameters(),
        AWSClient.getInstance().getSSMCategorizations()
      ]);
      setParameters(params);
      setCategorizations(cats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchParametersOnly = async () => {
    try {
      const params = await AWSClient.getInstance().listParameters();
      setParameters(params);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh parameters');
    }
  };

  const extendedParams = useMemo(() => {
    return parameters.map(p => ({
      ...p,
      parsed: SSMPathService.parsePath(p.Name || '', categorizations)
    })) as ExtendedParameterMetadata[];
  }, [parameters, categorizations]);

  const dynamicColumns = useMemo(() => {
    const cols = new Set<string>();
    categorizations.forEach(cat => {
      const matches = cat.match(/\{([^}]+)\}/g);
      if (matches) {
        matches.forEach(m => cols.add(m.slice(1, -1)));
      }
    });
    return Array.from(cols);
  }, [categorizations]);

  const filteredParams = extendedParams.filter(p =>
    p.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowValue = async (param: ExtendedParameterMetadata) => {
    if (!param.Name) return;
    setSelectedParam(param);
    setFetchingValue(true);
    setParamValue(null);
    setIsEditing(false);
    try {
      const fullParam = await AWSClient.getInstance().getParameter(param.Name);
      setParamValue(fullParam?.Value || 'No value');
    } catch (err: any) {
      setParamValue(`Error: ${err.message}`);
    } finally {
      setFetchingValue(false);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setSelectedParam(null);
    setFormPattern(categorizations[0] || null);
    setFormVariables({});
    setFormProperty('');
    setFormType('String');
    setFormValue('');
  };

  const handleStartEdit = () => {
    if (!selectedParam) return;
    setIsEditing(true);
    setFormPattern(selectedParam.parsed.pattern);
    setFormVariables({ ...selectedParam.parsed.variables });
    setFormProperty(selectedParam.parsed.propertyName);
    setFormType(selectedParam.Type as ParameterType || 'String');
    setFormValue(paramValue || '');
  };

  const handleSave = async () => {
    const newName = SSMPathService.recomposePath(formPattern, formVariables, formProperty);
    if (!newName) return;

    setIsSaving(true);
    try {
      await AWSClient.getInstance().putParameter(newName, formValue, formType);

      // If we are editing and the name changed, we should delete the old one
      if (isEditing && selectedParam && selectedParam.Name && selectedParam.Name !== newName) {
        await AWSClient.getInstance().deleteParameter(selectedParam.Name);
      }

      await fetchParametersOnly();
      setIsAdding(false);
      setIsEditing(false);
      setSelectedParam(null);
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedParam || !selectedParam.Name) return;
    if (!confirm(`Are you sure you want to delete parameter: ${selectedParam.Name}?`)) return;

    setIsSaving(true);
    try {
      await AWSClient.getInstance().deleteParameter(selectedParam.Name);
      await fetchParametersOnly();
      setSelectedParam(null);
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPattern = async () => {
    if (!newPattern.trim()) return;
    const updated = [...categorizations, newPattern.trim()];
    await AWSClient.getInstance().saveSSMCategorization(updated);
    setCategorizations(updated);
    setNewPattern('');
  };

  const handleRemovePattern = async (index: number) => {
    const updated = categorizations.filter((_, i) => i !== index);
    await AWSClient.getInstance().saveSSMCategorization(updated);
    setCategorizations(updated);
  };

  const handleMovePattern = async (index: number, direction: 'up' | 'down') => {
    const updated = [...categorizations];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    await AWSClient.getInstance().saveSSMCategorization(updated);
    setCategorizations(updated);
  };

  const getFormVariableNames = () => {
    if (!formPattern) return [];
    const matches = formPattern.match(/\{([^}]+)\}/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1 max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search parameters..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchInitialData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Refresh
            </button>
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Add Parameter
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowCatManager(!showCatManager)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showCatManager ? 'Hide' : 'Manage'} Categorization Patterns
            </button>

            {showCatManager && (
              <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Categorization Patterns (Priority: Top to Bottom)</h4>
                <ul className="space-y-2">
                  {categorizations.map((cat, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded text-sm font-mono">
                      <span>{cat}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleMovePattern(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">↑</button>
                        <button onClick={() => handleMovePattern(idx, 'down')} disabled={idx === categorizations.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">↓</button>
                        <button onClick={() => handleRemovePattern(idx)} className="p-1 text-red-600 hover:bg-red-50 rounded ml-2">×</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. /{env}/config/{service}/"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono"
                    value={newPattern}
                    onChange={e => setNewPattern(e.target.value)}
                  />
                  <button
                    onClick={handleAddPattern}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
        <div className="flex-1 min-w-0 bg-white shadow overflow-hidden border border-gray-200 rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {dynamicColumns.map(col => (
                  <th key={col} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={dynamicColumns.length + 3} className="px-6 py-4 text-center text-sm text-gray-500">Loading parameters...</td></tr>
              ) : filteredParams.length === 0 ? (
                <tr><td colSpan={dynamicColumns.length + 3} className="px-6 py-4 text-center text-sm text-gray-500">No parameters found</td></tr>
              ) : (
                filteredParams.map((param) => (
                  <tr key={param.Name} className={selectedParam?.Name === param.Name ? 'bg-blue-50' : ''}>
                    {dynamicColumns.map(col => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {param.parsed.variables[col] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs" title={param.Name}>
                      {param.parsed.propertyName}
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

        {(selectedParam || isAdding) && (
          <div className="lg:w-1/3 bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4 self-start">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isAdding ? 'Add New Parameter' : isEditing ? 'Edit Parameter' : 'Parameter Details'}
              </h3>
              {!isAdding && !isEditing && (
                <div className="flex gap-2">
                  <button onClick={handleStartEdit} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={handleDelete} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              )}
            </div>

            {(isAdding || isEditing) ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Pattern</label>
                  <select
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                    value={formPattern || ''}
                    onChange={e => {
                        const newPat = e.target.value || null;
                        setFormPattern(newPat);
                        // Reset variables that are not in the new pattern
                    }}
                  >
                    <option value="">None (Full Path)</option>
                    {categorizations.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {getFormVariableNames().map(varName => (
                  <div key={varName}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">{varName}</label>
                    <input
                      type="text"
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                      value={formVariables[varName] || ''}
                      onChange={e => setFormVariables({...formVariables, [varName]: e.target.value})}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Property Name / Path</label>
                  <input
                    type="text"
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md font-mono"
                    value={formProperty}
                    onChange={e => setFormProperty(e.target.value)}
                  />
                </div>

                <div className="text-xs text-gray-400 font-mono break-all">
                  Full Path: {SSMPathService.recomposePath(formPattern, formVariables, formProperty)}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <select
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                    value={formType}
                    onChange={e => setFormType(e.target.value as ParameterType)}
                  >
                    <option value="String">String</option>
                    <option value="StringList">StringList</option>
                    <option value="SecureString">SecureString</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Value</label>
                  <textarea
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md font-mono"
                    rows={4}
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => { setIsAdding(false); setIsEditing(false); if(isAdding) setSelectedParam(null); }}
                    className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                  <p className="text-sm font-mono break-all">{selectedParam?.Name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Pattern Match</label>
                  <p className="text-sm">{selectedParam?.parsed.pattern || 'None'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <p className="text-sm">{selectedParam?.Type}</p>
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
        )}
      </div>
    </div>
  );
}
