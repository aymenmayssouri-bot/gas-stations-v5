// src/components/dashboard/MapPreview.tsx
import React, { useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { StationWithDetails } from '@/types/station';

interface MapPreviewProps { stations: StationWithDetails[] }
const mapContainerStyle = { width: '100%', height: '480px', borderRadius: '16px' };

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim();
}

export default function MapPreview({ stations }: MapPreviewProps) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' });
  const [selected, setSelected] = useState<StationWithDetails | null>(null);

  const center = useMemo(() => ({ lat: 31.6295, lng: -7.9811 }), []); // Morocco center-ish

  if (!isLoaded) return null;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={6} center={center}>
      {stations.map((s) => (
        <Marker
          key={s.station.StationID}
          position={{ lat: s.station.Latitude || 0, lng: s.station.Longitude || 0 }}
          onClick={() => setSelected(s)}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.station.Latitude || 0, lng: selected.station.Longitude || 0 }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ maxWidth: 260 }}>
            <div className="font-semibold">{selected.station.NomStation}</div>
            <div className="text-xs text-gray-600">{selected.station.Adresse}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div><strong>Commune:</strong> {selected.commune.NomCommune}</div>
              <div><strong>Province:</strong> {selected.province.NomProvince}</div>
              <div><strong>Marque:</strong> {selected.marque.Marque}</div>
              <div><strong>Gérant:</strong> {selected.gerant.fullName || safeFullName(selected.gerant.PrenomGerant, selected.gerant.NomGerant)}</div>
              {selected.proprietaire && (
                <div>
                  <strong>Propriétaire:</strong>{' '}
                  {selected.proprietaire.base.TypeProprietaire === 'Physique'
                    ? safeFullName(
                        (selected.proprietaire.details as any).PrenomProprietaire,
                        (selected.proprietaire.details as any).NomProprietaire,
                      )
                    : (selected.proprietaire.details as any).NomEntreprise}
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}