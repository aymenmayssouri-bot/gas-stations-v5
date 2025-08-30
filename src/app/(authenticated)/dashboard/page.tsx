// src/app/(authenticated)/dashboard/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useStations } from '@/hooks/stations/useStations';
import MapPreview from '@/components/dashboard/MapPreview';
import { StationWithDetails } from '@/types/station';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fallback minimal UI components to avoid breaking builds if your design system is different
function Card({ title, value, children }: { title: string; value?: any; children?: any }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      {value !== undefined ? <div className="text-2xl font-semibold">{value}</div> : children}
    </div>
  );
}

function LoadingSpinner() {
  return <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full" />;
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3">{message}</div>;
}

function formatCapacity(n: number) {
  return n?.toLocaleString('fr-FR') || '0';
}

export default function DashboardPage() {
  const { stations, loading, error } = useStations();
  const [onlyWithCoords, setOnlyWithCoords] = useState(true);

  const filtered: StationWithDetails[] = useMemo(() => {
    return stations.filter((s) =>
      onlyWithCoords ? (s.station.Latitude || 0) !== 0 && (s.station.Longitude || 0) !== 0 : true
    );
  }, [stations, onlyWithCoords]);

  const byProvince = useMemo(() => {
    const map = new Map<string, number>();
    stations.forEach((s) => {
      const name = s.province.NomProvince?.trim() || '—';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [stations]);

  const capacities = useMemo(() => {
    let gasoil = 0, ssp = 0;
    stations.forEach((s) => {
      s.capacites.forEach((c) => {
        if (c.TypeCarburant === 'Gasoil') gasoil += c.CapaciteLitres || 0;
        if (c.TypeCarburant === 'SSP') ssp += c.CapaciteLitres || 0;
      });
    });
    return { gasoil, ssp };
  }, [stations]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Loading Dashboard...</h2>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Error Loading Dashboard</h2>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">No Data Found</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No gas stations found in the normalized database.</p>
          <p className="text-yellow-700 text-sm mt-2">If you haven't migrated your data yet, please run the migration tool first.</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stations-service (Normalized)</h1>
        <p className="text-sm text-gray-600">Vue d'ensemble avec structure normalisée.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Stations" value={stations.length} />
        <Card title="Capacité Gasoil (L)" value={formatCapacity(capacities.gasoil)} />
        <Card title="Capacité SSP (L)" value={formatCapacity(capacities.ssp)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Répartition par province">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProvince}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Carte (aperçu)">
          <div className="mb-2 flex items-center gap-2">
            <input
              id="coordsOnly"
              type="checkbox"
              checked={onlyWithCoords}
              onChange={(e) => setOnlyWithCoords(e.target.checked)}
            />
            <label htmlFor="coordsOnly">Afficher uniquement les stations avec coordonnées</label>
          </div>
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <MapPreview stations={filtered} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100 rounded">
              <div className="text-center">
                <p>Google Maps API key not configured</p>
                <p className="text-sm mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}