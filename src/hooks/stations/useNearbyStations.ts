import { useState, useCallback, useEffect } from 'react';
import { StationWithDetails } from '@/types/station';
import { useStations } from './useStations';

// --- CONSTANTS ---
const MAX_DRIVING_KM = 20; // Search radius for driving distance
const MAX_DEST_PER_REQUEST = 20; // Max destinations per Distance Matrix API call
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes cache lifetime

// --- CACHE ---
// In-memory cache for storing distance results to avoid repeated API calls.
const distanceCache = new Map<string, { distanceKm: number; timestamp: number }>();

// --- HELPER FUNCTIONS ---

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

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

/**
 * Computes a square bounding box for quick location filtering.
 * @returns An object with min/max latitude and longitude.
 */
function computeBoundingBox(lat: number, lon: number, km: number) {
  const latDelta = km / 110.574;
  const lonDelta = km / (111.32 * Math.cos(deg2rad(lat)));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

/**
 * Creates a unique key for the cache from origin and destination coordinates.
 */
function cacheKey(originLat: number, originLng: number, destLat: number, destLng: number): string {
  return `${originLat.toFixed(6)},${originLng.toFixed(6)}|${destLat.toFixed(6)},${destLng.toFixed(6)}`;
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

  const fetchNearbyStations = useCallback(
    async (latitude: number, longitude: number) => {
      if (stationsLoading || stations.length === 0) return;

      setNearbyLoading(true);
      setNearbyError(null);

      try {
        if (!isFinite(latitude) || !isFinite(longitude)) throw new Error('Coordonnées invalides.');
        const roundedLat = Number(latitude.toFixed(6));
        const roundedLng = Number(longitude.toFixed(6));

        // 1. Fast Pre-filter: Bounding Box
        const bbox = computeBoundingBox(roundedLat, roundedLng, MAX_DRIVING_KM);
        const bboxCandidates = stations.filter(s => {
            const lat = s.station.Latitude;
            const lon = s.station.Longitude;
            return lat && lon && lat >= bbox.minLat && lat <= bbox.maxLat && lon >= bbox.minLon && lon <= bbox.maxLon;
        });
        
        // 2. Accurate Pre-filter: Haversine Distance
        const haversineCandidates = bboxCandidates
          .map(s => ({
            station: s,
            haversineDistance: getHaversineDistance(roundedLat, roundedLng, s.station.Latitude!, s.station.Longitude!),
          }))
          .filter(x => x.haversineDistance <= MAX_DRIVING_KM);
        
        if (haversineCandidates.length === 0) {
          setNearbyStations([]);
          return;
        }

        // 3. Use Cache and Prepare API Requests
        const finalResults: (StationWithDetails & { distance: number })[] = [];
        const destinationsToFetch: typeof haversineCandidates = [];
        const now = Date.now();

        for (const candidate of haversineCandidates) {
            const key = cacheKey(roundedLat, roundedLng, candidate.station.station.Latitude!, candidate.station.station.Longitude!);
            const cached = distanceCache.get(key);

            if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
                if (cached.distanceKm <= MAX_DRIVING_KM) {
                    finalResults.push({ ...candidate.station, distance: cached.distanceKm });
                }
            } else {
                destinationsToFetch.push(candidate);
            }
        }

        // 4. Fetch Distances for Non-Cached Stations in Chunks
        for (let i = 0; i < destinationsToFetch.length; i += MAX_DEST_PER_REQUEST) {
            const chunk = destinationsToFetch.slice(i, i + MAX_DEST_PER_REQUEST);
            const originStr = `${roundedLat},${roundedLng}`;
            const destStr = chunk.map(c => `${c.station.station.Latitude!.toFixed(6)},${c.station.station.Longitude!.toFixed(6)}`).join('|');
            
            const url = `/api/distance-matrix?origins=${encodeURIComponent(originStr)}&destinations=${encodeURIComponent(destStr)}&mode=driving`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur de l\'API de distance.');
            
            const data = await response.json();
            if (data.status !== 'OK') throw new Error(data.error_message || `API Error: ${data.status}`);
            
            const elements = data.rows[0].elements;
            elements.forEach((element: any, index: number) => {
                const correspondingStation = chunk[index];
                let distanceKm = Infinity;

                if (element.status === 'OK' && element.distance) {
                    distanceKm = element.distance.value / 1000;
                }
                
                // Add to cache
                const key = cacheKey(roundedLat, roundedLng, correspondingStation.station.station.Latitude!, correspondingStation.station.station.Longitude!);
                distanceCache.set(key, { distanceKm, timestamp: Date.now() });

                // Add to results if within range
                if (distanceKm <= MAX_DRIVING_KM) {
                    finalResults.push({ ...correspondingStation.station, distance: distanceKm });
                }
            });
        }
        
        // 5. Sort and Set Final State
        finalResults.sort((a, b) => a.distance - b.distance);
        setNearbyStations(finalResults);

        if (finalResults.length === 0) {
            setNearbyError(`Aucune station trouvée à moins de ${MAX_DRIVING_KM} km par la route.`);
        }

      } catch (err: any) {
        console.error('Erreur lors de la recherche des stations à proximité:', err);
        setNearbyError(err.message || 'Erreur inconnue.');
      } finally {
        setNearbyLoading(false);
      }
    },
    [stations, stationsLoading]
  );

  return {
    nearbyStations,
    nearbyLoading,
    nearbyError,
    fetchNearbyStations,
    stationsLoading,
    stationsError,
  };
}