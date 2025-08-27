'use client';

import { StationForm } from '@/components/stations/StationForm';
import Card from '@/components/ui/Card';

export default function NewStationPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créer une station</h1>
        <p className="text-sm text-gray-600">Renseignez les informations de la nouvelle station-service.</p>
      </div>

      <Card>
        {/* StationForm should internally use useStationForm(mode='create') */}
        <StationForm mode="create" />
      </Card>
    </div>
  );
}