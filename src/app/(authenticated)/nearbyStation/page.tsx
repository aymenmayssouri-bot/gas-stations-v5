// src/app/(authenticated)/nearbyStation/page.tsx
'use client';// src/app/(authenticated)/nearbyStations/page.tsx
'use client';

import { useState } from 'react';
import { useNearbyStations } from '@/hooks/stations/useNearbyStations';
import NearbyStationsTable from '@/components/stations/NearbyStationsTable';

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
    return <div>Chargement des stations...</div>;
  }

  if (stationsError) {
    return <div>Erreur: {stationsError}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stations à proximité</h1>
      
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={nearbyLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {nearbyLoading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {nearbyError && <p className="text-red-600 mb-4">{nearbyError}</p>}

      {nearbyStations.length > 0 && (
        <NearbyStationsTable stations={nearbyStations} />
      )}
    </div>
  );
}