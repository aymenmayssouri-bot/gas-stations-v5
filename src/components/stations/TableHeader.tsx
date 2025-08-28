//src\components\stations\TableHeader.tsx

'use client';

import { SortConfig } from '@/types/table';

interface TableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

export default function TableHeader({
  label,
  sortKey,
  sortConfig,
  onSortChange,
}: TableHeaderProps) {
  const handleSort = () => {
    const direction =
      sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: sortKey, direction });
  };

  return (
    <th
      className={`px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer`}
      onClick={handleSort}
    >
      <div className="flex items-center gap-1">
        {label}
        <svg
          className={`w-3 h-3 ${
            sortConfig.key === sortKey
              ? sortConfig.direction === 'asc'
                ? 'text-blue-600 rotate-180'
                : 'text-blue-600'
              : 'text-gray-400'
          } transition-transform`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </div>
    </th>
  );
}