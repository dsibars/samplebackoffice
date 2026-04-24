import { useState, useMemo, useEffect, useRef } from 'react';

interface DataTableProps {
  headers: string[];
  rows: Record<string, any>[];
  onDataChange: (newRows: Record<string, any>[]) => void;
}

export function DataTable({ headers, rows, onDataChange }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Column resizing state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizingRef = useRef<{ header: string; startX: number; startWidth: number } | null>(null);

  const handleSort = (header: string) => {
    if (resizingRef.current) return; // Don't sort if we just finished resizing
    
    if (sortKey === header) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(header);
      setSortDirection('asc');
    }
  };

  const sortedRows = useMemo(() => {
    const wrapped = rows.map((row, originalIndex) => ({ row, originalIndex }));
    
    if (!sortKey) return wrapped;
    
    return wrapped.sort((a, b) => {
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

  // Resizing logic
  const startResizing = (e: React.MouseEvent, header: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startWidth = columnWidths[header] || 200;
    resizingRef.current = {
      header,
      startX: e.pageX,
      startWidth
    };

    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      
      const { header, startX, startWidth } = resizingRef.current;
      const deltaX = e.pageX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);
      
      setColumnWidths(prev => ({
        ...prev,
        [header]: newWidth
      }));
    };

    const handleMouseUp = () => {
      if (!resizingRef.current) return;
      
      // Delay clearing to prevent accidental sort trigger
      setTimeout(() => {
        resizingRef.current = null;
      }, 100);
      
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [columnWidths]);

  if (rows.length === 0) {
    return <div className="text-gray-500 italic p-4">No data to display.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 mt-4 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(header => (
              <th 
                key={header}
                style={{ width: columnWidths[header] || 200 }}
                className="relative px-4 py-3 text-left font-medium text-gray-700 capitalize tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap group"
                onClick={() => handleSort(header)}
                aria-sort={sortKey === header ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center">
                  <span className="truncate flex-1">{header}</span>
                  {sortKey === header && (
                    <span className="ml-1 text-blue-500 text-xs">
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
                
                {/* Resizer Handle */}
                <div 
                  className="absolute -right-1.5 top-0 bottom-0 w-3 bg-transparent cursor-col-resize z-10 flex justify-center"
                  onMouseDown={(e) => startResizing(e, header)}
                >
                  <div className="w-px h-full bg-transparent group-hover:bg-gray-200 group-active:bg-blue-400 transition-colors" />
                </div>
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
                  <td 
                    key={header} 
                    style={{ width: columnWidths[header] || 200 }}
                    className="px-4 py-2 border-r last:border-r-0 border-gray-100 overflow-hidden"
                  >
                    <input 
                      className="w-full bg-transparent border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 outline-none text-gray-800 font-mono truncate"
                      value={displayVal}
                      readOnly={isObj}
                      title={isObj ? "Complex objects are currently strictly read-only" : displayVal}
                      onChange={(e) => handleCellChange(originalIndex, header, e.target.value)}
                      aria-label={`Edit ${header} for row ${originalIndex + 1}`}
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
