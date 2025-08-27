// File: src/hooks/useStationFilters.ts
// This hook is updated to filter by provinces instead of cities,
// with all variable names and logic adjusted accordingly.

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { GasStation } from '@/types/station';
import { StationFiltersState, StationFiltersActions } from '@/types/dashboard';
import { extractUniqueProvinces } from '@/lib/utils/stationUtils';

export function useStationFilters(stations: GasStation[]): {
  availableProvinces: string[];
  selectedProvinces: string[];
  filteredStations: GasStation[];
  actions: StationFiltersActions;
} {
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  // Memoize available provinces calculation
  const availableProvinces = useMemo(() => {
    return extractUniqueProvinces(stations);
  }, [stations]);

  // Initialize selected provinces when available provinces change
  useEffect(() => {
    if (availableProvinces.length > 0) {
      setSelectedProvinces(prevSelected => {
        // If no previous selection, default to 'Casablanca-Settat' if available, otherwise all provinces
        if (prevSelected.length === 0) {
          return availableProvinces.includes('Casablanca-Settat')
            ? ['Casablanca-Settat']
            : availableProvinces;
        }

        // Filter out provinces that are no longer available
        const validSelected = prevSelected.filter(province =>
          availableProvinces.includes(province)
        );

        // If no valid selections remain, select all available provinces
        return validSelected.length > 0 ? validSelected : availableProvinces;
      });
    }
  }, [availableProvinces]);

  // Memoize filtered stations
  const filteredStations = useMemo(() => {
    if (selectedProvinces.length === 0) return [];
    
    return stations.filter(station =>
      station['Province'] && selectedProvinces.includes(station['Province'])
    );
  }, [stations, selectedProvinces]);

  // Action handlers
  const updateProvinceFilter = useCallback((province: string, isSelected: boolean) => {
    setSelectedProvinces(prev => {
      if (isSelected) {
        return prev.includes(province) ? prev : [...prev, province];
      } else {
        return prev.filter(p => p !== province);
      }
    });
  }, []);

  const selectAllProvinces = useCallback(() => {
    setSelectedProvinces(availableProvinces);
  }, [availableProvinces]);

  const clearAllProvinces = useCallback(() => {
    setSelectedProvinces([]);
  }, []);

  const actions: StationFiltersActions = {
    updateProvinceFilter,
    selectAllProvinces,
    clearAllProvinces
  };

  return {
    availableProvinces,
    selectedProvinces,
    filteredStations,
    actions
  };
}