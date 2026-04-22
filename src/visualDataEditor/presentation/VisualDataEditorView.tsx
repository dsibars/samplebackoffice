import { useState } from 'react';
import { TableData } from '../domain/DataModel';
import { FileSystemRepo } from '../infrastructure/FileSystemRepo';
import { DataFileService } from '../application/DataFileService';
import { DataTable } from './DataTable';

export function VisualDataEditorView() {
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleOpenFile = async () => {
    setLoading(true);
    setSaveStatus('');
    try {
      const fileData = await FileSystemRepo.pickFile();
      if (!fileData) {
        setLoading(false);
        return;
      }
      
      const format = DataFileService.detectFormat(fileData.fileName);
      const parsed = DataFileService.parseRawData(fileData.content, format, fileData.filePath, fileData.fileName);
      setTableData(parsed);
    } catch (e: any) {
      alert('Failed to parse the file: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setTableData(null);
    setSaveStatus('');
  };

  const handleAction = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value;
    e.target.value = ''; // reset select
    
    if (!tableData) return;

    const rawContent = DataFileService.generateRawContent(tableData);

    try {
      if (action === 'save') {
        if (!tableData.originalPath) {
          alert('No original path found. Save feature currently overwrites the source file opened natively.');
          return;
        }
        const success = await FileSystemRepo.overwriteFile(tableData.originalPath, rawContent);
        if (success) {
          setSaveStatus('File overwritten successfully!');
          setTimeout(() => setSaveStatus(''), 3000);
        } else {
          setSaveStatus('Failed to save file.');
        }
      } else if (action === 'clipboard') {
        await FileSystemRepo.copyToClipboard(rawContent);
        setSaveStatus('Copied to clipboard!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else if (action === 'download') {
        const blob = new Blob([rawContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tableData.originalFileName ? `edited_${tableData.originalFileName}` : `edited_data.${tableData.format === 'csv' ? 'csv' : 'json'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSaveStatus('Download triggered.');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err: any) {
      alert('Action failed: ' + err.message);
    }
  };

  if (!tableData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white shadow rounded-lg border-2 border-dashed border-gray-300">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Visual Data Editor</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Open any strict JSON or CSV file to view and edit it inside a friendly, sortable table.
        </p>
        <button 
          onClick={handleOpenFile}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded shadow transition-colors"
        >
          {loading ? 'Reading...' : 'Open File natively (JSON/CSV)'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4 p-4 bg-white shadow rounded-lg pointer-events-auto">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Editing: <span className="text-blue-600 font-mono text-sm">{tableData.originalFileName || 'Unknown File'}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Format: {tableData.format.toUpperCase()} | Rows: {tableData.rows.length}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {saveStatus && <span className="text-green-600 text-sm font-medium animate-pulse">{saveStatus}</span>}
          
          <select 
            className="border-gray-300 rounded shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 border cursor-pointer hover:bg-blue-100 transition-colors font-medium text-blue-800"
            defaultValue=""
            onChange={handleAction}
          >
            <option value="" disabled>Execute Action...</option>
            <option value="save">Save (Overwrite Source)</option>
            <option value="clipboard">To Clipboard (Raw Output)</option>
            <option value="download">Download File</option>
          </select>
          
          <button 
            onClick={clearData}
            className="text-gray-500 hover:text-red-600 font-medium py-2 px-3 border border-gray-200 hover:border-red-200 rounded transition-colors bg-gray-50"
          >
            Close File
          </button>
        </div>
      </div>

      <DataTable 
        headers={tableData.headers} 
        rows={tableData.rows} 
        onDataChange={(newRows) => setTableData({ ...tableData, rows: newRows })}
      />
    </div>
  );
}
