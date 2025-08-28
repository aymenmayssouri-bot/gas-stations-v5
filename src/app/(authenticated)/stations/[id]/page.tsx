'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useStations } from '@/hooks/stations/useStations';
import { StationForm } from '@/components/stations/StationForm';

export default function EditStationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { stations, loading, error } = useStations();

  const selected = useMemo(() => stations.find(s => s.station.id === id), [stations, id]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="p-6">
        <ErrorMessage error="Station introuvable." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la station</h1>
        <p className="text-sm text-gray-600">
          {selected.station.NomStation} — {selected.marque.Marque}
        </p>
      </div>

      <Card>
        <StationForm mode="edit" station={selected} />
      </Card>
    </div>
  );
}
