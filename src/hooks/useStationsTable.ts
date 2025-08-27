'use client';

import { useState, useCallback } from 'react';
import { useGasStations } from '@/hooks/useGasStations';
import { useStationCRUD } from '@/hooks/useStationCRUD';
import { GasStation } from '@/types/station';
import { StationsTableState, SortConfig } from '@/types/table';

export function useStationsTable() {
  // Data hooks
  const { stations, loading, error, refetch } = useGasStations();
  const { deleteStation: performDelete } = useStationCRUD();

  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'updatedAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Actions
  const openAddForm = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const closeAddForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  const openEditForm = useCallback((station: GasStation) => {
    setSelectedStation(station);
  }, []);

  const closeEditForm = useCallback(() => {
    setSelectedStation(null);
  }, []);

  const handleDelete = useCallback(async (stationId: string) => {
    try {
      await performDelete(stationId);
      // Data will auto-update through the useGasStations hook
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
  }, [performDelete]);

  const refreshStations = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSortChange = useCallback((newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const ui: StationsTableState['ui'] = {
    showAddForm,
    selectedStation,
    searchQuery,
    sortConfig,
    currentPage,
    itemsPerPage
  };

  const actions: StationsTableState['actions'] = {
    openAddForm,
    closeAddForm,
    openEditForm,
    closeEditForm,
    setSearchQuery: handleSearchChange,
    setSortConfig: handleSortChange,
    setCurrentPage,
    deleteStation: handleDelete,
    refreshStations
  };

  return {
    stations,
    loading,
    error,
    ui,
    actions
  };
}