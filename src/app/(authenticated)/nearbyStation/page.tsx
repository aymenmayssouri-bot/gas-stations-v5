// src/app/(authenticated)/nearbyStation/page.tsx
'use client';

import { useState } from 'react';
import { useNearbyStations } from '@/hooks/stations/useNearbyStations';
import NearbyStationsTable from '@/components/stations/NearbyStationsTable';
import { Button } from '@/components/ui/Button'; // shadcn Button
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'; // Optional for better UI

export default function NearbyStationsPage() {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const { nearbyStations, nearbyLoading, nearbyError, fetchNearbyStations, stationsLoading, stationsError } = useNearbyStations();

  const handleSearch = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Veuillez entrer des coordonnées valides.');
      return;
    }

    fetchNearbyStations(lat, lng);
  };

  if (stationsLoading) {
    return <div className="p-4">Chargement des stations...</div>;
  }

  if (stationsError) {
    return <div className="p-4 text-red-600">Erreur: {stationsError}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Stations à proximité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="number"
              step="any"
              placeholder="Latitude (ex: 48.8566)"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude (ex: 2.3522)"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={nearbyLoading || !latitude || !longitude}>
              {nearbyLoading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>

          {nearbyError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {nearbyError}
            </div>
          )}

          {nearbyStations.length > 0 ? (
            <NearbyStationsTable stations={nearbyStations} />
          ) : (
            !nearbyLoading && <p className="text-gray-500">Entrez des coordonnées et recherchez pour voir les stations proches.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}