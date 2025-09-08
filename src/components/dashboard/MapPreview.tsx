// src/components/dashboard/MapPreview.tsx
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { StationWithDetails, ProprietairePhysique, ProprietaireMorale } from '@/types/station';
import { getProprietaireName } from '@/utils/format';

interface MapPreviewProps {
  stations: StationWithDetails[];
}

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '8px' };

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim() || 'N/A';
}

export default function MapPreview({ stations }: MapPreviewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
  const [selected, setSelected] = useState<StationWithDetails | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const center = useMemo(() => ({ lat: 31.7917, lng: -7.0926 }), []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (stations.length === 0) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(6);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoords = false;
    stations.forEach((s) => {
      if (s.station.Latitude && s.station.Longitude) {
        bounds.extend({ lat: s.station.Latitude, lng: s.station.Longitude });
        hasValidCoords = true;
      }
    });

    if (hasValidCoords) {
      mapRef.current.fitBounds(bounds);
    } else {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(6);
    }
  }, [stations, center]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={6} center={center} onLoad={onLoad}>
      {stations.map((s) =>
        s.station.Latitude && s.station.Longitude ? (
          <Marker
            key={s.station.StationID}
            position={{ lat: s.station.Latitude, lng: s.station.Longitude }}
            onClick={() => setSelected(s)}
          />
        ) : null
      )}

      {selected && selected.station.Latitude && selected.station.Longitude && (
        <InfoWindow
          position={{ lat: selected.station.Latitude, lng: selected.station.Longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ maxWidth: 280, padding: '4px' }}>
            <h3 className="font-bold text-md mb-1">{selected.station.NomStation}</h3>
            <div className="text-xs text-gray-600 mb-2">{selected.station.Adresse}</div>

            <div className="space-y-1 text-sm">
              <div>
                <strong>Marque:</strong> {selected.marque.Marque}
              </div>
              <div>
                <strong>Propriétaire:</strong> {getProprietaireName(selected)}
              </div>
              <div>
                <strong>Gérant:</strong>{' '}
                {safeFullName(selected.gerant.PrenomGerant, selected.gerant.NomGerant)}
              </div>
              <div>
                <strong>Commune:</strong> {selected.commune.NomCommune}
              </div>
              <div>
                <strong>Province:</strong> {selected.province.NomProvince}
              </div>
              <div className="text-xs pt-1">
                <strong>Coords:</strong>{' '}
                {selected.station.Latitude.toFixed(5)}, {selected.station.Longitude.toFixed(5)}
              </div>
            </div>

            <div className="mt-3">
              <Link
                href={`/stations/${selected.station.StationID}`}
                className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
              >
                Voir détails
              </Link>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}