// TableHeader.tsx
'use client';

import { SortConfig, TableColumn } from '@/types/table';

interface TableHeaderProps {
  columns: TableColumn[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export function TableHeader({ columns, sortConfig, onSort }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.width || ''
            } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
            onClick={() => column.sortable && onSort(column.key)}
          >
            <div className="flex items-center gap-1">
              {column.label}
              {column.sortable && (
                <div className="flex flex-col">
                  <svg
                    className={`w-3 h-3 ${
                      sortConfig.key === column.key && sortConfig.direction === 'asc'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}