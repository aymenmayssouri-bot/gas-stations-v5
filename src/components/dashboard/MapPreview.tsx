// src/components/dashboard/MapPreview.tsx
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { StationWithDetails } from '@/types/station';
import { getProprietaireName } from '@/utils/format';
import { MarkerClusterer } from "@googlemaps/markerclusterer";

interface MapPreviewProps {
  stations: StationWithDetails[];
}

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '8px' };

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim() || 'N/A';
}

// Map styles configuration
const mapStyles = [
  { elementType: "geometry", stylers: [{ visibility: "on" }] },
  { featureType: "administrative.country", elementType: "geometry", stylers: [{ visibility: "on" }] },
  { featureType: "administrative.country", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] }
];

// Palette of 30 distinct colors
const colorPalette = [
  '#ff0000', '#ff3200', '#ff6600', '#ff9900', '#ffcc00',
  '#ffff00', '#cbff00', '#99ff00', '#65ff00', '#33ff00',
  '#00ff00', '#00ff32', '#00ff66', '#00ff99', '#00ffcb',
  '#00ffff', '#00cbff', '#0099ff', '#0066ff', '#0033ff',
  '#0000ff', '#3200ff', '#6500ff', '#9900ff', '#cc00ff',
  '#ff00ff', '#ff00cb', '#ff0098', '#ff0066', '#ff0033'
];

// Function to get a consistent color based on marque using hash
function getColorForMarque(marque: string): string {
  let hash = 0;
  for (let i = 0; i < marque.length; i++) {
    const char = marque.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

// ✅ Gas pump marker as a google.maps.Symbol
function getMarkerSymbol(marque: string): google.maps.Symbol {
  const color = getColorForMarque(marque);

  const pumpPath =
    "M336 448H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h320c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm157.2-340.7l-81-81c-6.2-6.2-16.4-6.2-22.6 0l-11.3 11.3c-6.2 6.2-6.2 16.4 0 22.6L416 97.9V160c0 28.1 20.9 51.3 48 55.2V376c0 13.2-10.8 24-24 24s-24-10.8-24-24v-32c0-48.6-39.4-88-88-88h-8V64c0-35.3-28.7-64-64-64H96C60.7 0 32 28.7 32 64v352h288V304h8c22.1 0 40 17.9 40 40v27.8c0 37.7 27 72 64.5 75.9 43 4.3 79.5-29.5 79.5-71.7V152.6c0-17-6.8-33.3-18.8-45.3zM256 192H96V64h160v128z";

  return {
    path: pumpPath,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1,
    scale: 0.06,
  } as google.maps.Symbol;
}

// LayerSelector component
interface LayerSelectorProps {
  mapType: google.maps.MapTypeId;
  onChange: (type: google.maps.MapTypeId) => void;
}
function LayerSelector({ mapType, onChange }: LayerSelectorProps) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md z-10">
      <div className="flex text-sm">
        <button
          className={`px-4 py-2 rounded-l-lg transition-colors ${
            mapType === google.maps.MapTypeId.ROADMAP
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onChange(google.maps.MapTypeId.ROADMAP)}
        >
          Plan
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg transition-colors ${
            mapType === google.maps.MapTypeId.SATELLITE
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onChange(google.maps.MapTypeId.SATELLITE)}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}

// MapPreview component
export default function MapPreview({ stations }: MapPreviewProps) {
  const [mapType, setMapType] = useState<google.maps.MapTypeId>('roadmap' as google.maps.MapTypeId);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      setMapType(google.maps.MapTypeId.ROADMAP);
    }
  }, [isLoaded]);

  const [selected, setSelected] = useState<StationWithDetails | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const center = useMemo(() => ({ lat: 31.7917, lng: -7.0926 }), []);

  const mapOptions = useMemo(() => ({
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: mapStyles,
    minZoom: 3,
    maxZoom: 18,
    mapTypeId: mapType,
    restriction: {
      latLngBounds: { north: 45.0, south: 20.0, west: -20.0, east: 5.0 },
      strictBounds: false,
    },
  }), [mapType]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // ✅ create clusterer once
    clustererRef.current = new MarkerClusterer({ map });
  }, []);

  // Refresh cluster markers when stations change
  useEffect(() => {
    if (!mapRef.current || !clustererRef.current || !window.google) return;

    clustererRef.current.clearMarkers();

    const markers = stations
      .filter((s) => s.station.Latitude && s.station.Longitude)
      .map((s) => {
        const marker = new google.maps.Marker({
          position: { lat: s.station.Latitude, lng: s.station.Longitude },
          icon: getMarkerSymbol(s.marque.Marque),
        });
        marker.addListener("click", () => setSelected(s));
        return marker;
      });

    clustererRef.current.addMarkers(markers);
  }, [stations]);

  // Fit bounds to stations
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
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={6}
        center={center}
        onLoad={onLoad}
        options={mapOptions}
      >
        <LayerSelector mapType={mapType} onChange={setMapType} />

        {selected && selected.station.Latitude && selected.station.Longitude && (
          <InfoWindow
            position={{ lat: selected.station.Latitude, lng: selected.station.Longitude }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ maxWidth: 280, padding: '4px' }}>
              <h3 className="font-bold text-md mb-1">{selected.station.NomStation}</h3>
              <div className="text-xs text-gray-600 mb-2">{selected.station.Adresse}</div>

              <div className="space-y-1 text-sm">
                <div><strong>Code:</strong> {selected.station.Code}</div>
                <div><strong>Marque:</strong> {selected.marque.Marque}</div>
                <div><strong>Propriétaire:</strong> {getProprietaireName(selected)}</div>
                <div><strong>Gérant:</strong> {safeFullName(selected.gerant.PrenomGerant, selected.gerant.NomGerant)}</div>
                <div><strong>Commune:</strong> {selected.commune.NomCommune}</div>
                <div><strong>Province:</strong> {selected.province.NomProvince}</div>
                <div className="text-xs pt-1">
                  <strong>Coords:</strong> {selected.station.Latitude.toFixed(5)}, {selected.station.Longitude.toFixed(5)}
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
    </div>
  );
}