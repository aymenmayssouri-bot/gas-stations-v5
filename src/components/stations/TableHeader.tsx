// src/components/stations/TableHeader.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SortConfig } from '@/types/table';
import { Checkbox } from '@/components/ui/Checkbox';

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
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Initialize selectedValues only when selectedFilterValue changes
  useEffect(() => {
    if (selectedFilterValue) {
      setSelectedValues(selectedFilterValue.split('|'));
    } else {
      setSelectedValues([]);
    }
  }, [selectedFilterValue]);

  const handleFilterSelect = useCallback(
    (value: string, checked: boolean) => {
      setSelectedValues((prev) => {
        const newValues = checked
          ? [...prev, value]
          : prev.filter((v) => v !== value);

        // Call onFilterChange outside of setState
        setTimeout(() => {
          onFilterChange?.(sortKey, newValues.join('|'));
        }, 0);

        return newValues;
      });
    },
    [onFilterChange, sortKey]
  );

  const handleClearFilter = useCallback(() => {
    setSelectedValues([]);
    onFilterChange?.(sortKey, '');
  }, [onFilterChange, sortKey]);

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

  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group sticky top-0 z-10 bg-gray-50"
      onClick={handleSortClick}
      style={{ width: width }}
    >
      <div className="flex items-center justify-between">
        <span>
          {label} {isSorted && <span>{direction}</span>}
        </span>

        {selectedValues.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
            {selectedValues.length}
          </span>
        )}

        {filterValues.length > 0 && (
          <button
            onClick={handleFilterClick}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        )}
      </div>

      {showFilter && filterValues.length > 0 && (
        <div
          className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium text-gray-500">
                Filtrer par {label}
              </div>
              <button
                onClick={handleClearFilter}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Réinitialiser
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filterValues.map((value) => (
                <div key={value} className="py-1">
                  <Checkbox
                    id={`${sortKey}-${value}`}
                    checked={selectedValues.includes(value)}
                    onCheckedChange={(checked) =>
                      handleFilterSelect(value, checked)
                    }
                  >
                    <span
                      className="text-sm text-gray-700 truncate block"
                      title={value || '(Vide)'}
                    >
                      {value || '(Vide)'}
                    </span>
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </th>
  );
}