// src/components/stations/TableHeader.tsx
'use client';

import { SortConfig } from '@/types/table';

export default function TableHeader({
  label,
  sortKey,
  sortConfig,
  onSortChange,
}: {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}) {
  const isActive = sortConfig.key === sortKey;
  const nextDir = isActive && sortConfig.direction === 'asc' ? 'desc' : 'asc';

  return (
    <th
      className="px-4 py-2 text-left cursor-pointer select-none"
      onClick={() => onSortChange({ key: sortKey, direction: nextDir as 'asc' | 'desc' })}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && <span className="text-xs opacity-60">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
      </span>
    </th>
  );
}