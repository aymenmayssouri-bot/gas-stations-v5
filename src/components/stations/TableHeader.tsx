// src/components/stations/TableHeader.tsx
'use client';

import React, { useState } from 'react';
import { SortConfig } from '@/types/table';

interface TableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  filterValues?: string[];
  selectedFilterValue?: string;
  onFilterChange?: (key: string, value: string) => void;
  width?: string;
}

export default function TableHeader({
  label,
  sortKey,
  sortConfig,
  onSortChange,
  filterValues = [],
  selectedFilterValue,
  onFilterChange,
  width,
}: TableHeaderProps) {
  const [showFilter, setShowFilter] = useState(false);

  const isSorted = sortConfig.key === sortKey;
  const direction = sortConfig.direction === 'asc' ? '▲' : '▼';

  const handleSortClick = () => {
    onSortChange({
      key: sortKey,
      direction: isSorted && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFilter(!showFilter);
  };

  const handleFilterSelect = (value: string) => {
    onFilterChange?.(sortKey, value);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    onFilterChange?.(sortKey, '');
    setShowFilter(false);
  };

  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer relative group"
      onClick={handleSortClick}
      style={{ width: width }}
    >
      <div className="flex items-center justify-between">
        <span>
          {label} {isSorted && <span>{direction}</span>}
        </span>
        
        {/* Filter indicator */}
        {selectedFilterValue && (
          <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
        
        {/* Filter button */}
        {filterValues.length > 0 && (
          <button
            onClick={handleFilterClick}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter dropdown */}
      {showFilter && filterValues.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Filtrer par {label}</div>
            
            {/* Clear filter option */}
            <button
              onClick={handleClearFilter}
              className={`w-full text-left px-2 py-1 text-sm rounded mb-1 ${
                !selectedFilterValue ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              Tous
            </button>

            {/* Filter options */}
            {filterValues.map((value) => (
              <button
                key={value}
                onClick={() => handleFilterSelect(value)}
                className={`w-full text-left px-2 py-1 text-sm rounded mb-1 ${
                  selectedFilterValue === value ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                {value || '(Vide)'}
              </button>
            ))}
          </div>
        </div>
      )}
    </th>
  );
}