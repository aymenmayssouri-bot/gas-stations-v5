'use client';

import { useMemo } from 'react';
import { useGasStations } from '@/hooks/useGasStations';
import { useStationFilters } from '@/hooks/useStationFilters';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DashboardData } from '@/types/dashboard';

export function useDashboardData(): DashboardData {
  const { 
    stations, 
    loading: stationsLoading, 
    error: stationsError 
  } = useGasStations();

  const {
    availableCities,
    selectedCities,
    filteredStations,
    actions: filterActions
  } = useStationFilters(stations);

  const stats = useDashboardStats(stations, filteredStations);

  const loading = stationsLoading;
  const error = stationsError;

  return {
    stats,
    stations,
    filteredStations,
    availableCities,
    selectedCities,
    loading,
    error,
    actions: filterActions
  };
}