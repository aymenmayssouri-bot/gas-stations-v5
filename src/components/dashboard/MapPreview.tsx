import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GasStation } from '@/types/station';

interface MapPreviewProps { stations: GasStation[]; }

const mapContainerStyle = { width: '100%', height: '480px', borderRadius: '16px' };

function formatCapacity(capacity: number | null): string {
  if (capacity === null || capacity === undefined) return 'N/A';
  return `${capacity.toLocaleString('fr-FR')} L`;
}

export default function MapPreview({ stations }: MapPreviewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<GasStation | null>(null);

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
      if (s.Latitude != null && s.Longitude != null) {
        bounds.extend({ lat: s.Latitude, lng: s.Longitude });
        has = true;
      }
    });
    if (has) mapRef.current.fitBounds(bounds);
  }, [stations]);

  if (!isLoaded) return null;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10} onLoad={onLoad}>
      {stations.map((s) =>
        s.Latitude != null && s.Longitude != null ? (
          <Marker
            key={s.id}
            position={{ lat: s.Latitude, lng: s.Longitude }}
            onClick={() => setSelected(s)}
          />
        ) : null
      )}

      {selected && selected.Latitude != null && selected.Longitude != null && (
        <InfoWindow
          position={{ lat: selected.Latitude, lng: selected.Longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="text-sm max-w-xs">
            <div className="space-y-2">
              <div>
                <strong>Marque:</strong> {selected['Marque'] || 'N/A'}
              </div>
              <div>
                <strong>Propriétaire:</strong> {selected['Propriétaire'] || 'N/A'}
              </div>
              <div>
                <strong>Nom de Station:</strong> {selected['Nom de Station'] || 'N/A'}
              </div>
              <div>
                <strong>Commune:</strong> {selected['Commune'] || 'N/A'}
              </div>
              <div>
                <strong>Latitude:</strong> {selected['Latitude']?.toFixed(6) || 'N/A'}
              </div>
              <div>
                <strong>Longitude:</strong> {selected['Longitude']?.toFixed(6) || 'N/A'}
              </div>
              <div>
                <strong>Capacité Gasoil:</strong> {formatCapacity(selected['Capacité Gasoil'])}
              </div>
              <div>
                <strong>Capacité SSP:</strong> {formatCapacity(selected['Capacité SSP'])}
              </div>
              <div>
                <strong>Téléphone:</strong> {selected['numéro de Téléphone'] || 'N/A'}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}