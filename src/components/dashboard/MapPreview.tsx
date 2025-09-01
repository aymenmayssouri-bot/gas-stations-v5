// src/components/dashboard/MapPreview.tsx
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { StationWithDetails } from '@/types/station';

interface MapPreviewProps { stations: StationWithDetails[] }
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '8px' };

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim();
}

export default function MapPreview({ stations }: MapPreviewProps) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' });
  const [selected, setSelected] = useState<StationWithDetails | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const center = useMemo(() => ({ lat: 31.7917, lng: -7.0926 }), []); // Morocco center

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
    stations.forEach(s => {
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
      {stations.map((s) => (
        s.station.Latitude && s.station.Longitude ? (
          <Marker
            key={s.station.StationID}
            position={{ lat: s.station.Latitude, lng: s.station.Longitude }}
            onClick={() => setSelected(s)}
          />
        ) : null
      ))}

      {selected && selected.station.Latitude && selected.station.Longitude && (
        <InfoWindow
          position={{ lat: selected.station.Latitude, lng: selected.station.Longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ maxWidth: 260 }}>
            <div className="font-semibold">{selected.station.NomStation}</div>
            <div className="text-xs text-gray-600">{selected.station.Adresse}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div><strong>Marque:</strong> {selected.marque.Marque}</div>
              <div><strong>Gérant:</strong> {safeFullName(selected.gerant.PrenomGerant, selected.gerant.NomGerant)}</div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}