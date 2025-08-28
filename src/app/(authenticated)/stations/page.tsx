// src/app/(authenticated)/stations/page.tsx
'use client';

import { useState } from 'react';
import { StationWithDetails } from '@/types/station';
import { StationForm } from '@/components/stations/StationForm';
import { StationsTable } from '@/components/stations/StationsTable';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useStations } from '@/hooks/stations/useStations';
import { useDeleteStation } from '@/hooks/stations/useDeleteStation';

export default function NormalizedStationsPage() {
  const { stations, loading, error, refetch } = useStations();
  const { deleteStation } = useDeleteStation();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StationWithDetails | undefined>(undefined);

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
        alert('Erreur: L\'identifiant de la station est manquant.');
      }
    }
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
        stations={stations} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editing ? 'Modifier la station' : 'Créer une station'}
        size="xl"
      >
        <StationForm mode={editing ? 'edit' : 'create'} station={editing} onSaved={() => {
            setShowForm(false);
            refetch();
        }} />
      </Modal>
    </div>
  );
}