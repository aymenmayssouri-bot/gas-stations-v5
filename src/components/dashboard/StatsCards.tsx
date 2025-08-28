// File: src/components/dashboard/StatsCards.tsx
// Stats based on normalized StationWithDetails[]

import React, { useMemo } from 'react';
import Card from '@/components/ui/Card';
import { StationWithDetails } from '@/types/station';

interface StatsCardProps {
  label: string;
  value: string | number;
}

function StatsCard({ label, value }: StatsCardProps) {
  return (
    <Card>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </Card>
  );
}

function formatCapacity(n: number) {
  return `${n.toLocaleString('fr-FR')} L`;
}

export function StatsCards({ stations }: { stations: StationWithDetails[] }) {
  const { total, serviceCount, remplissageCount, totalGasoil, totalSSP } = useMemo(() => {
    let total = stations.length;
    let serviceCount = 0;
    let remplissageCount = 0;
    let totalGasoil = 0;
    let totalSSP = 0;

    for (const s of stations) {
      if (s.station.Type === 'service') serviceCount++;
      if (s.station.Type === 'remplissage') remplissageCount++;

      for (const cap of s.capacites) {
        if (cap.TypeCarburant === 'Gasoil') totalGasoil += cap.CapaciteLitres || 0;
        if (cap.TypeCarburant === 'SSP') totalSSP += cap.CapaciteLitres || 0;
      }
    }
    return { total, serviceCount, remplissageCount, totalGasoil, totalSSP };
  }, [stations]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard label="Total stations" value={total} />
      <StatsCard label="Stations service" value={serviceCount} />
      <StatsCard label="Stations remplissage" value={remplissageCount} />
      <StatsCard label="Capacité Gasoil" value={formatCapacity(totalGasoil)} />
      <StatsCard label="Capacité SSP" value={formatCapacity(totalSSP)} />
    </div>
  );
}

export default StatsCards;
