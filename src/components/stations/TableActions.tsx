'use client';

import { useState } from 'react';
import  Button  from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';

interface TableActionsProps {
  onAddNew: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalStations: number;
  onRefresh: () => void;
}

export function TableActions({
  onAddNew,
  searchQuery,
  onSearchChange,
  totalStations,
  onRefresh
}: TableActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Brief delay for UX
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Search */}
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search stations by name, city, or brand..."
            className="w-full"
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 hidden sm:block">
            {totalStations} station{totalStations !== 1 ? 's' : ''} total
          </div>
          
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Refresh
          </Button>
          
          <Button
            variant="primary"
            onClick={onAddNew}
            className="flex items-center gap-2"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Add Station
          </Button>
        </div>
      </div>
    </div>
  );
}