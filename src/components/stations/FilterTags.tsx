import React from 'react';
import { FilterConfig } from '@/types/table';

interface FilterTagsProps {
  filters: FilterConfig[];
  onRemoveFilter: (key: string) => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({ filters, onRemoveFilter }) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <div
          key={filter.key}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full"
        >
          <span className="font-medium text-gray-700">
            {filter.key}: {filter.value}
          </span>
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="text-gray-500 hover:text-gray-700"
            aria-label={`Remove ${filter.key} filter`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};