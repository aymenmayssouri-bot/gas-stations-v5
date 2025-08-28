// src/app/(authenticated)/stations/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { StationWithDetails } from '@/types/station';
import { StationForm } from '@/components/stations/StationForm';
import { StationsTable } from '@/components/stations/StationsTable';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useStations } from '@/hooks/stations/useStations';
import { useDeleteStation } from '@/hooks/stations/useDeleteStation';
import { SortConfig } from '@/types/table';

export default function NormalizedStationsPage() {
  const { stations, loading, error, refetch } = useStations();
  const { deleteStation } = useDeleteStation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StationWithDetails | undefined>(undefined);

  // 🔹 Table state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'NomStation',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔹 Derived stations with search, sort, pagination
  const filteredStations = useMemo(() => {
    let data = [...stations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((s) =>
        s.station.NomStation.toLowerCase().includes(query) ||
        s.commune.Commune.toLowerCase().includes(query) ||
        s.marque.Marque.toLowerCase().includes(query)
      );
    }

    // sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = (a.station as any)[sortConfig.key] ?? '';
        const bVal = (b.station as any)[sortConfig.key] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [stations, searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredStations.length / pageSize);

  const paginatedStations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStations.slice(start, start + pageSize);
  }, [filteredStations, currentPage, pageSize]);

  // 🔹 Handlers
  const handleAdd = () => {
    setEditing(undefined);
    setShowForm(true);
  };

  const handleEdit = (stationData: StationWithDetails) => {
    setEditing(stationData);
    setShowForm(true);
  };

  const handleDelete = async (stationData: StationWithDetails) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la station \"${stationData.station.NomStation}\" ? Cette action est irréversible.`
    );

    if (confirmed) {
      if (stationData.station.id) {
        try {
          await deleteStation(stationData.station.id);
          refetch();
        } catch (err) {
          console.error('Failed to delete station:', err);
          alert('Une erreur est survenue lors de la suppression de la station');
        }
      } else {
        alert("Erreur: L'identifiant de la station est manquant.");
      }
    }
  };

  // 🔹 Render
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
        <ErrorMessage error={error} onRetry={refetch as any} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stations (Normalized)</h1>
          <p className="text-sm text-gray-600 mt-1">
            {stations.length} station{stations.length !== 1 ? 's' : ''} dans la base de données normalisée
          </p>
        </div>
        <Button onClick={handleAdd}>Ajouter une station</Button>
      </div>

      <StationsTable
        stations={paginatedStations}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier la station' : 'Créer une station'}
        size="xl"
      >
        <StationForm
          mode={editing ? 'edit' : 'create'}
          station={editing}
          onSaved={() => {
            setShowForm(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
}