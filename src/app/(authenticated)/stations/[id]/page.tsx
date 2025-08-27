'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useGasStations } from '@/hooks/useGasStations';
import { StationForm } from '@/components/stations/StationForm';
import { GasStation } from '@/types/station';

export default function EditStationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { stations, loading, error } = useGasStations();
  const [selected, setSelected] = useState<GasStation | null>(null);

  useEffect(() => {
    if (!id) return;
    const found = stations.find((s) => s.id === id) || null;
    setSelected(found);
  }, [id, stations]);

  if (!id || typeof id !== 'string') {
    return <div className="p-6"><ErrorMessage message="ID de station invalide." /></div>;
  }

  if (loading) {
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-6"><ErrorMessage message={error} /></div>;
  }

  if (!selected) {
    return <div className="p-6"><ErrorMessage message="Station introuvable." /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la station</h1>
        <p className="text-sm text-gray-600">
          {selected['Nom de Station']} — {selected['Marque']}
        </p>
      </div>

      <Card>
        {/* StationForm should internally use useStationForm(mode='edit', station) */}
        <StationForm mode="edit" station={selected} />
      </Card>
    </div>
  );
}