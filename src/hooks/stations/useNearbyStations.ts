import { useState, useCallback, useEffect } from 'react';
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
  const { stations, loading: stationsLoading, error: stationsError } = useStations();
  const [nearbyStations, setNearbyStations] = useState<(StationWithDetails & { distance: number })[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  useEffect(() => {
    if (stationsError) {
      setNearbyError(`Erreur de chargement des stations: ${stationsError}`);
    }
  }, [stationsError]);

  const fetchNearbyStations = useCallback(async (latitude: number, longitude: number) => {
    if (stationsLoading || stations.length === 0) {
      setNearbyError('Stations non chargées. Veuillez patienter.');
      return;
    }

    setNearbyLoading(true);
    setNearbyError(null);
    setNearbyStations([]);

    try {
      // Validate and round input coordinates
      if (!isFinite(latitude) || !isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new Error('Coordonnées invalides fournies.');
      }
      const roundedLat = Number(latitude.toFixed(6));
      const roundedLng = Number(longitude.toFixed(6));

      // Log all stations
      console.log('All stations from Firebase:', stations);

      // Initial filter using Haversine
      const nearbyCandidates = stations
        .filter((station) => {
          if (
            station.station.Latitude == null ||
            station.station.Longitude == null ||
            !isFinite(station.station.Latitude) ||
            !isFinite(station.station.Longitude)
          ) {
            console.warn('Invalid station coordinates:', station);
            return false;
          }
          return true;
        })
        .map((station) => ({
          ...station,
          haversineDistance: getHaversineDistance(
            roundedLat,
            roundedLng,
            Number(station.station.Latitude.toFixed(6)),
            Number(station.station.Longitude.toFixed(6))
          ),
        }))
        .filter((station) => station.haversineDistance < 20)
        .slice(0, 25);

      console.log('Nearby candidates:', nearbyCandidates);
      console.log('Destinations string:', nearbyCandidates.map((s) => `${Number(s.station.Latitude.toFixed(6))},${Number(s.station.Longitude.toFixed(6))}`).join('|'));

      if (nearbyCandidates.length === 0) {
        setNearbyError('Aucune station trouvée à moins de 20 km en ligne droite.');
        return;
      }

      // Prepare API request
      const origin = `${roundedLat},${roundedLng}`;
      const destinations = nearbyCandidates
        .map((s) => `${Number(s.station.Latitude.toFixed(6))},${Number(s.station.Longitude.toFixed(6))}`)
        .join('|');

      console.log('Origin:', origin);
      console.log('Destinations:', destinations);
      console.log('Origin Header:', window.location.origin);

      const url = `/api/distance-matrix?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destinations)}&mode=driving&units=metric&language=fr`;
      console.log('Fetching via proxy:', url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        console.error('Fetch failed:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error('Requête annulée: dépassement du délai de 15 secondes.');
        }
        throw new Error(`Échec de la requête API: ${fetchError.message}`);
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, response.statusText, errorText);
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Full API Response:', JSON.stringify(data, null, 2));

      if (data.status !== 'OK') {
        console.error('API Error:', data.error_message, data.status);
        throw new Error(data.error_message || `API Error: ${data.status}`);
      }

      const results = nearbyCandidates
        .map((station, index) => {
          const element = data.rows[0].elements[index];
          console.log(`Element ${index}:`, element);
          // Handle ZERO_RESULTS or 0 distance
          if (element.status === 'OK' || element.status === 'ZERO_RESULTS') {
            const distanceKm = element.distance?.value ? element.distance.value / 1000 : 0;
            // Include stations with 0 distance or within 20km
            if (distanceKm <= 20) {
              return { ...station, distance: distanceKm };
            }
          }
          return null;
        })
        .filter((station): station is StationWithDetails & { distance: number; haversineDistance: number } => station !== null)
        .map(({ haversineDistance, ...station }) => station)
        .sort((a, b) => a.distance - b.distance);

      if (results.length === 0) {
        setNearbyError('Aucune station accessible par route à moins de 20 km.');
      } else {
        setNearbyStations(results);
      }
    } catch (err: any) {
      console.error('Erreur lors de la recherche:', err);
      setNearbyError(err.message || 'Erreur inconnue lors de la recherche.');
    } finally {
      setNearbyLoading(false);
    }
  }, [stations, stationsLoading]);

  return { 
    nearbyStations, 
    nearbyLoading, 
    nearbyError, 
    fetchNearbyStations, 
    stationsLoading, 
    stationsError 
  };
}