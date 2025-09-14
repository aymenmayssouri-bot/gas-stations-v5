// src/hooks/stations/useNearbyStations.ts
import { useState, useCallback } from 'react';
import { StationWithDetails } from '@/types/station';
import { useStations } from './useStations';

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function useNearbyStations() {
  const { stations, loading, error } = useStations();
  const [nearbyStations, setNearbyStations] = useState<(StationWithDetails & { distance: number })[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  const fetchNearbyStations = useCallback(async (latitude: number, longitude: number) => {
    setNearbyLoading(true);
    setNearbyError(null);
    setNearbyStations([]);

    try {
      // Validate input coordinates
      if (!isFinite(latitude) || !isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new Error('Coordonnées invalides fournies.');
      }

      // Initial filter using Haversine to reduce API calls
      const nearby = stations
        .filter((station) => 
          station.station.Latitude != null && 
          station.station.Longitude != null && 
          isFinite(station.station.Latitude) && 
          isFinite(station.station.Longitude)
        )
        .map((station) => ({
          ...station,
          haversineDistance: getHaversineDistance(
            latitude,
            longitude,
            station.station.Latitude,
            station.station.Longitude
          ),
        }))
        .filter((station) => station.haversineDistance < 20);

      if (nearby.length === 0) {
        setNearbyError('Aucune station trouvée à moins de 20 km.');
        setNearbyLoading(false);
        return;
      }

      // Prepare origins and destinations for Distance Matrix API
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Clé API Google Maps manquante. Vérifiez la variable d\'environnement NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
      }

      const origin = `${latitude},${longitude}`;
      const destinations = nearby
        .map((s) => `${s.station.Latitude},${s.station.Longitude}`)
        .join('|');

      // Log the URL for debugging (remove in production)
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(destinations)}&mode=driving&key=${apiKey}`;
      console.log('Google Maps API URL:', url);

      // Make API request with error handling
      let response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (fetchError: any) {
        throw new Error(`Échec de la requête API: ${fetchError.message}`);
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(data.error_message || 'Échec de la récupération des distances depuis l\'API Google Maps');
      }

      // Process API results
      const results = nearby
        .map((station, index) => {
          const element = data.rows[0].elements[index];
          if (element.status === 'OK') {
            const distanceKm = element.distance.value / 1000; // Convert meters to kilometers
            if (distanceKm < 20) {
              return {
                ...station,
                distance: distanceKm,
              };
            }
          }
          return null;
        })
        .filter((station): station is StationWithDetails & { distance: number; haversineDistance: number } => station !== null)
        .map(({ haversineDistance, ...station }) => station) // Remove haversineDistance
        .sort((a, b) => a.distance - b.distance);

      if (results.length === 0) {
        setNearbyError('Aucune station accessible par route à moins de 20 km.');
      }

      setNearbyStations(results);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des stations à proximité:', err);
      setNearbyError(err.message || 'Erreur lors de la recherche des stations à proximité');
    } finally {
      setNearbyLoading(false);
    }
  }, [stations]);

  return { nearbyStations, nearbyLoading, nearbyError, fetchNearbyStations, stationsLoading: loading, stationsError: error };
}