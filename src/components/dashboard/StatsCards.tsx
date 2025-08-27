// File: src/components/dashboard/StatsCards.tsx
// This component has been updated to remove price stats and
// add capacity-related statistics based on the new schema.

import React from 'react';
import  Card  from '@/components/ui/Card';
import { GasStation } from '@/types/station';
import { 
  getUniqueBrands, 
  getStationsByType, 
  formatCapacity, 
} from '@/lib/utils/stationUtils';

interface StatsCardProps {
  label: string;
  value: string | number;
}

function StatsCard({ label, value }: StatsCardProps) {
  return (
    <Card className="flex flex-col p-6 items-center text-center">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-blue-600">{value}</p>
    </Card>
  );
}

interface StatsCardsProps {
  allStations: GasStation[];
}

export function StatsCards({ allStations }: StatsCardsProps) {
  const totalStations = allStations.length;
  const uniqueBrands = getUniqueBrands(allStations);
  const serviceStations = getStationsByType(allStations, 'service');
  const remplissageStations = getStationsByType(allStations, 'remplissage');

  // Calculate total capacities
  const totalGasoilCapacity = allStations.reduce((sum, station) => sum + (station['Capacité Gasoil'] || 0), 0);
  const totalSSPCapacity = allStations.reduce((sum, station) => sum + (station['Capacité SSP'] || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatsCard
        label="Total Stations"
        value={totalStations}
      />
      <StatsCard
        label="Total Brands"
        value={uniqueBrands.length}
      />
      <StatsCard
        label="Service Stations"
        value={serviceStations.length}
      />
      <StatsCard
        label="Remplissage Stations"
        value={remplissageStations.length}
      />
      <StatsCard
        label="Total Gasoil Capacity"
        value={formatCapacity(totalGasoilCapacity)}
      />
      <StatsCard
        label="Total SSP Capacity"
        value={formatCapacity(totalSSPCapacity)}
      />
    </div>
  );
}