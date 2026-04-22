import { useState, useMemo } from 'react';

interface DataTableProps {
  headers: string[];
  rows: Record<string, any>[];
  onDataChange: (newRows: Record<string, any>[]) => void;
}

export function DataTable({ headers, rows, onDataChange }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (header: string) => {
    if (sortKey === header) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(header);
      setSortDirection('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    
    // We map rows to keep track of their original Index for safe updating
    return rows.map((row, originalIndex) => ({ row, originalIndex })).sort((a, b) => {
      const valA = a.row[sortKey];
      const valB = b.row[sortKey];

      if (valA === valB) return 0;
      
      const vA = (valA ?? '');
      const vB = (valB ?? '');

      if (vA < vB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (vA > vB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [rows, sortKey, sortDirection]);

  const handleCellChange = (originalIndex: number, header: string, value: string) => {
    const newRows = [...rows];
    newRows[originalIndex] = {
      ...newRows[originalIndex],
      [header]: value
    };
    onDataChange(newRows);
  };

  if (rows.length === 0) {
    return <div className="text-gray-500 italic p-4">No data to display.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 mt-4 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(header => (
              <th 
                key={header}
                className="px-4 py-3 text-left font-medium text-gray-700 capitalize tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap"
                onClick={() => handleSort(header)}
              >
                {header}
                {sortKey === header && (
                  <span className="ml-1 text-blue-500 text-xs">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedRows.map(({ row, originalIndex }) => (
            <tr key={originalIndex} className="hover:bg-gray-50 transition-colors">
              {headers.map(header => {
                const isObj = typeof row[header] === 'object' && row[header] !== null;
                const displayVal = isObj ? JSON.stringify(row[header]) : (row[header] ?? '');
                
                return (
                  <td key={header} className="px-4 py-2 border-r last:border-r-0 border-gray-100">
                    <input 
                      className="w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 outline-none text-gray-800 font-mono"
                      value={displayVal}
                      readOnly={isObj} // Can't easily edit nested objects right now implicitly
                      title={isObj ? "Complex objects are currently strictly read-only" : ""}
                      onChange={(e) => handleCellChange(originalIndex, header, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
