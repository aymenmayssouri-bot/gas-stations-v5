// src/components/dashboard/StatsCards.tsx
'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
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
  const { total, totalGasoil, totalSSP } = useMemo(() => {
    let total = stations.length;
    let serviceCount = 0; // Kept for potential future use, but not displayed
    let totalGasoil = 0;
    let totalSSP = 0;

    for (const s of stations) {
      for (const cap of s.capacites) {
        if (cap.TypeCarburant === 'Gasoil') totalGasoil += cap.CapaciteLitres || 0; //
        if (cap.TypeCarburant === 'SSP') totalSSP += cap.CapaciteLitres || 0; //
      }
    }
    return { total, serviceCount, totalGasoil, totalSSP };
  }, [stations]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard label="Nombre de stations" value={total} />
      
      {/* Combined Capacities Card */}
      <Card>
        <div className="text-sm text-gray-500">Capacités de stockage</div>
        <div className="mt-2 space-y-1">
            <div className="text-lg font-semibold text-gray-900">
                <span className="font-medium text-gray-600">SSP: </span>
                {formatCapacity(totalSSP)}
            </div>
            <div className="text-lg font-semibold text-gray-900">
                <span className="font-medium text-gray-600">Gasoil: </span>
                {formatCapacity(totalGasoil)}
            </div>
        </div>
      </Card>
    </div>
  );
}

export default StatsCards;