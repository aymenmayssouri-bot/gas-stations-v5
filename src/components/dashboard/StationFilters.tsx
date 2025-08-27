// File: src/components/dashboard/StationFilters.tsx
// The filters component is updated to work with provinces instead of cities.

import React from 'react';
import  Card  from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import  Button  from '@/components/ui/Button';

interface StationFiltersProps {
  availableProvinces: string[];
  selectedProvinces: string[];
  onProvinceChange: (province: string, isSelected: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function StationFilters({
  availableProvinces,
  selectedProvinces,
  onProvinceChange,
  onSelectAll,
  onClearAll
}: StationFiltersProps) {
  const isAllSelected = selectedProvinces.length === availableProvinces.length;
  const isNoneSelected = selectedProvinces.length === 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Filter by Province
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSelectAll}
            disabled={isAllSelected}
          >
            Select All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearAll}
            disabled={isNoneSelected}
          >
            Clear All
          </Button>
        </div>
      </div>
      <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
        {availableProvinces.map(province => (
          <div key={province} className="flex items-center space-x-2">
            <Checkbox
              id={province}
              checked={selectedProvinces.includes(province)}
              onCheckedChange={(checked) => onProvinceChange(province, checked)}
            >
              {province}
            </Checkbox>
            <label htmlFor={province} className="text-sm font-medium text-gray-700">
              {province}
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}