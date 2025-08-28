// src/components/dashboard/MapPreviewNormalized.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { StationWithDetails } from '@/types/station';

interface MapPreviewProps { 
  stations: StationWithDetails[]; 
}

const mapContainerStyle = { width: '100%', height: '480px', borderRadius: '16px' };

function formatCapacity(capacity: number | null): string {
  if (capacity === null || capacity === undefined) return 'N/A';
  return `${capacity.toLocaleString('fr-FR')} L`;
}

export default function MapPreviewNormalized({ stations }: MapPreviewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<StationWithDetails | null>(null);

  const center = useMemo(() => {
    // fallback to Casablanca if no coords
    return { lat: 33.5731, lng: -7.5898 };
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    let has = false;
    stations.forEach((s) => {
      if (s.station.Latitude != null && s.station.Longitude != null) {
        bounds.extend({ lat: s.station.Latitude, lng: s.station.Longitude });
        has = true;
      }
    });
    if (has) mapRef.current.fitBounds(bounds);
  }, [stations]);

  if (!isLoaded) return null;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10} onLoad={onLoad}>
      {stations.map((s) =>
        s.station.Latitude != null && s.station.Longitude != null ? (
          <Marker
            key={s.station.id}
            position={{ lat: s.station.Latitude, lng: s.station.Longitude }}
            onClick={() => setSelected(s)}
          />
        ) : null
      )}

      {selected && selected.station.Latitude != null && selected.station.Longitude != null && (
        <InfoWindow
          position={{ lat: selected.station.Latitude, lng: selected.station.Longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="text-sm max-w-xs">
            <div className="space-y-2">
              <div>
                <strong>Station:</strong> {selected.station.NomStation}
              </div>
              <div>
                <strong>Marque:</strong> {selected.marque.Marque}
              </div>
              <div>
                <strong>Adresse:</strong> {selected.station.Adresse}
              </div>
              <div>
                <strong>Commune:</strong> {selected.commune.Commune}
              </div>
              <div>
                <strong>Province:</strong> {selected.province.Province}
              </div>
              <div>
                <strong>Gérant:</strong> {selected.gerant.Gerant}
              </div>
              <div>
                <strong>Type:</strong> {selected.station.Type}
              </div>
              <div>
                <strong>Coordonnées:</strong> {selected.station.Latitude?.toFixed(6)}, {selected.station.Longitude?.toFixed(6)}
              </div>
              {selected.capacites.length > 0 && (
                <div>
                  <strong>Capacités:</strong>
                  {selected.capacites.map(cap => (
                    <div key={cap.id} className="ml-2">
                      {cap.TypeCarburant}: {formatCapacity(cap.CapaciteLitres)}
                    </div>
                  ))}
                </div>
              )}
              {selected.gerant.Telephone && (
                <div>
                  <strong>Téléphone:</strong> {selected.gerant.Telephone}
                </div>
              )}
              {selected.proprietaire && (
                <div>
                  <strong>Propriétaire:</strong> {
                    selected.proprietaire.base.TypeProprietaire === 'Physique' 
                      ? (selected.proprietaire.details as any).NomProprietaire
                      : (selected.proprietaire.details as any).NomEntreprise
                  }
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}