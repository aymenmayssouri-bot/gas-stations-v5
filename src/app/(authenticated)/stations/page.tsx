// src/app/(authenticated)/stations/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useStations } from "@/hooks/stations/useStations";
import { useDeleteStation } from "@/hooks/stations/useDeleteStation";
import StationsTable from "@/components/stations/StationsTable";
import { StationForm } from "@/components/stations/StationForm";
import { TableActions } from "@/components/stations/TableActions";
import { EmptyState } from "@/components/stations/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PaginationInfo, SortConfig } from "@/types/table";
import { StationWithDetails } from "@/types/station";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function StationsPage() {
  const { stations, loading, error, refetch } = useStations();
  const { deleteStation, loading: deleting } = useDeleteStation();
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<StationWithDetails | undefined>(undefined);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Delete confirmation state
  const [stationToDelete, setStationToDelete] = useState<StationWithDetails | undefined>(undefined);
  
  // Table state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "NomStation", direction: "asc" });
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter stations based on search query
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    
    const query = searchQuery.toLowerCase();
    return stations.filter((station) => {
      return (
        station.station.NomStation?.toLowerCase().includes(query) ||
        station.commune.NomCommune?.toLowerCase().includes(query) ||
        station.province.NomProvince?.toLowerCase().includes(query) ||
        station.marque.Marque?.toLowerCase().includes(query) ||
        station.station.Adresse?.toLowerCase().includes(query)
      );
    });
  }, [stations, searchQuery]);

  // Sort filtered stations
  const sortedStations = useMemo(() => {
    const sorted = [...filteredStations];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case "NomStation":
          aValue = a.station.NomStation;
          bValue = b.station.NomStation;
          break;
        case "NomCommune":
          aValue = a.commune.NomCommune;
          bValue = b.commune.NomCommune;
          break;
        case "Marque":
          aValue = a.marque.Marque;
          bValue = b.marque.Marque;
          break;
        case "Province":
          aValue = a.province.NomProvince;
          bValue = b.province.NomProvince;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStations, sortConfig]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(sortedStations.length / pageSize));
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Reset to page 1 when search changes
  useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const handleSortChange = (config: SortConfig) => {
    setSortConfig(config);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleAddNew = () => {
    setEditingStation(undefined);
    setShowForm(true);
  };

  const handleEdit = (station: StationWithDetails) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const handleDelete = (station: StationWithDetails) => {
    setStationToDelete(station);
  };

  const confirmDelete = async () => {
    if (!stationToDelete?.station.id) return;
    
    try {
      await deleteStation(stationToDelete.station.id);
      await refetch(); // Refresh the data
      setStationToDelete(undefined);
    } catch (error) {
      console.error('Failed to delete station:', error);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingStation(undefined);
    await refetch(); // Refresh the data
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  const hasSearch = searchQuery.trim().length > 0;
  const showEmptyState = sortedStations.length === 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stations-service</h1>
        <p className="text-sm text-gray-600">Gestion des stations avec structure normalisée.</p>
      </div>

      {/* Table Actions */}
      <TableActions
        onAddNew={handleAddNew}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalStations={stations.length}
        onRefresh={handleRefresh}
      />

      {/* Table or Empty State */}
      {showEmptyState ? (
        <EmptyState
          hasSearch={hasSearch}
          searchQuery={searchQuery}
          totalStations={stations.length}
        />
      ) : (
        <StationsTable
          stations={sortedStations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      )}

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStation(undefined);
        }}
        title={editingStation ? "Modifier la station" : "Créer une station"}
        size="xl"
      >
        <StationForm
          mode={editingStation ? "edit" : "create"}
          station={editingStation}
          onSaved={handleFormSaved}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!stationToDelete}
        onClose={() => setStationToDelete(undefined)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer la station "${stationToDelete?.station.NomStation}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleting}
        variant="danger"
      />
    </div>
  );
}