// src/app/(authenticated)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useStations } from '@/hooks/stations/useStations';
import { StationWithDetails } from '@/types/station';

// Import newly created dashboard components
import StationFilters from '@/components/dashboard/StationFilters';
import StationsByBrandChart from '@/components/dashboard/StationsByBrandChart';
import StatsCards from '@/components/dashboard/StatsCards';
import MapPreview from '@/components/dashboard/MapPreview';

// Import from the UI barrel file
import { Card, LoadingSpinner, ErrorMessage } from '@/components/ui';

export default function DashboardPage() {
  const { stations, loading, error } = useStations();
  const [filteredStations, setFilteredStations] = useState<StationWithDetails[]>([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} />
      </div> 
    );
  }

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Stations-service Dashboard</h1>
        <p className="text-sm text-gray-600">Vue d'ensemble avec des filtres interactifs.</p>
      </div>

      {/* Stats Cards now uses the dedicated component */}
      <StatsCards stations={filteredStations} />

      {/* All filtering logic is now handled inside this component */}
      <StationFilters stations={stations} onFilterChange={setFilteredStations} />

      {/* Bar Chart is now a dedicated component */}
      <StationsByBrandChart stations={filteredStations} />

      {/* Map Preview */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Carte des stations</h2>
        <div className="h-96">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <MapPreview stations={filteredStations} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100 rounded">
              Clé API Google Maps manquante.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}