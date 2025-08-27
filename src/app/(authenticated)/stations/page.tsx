'use client';

import { useState } from 'react';
import { useGasStations } from '@/hooks/useGasStations';
import { useStationCRUD } from '@/hooks/useStationCRUD';
import { GasStation } from '@/types/station';
import { StationForm } from '@/components/stations/StationForm';
import { StationsTable } from '@/components/stations/StationsTable';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function StationsPage() {
  const { stations, loading, error, refetch } = useGasStations();
  const { deleteStation } = useStationCRUD();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GasStation | undefined>(undefined);

  const handleAdd = () => {
    setEditing(undefined);
    setShowForm(true);
  };

  const handleEdit = (s: GasStation) => {
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (s: GasStation) => {
    await deleteStation(s.id);
    refetch?.();
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
        <h1 className="text-xl font-semibold">Stations</h1>
        <Button onClick={handleAdd}>Ajouter une station</Button>
      </div>

      <StationsTable stations={stations} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifier la station' : 'Créer une station'}>
        <StationForm
          mode={editing ? 'edit' : 'create'}
          station={editing}
          onSaved={() => {
            setShowForm(false);
            refetch?.();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}