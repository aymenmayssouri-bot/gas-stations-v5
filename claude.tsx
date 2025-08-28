// src/components/migration/MigrationRunner.tsx
// Component to run the database migration from the admin interface

'use client';

import { useState } from 'react';
import { runMigration } from '@/lib/migration/databaseMigration';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function MigrationRunner() {
  const [migrating, setMigrating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleMigration = async () => {
    setMigrating(true);
    setError(null);
    setLogs([]);
    setCompleted(false);

    // Capture console.log during migration
    const originalLog = console.log;
    console.log = (...args) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };

    try {
      await runMigration();
      setCompleted(true);
      setLogs(prev => [...prev, 'Migration completed successfully!']);
    } catch (err: any) {
      setError(err.message || 'Migration failed');
      console.error('Migration error:', err);
    } finally {
      console.log = originalLog; // Restore original console.log
      setMigrating(false);
    }
  };

  const confirmMigration = () => {
    const confirmed = window.confirm(
      'Are you sure you want to migrate the database? This will create new collections and may take several minutes. Make sure you have a backup of your current data.'
    );
    if (confirmed) {
      handleMigration();
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Database Migration Tool
        </h2>
        <p className="text-yellow-700 text-sm">
          This tool will migrate your existing gas stations data from the flat structure 
          to the new normalized relational structure. Make sure you have a backup before proceeding.
        </p>
      </div>

      {!completed && !migrating && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Migration Process:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Create Provinces table from existing province data</li>
              <li>2. Create Communes table with province relationships</li>
              <li>3. Create Marques table from brand data</li>
              <li>4. Create Gerants table from manager data</li>
              <li>5. Create Proprietaires tables (base + specific types)</li>
              <li>6. Create normalized Stations table</li>
              <li>7. Create Autorisations table from authorization data</li>
              <li>8. Create Capacites_Stockage table from capacity data</li>
            </ul>
          </div>

          <Button 
            onClick={confirmMigration}
            variant="primary"
            className="w-full"
          >
            Start Migration
          </Button>
        </div>
      )}

      {migrating && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="small" />
            <span className="text-gray-700">Migration in progress...</span>
          </div>
        </div>
      )}

      {error && (
        <ErrorMessage message={error} />
      )}

      {completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Migration Completed!</h3>
          <p className="text-green-700 text-sm">
            Your database has been successfully migrated to the new normalized structure. 
            You can now use the updated interface to manage your gas stations.
          </p>
        </div>
      )}

      {/* Migration Logs */}
      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Migration Log:</h3>
          <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Updated Dashboard for Normalized Structure
// =============================================================================

// src/app/(authenticated)/dashboard/page-normalized.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useNormalizedStations } from '@/hooks/useNormalizedStations';
import { useAuth } from '@/lib/auth/provider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import MapPreview from '@/components/dashboard/MapPreviewNormalized';
import { StationWithDetails } from '@/types/normalized-station';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatCapacity(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' L';
}

export default function NormalizedDashboardPage() {
  const { stations, loading, error } = useNormalizedStations();
  const { currentUser } = useAuth();

  // ----- Filters (by Province, Commune, Marque) -----
  const provinces = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(s => {
      const province = s.province.Province;
      if (province && province.trim()) {
        set.add(province.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [stations]);

  const marques = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(s => {
      const marque = s.marque.Marque;
      if (marque && marque.trim()) {
        set.add(marque.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [stations]);

  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);
  const [selectedMarques, setSelectedMarques] = useState<string[]>([]);

  // Auto-select all provinces, communes, and marques when they load
  useEffect(() => {
    if (provinces.length > 0 && selectedProvinces.length === 0) {
      setSelectedProvinces(provinces);
    }
  }, [provinces, selectedProvinces.length]);

  useEffect(() => {
    if (marques.length > 0 && selectedMarques.length === 0) {
      setSelectedMarques(marques);
    }
  }, [marques, selectedMarques.length]);

  // Get communes based on selected provinces
  const communes = useMemo(() => {
    if (selectedProvinces.length === 0) return [];
    
    const set = new Set<string>();
    stations.forEach(s => {
      const province = s.province.Province;
      const commune = s.commune.Commune;
      if (province && commune && commune.trim() && selectedProvinces.includes(province.trim())) {
        set.add(commune.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [stations, selectedProvinces]);

  // Auto-select all communes when they change
  useEffect(() => {
    if (communes.length > 0 && selectedCommunes.length === 0) {
      setSelectedCommunes(communes);
    } else if (communes.length > 0) {
      // Filter out communes that are no longer valid
      const validCommunes = selectedCommunes.filter(c => communes.includes(c));
      if (validCommunes.length !== selectedCommunes.length) {
        setSelectedCommunes(validCommunes.length > 0 ? validCommunes : communes);
      }
    }
  }, [communes, selectedCommunes.length]);

  // Commune filter is disabled when multiple provinces are selected
  const isCommuneFilterDisabled = selectedProvinces.length !== 1;

  const toggleProvince = (p: string, checked: boolean) => {
    setSelectedProvinces(prev => {
      const newSelection = checked ? Array.from(new Set([...prev, p])) : prev.filter(x => x !== p);
      // Reset communes when provinces change
      if (newSelection.length !== prev.length) {
        setSelectedCommunes([]);
      }
      return newSelection;
    });
  };

  const toggleCommune = (c: string, checked: boolean) => {
    if (isCommuneFilterDisabled) return;
    setSelectedCommunes(prev =>
      checked ? Array.from(new Set([...prev, c])) : prev.filter(x => x !== c)
    );
  };

  const toggleMarque = (m: string, checked: boolean) => {
    setSelectedMarques(prev =>
      checked ? Array.from(new Set([...prev, m])) : prev.filter(x => x !== m)
    );
  };

  const selectAllProvinces = () => setSelectedProvinces(provinces);
  const clearAllProvinces = () => {
    setSelectedProvinces([]);
    setSelectedCommunes([]);
  };

  const selectAllCommunes = () => {
    if (!isCommuneFilterDisabled) setSelectedCommunes(communes);
  };
  const clearAllCommunes = () => {
    if (!isCommuneFilterDisabled) setSelectedCommunes([]);
  };

  const selectAllMarques = () => setSelectedMarques(marques);
  const clearAllMarques = () => setSelectedMarques([]);

  // ----- Apply filters -----
  const filtered = useMemo(() => {
    return stations.filter(s => {
      // Province filter
      const province = s.province.Province;
      if (!province || !selectedProvinces.includes(province.trim())) return false;
      
      // Commune filter (only if single province is selected)
      if (selectedProvinces.length === 1) {
        const commune = s.commune.Commune;
        if (!commune || !selectedCommunes.includes(commune.trim())) return false;
      }
      
      // Marque filter
      const marque = s.marque.Marque;
      if (!marque || !selectedMarques.includes(marque.trim())) return false;
      
      return true;
    });
  }, [stations, selectedProvinces, selectedCommunes, selectedMarques]);

  // ----- Stats -----
  const stats = useMemo(() => {
    const total = filtered.length;
    let totalGasoil = 0;
    let totalSSP = 0;

    filtered.forEach(s => {
      const gasoilCapacite = s.capacites.find(c => c.TypeCarburant === 'Gasoil');
      const sspCapacite = s.capacites.find(c => c.TypeCarburant === 'SSP');
      
      if (gasoilCapacite) {
        totalGasoil += gasoilCapacite.CapaciteLitres;
      }
      if (sspCapacite) {
        totalSSP += sspCapacite.CapaciteLitres;
      }
    });

    return { total, totalGasoil, totalSSP };
  }, [filtered]);

  // ----- Chart data for brands -----
  const chartData = useMemo(() => {
    const brandCounts = new Map<string, number>();
    
    filtered.forEach(s => {
      const brand = s.marque.Marque;
      if (brand && brand.trim()) {
        const trimmedBrand = brand.trim();
        brandCounts.set(trimmedBrand, (brandCounts.get(trimmedBrand) || 0) + 1);
      }
    });

    // Convert to array and sort by count
    const sortedBrands = Array.from(brandCounts.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);

    if (sortedBrands.length <= 5) {
      // If 5 or fewer brands, show all
      return sortedBrands;
    } else {
      // Take top 4 and combine the rest into "Others"
      const top4 = sortedBrands.slice(0, 4);
      const othersCount = sortedBrands.slice(4).reduce((sum, item) => sum + item.count, 0);
      return [...top4, { brand: 'Others', count: othersCount }];
    }
  }, [filtered]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Loading Dashboard...</h2>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Error Loading Dashboard</h2>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">No Data Found</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No gas stations found in the normalized database.</p>
          <p className="text-yellow-700 text-sm mt-2">
            If you haven't migrated your data yet, please run the migration tool first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stations-service (Normalized)</h1>
        <p className="text-sm text-gray-600">Vue d'ensemble avec structure de base de données normalisée.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Total stations</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Capacité totale</div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-gray-900">Gasoil: {formatCapacity(stats.totalGasoil)}</div>
            <div className="text-lg font-semibold text-gray-900">SSP: {formatCapacity(stats.totalSSP)}</div>
          </div>
        </Card>
      </div>

      {/* Filters - Same UI as before */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Province Filter */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Province</h2>
            <div className="space-x-2">
              <Button variant="secondary" size="sm" onClick={selectAllProvinces}>Tout</Button>
              <Button variant="secondary" size="sm" onClick={clearAllProvinces}>Aucun</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {provinces.map((p) => (
              <div key={p} className="flex items-center space-x-2">
                <Checkbox
                  id={`province-${p}`}
                  checked={selectedProvinces.includes(p)}
                  onCheckedChange={(checked) => toggleProvince(p, checked)}
                >
                  <span className="text-gray-900">{p}</span>
                </Checkbox>
              </div>
            ))}
          </div>
        </Card>

        {/* Commune Filter */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isCommuneFilterDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
              Commune
            </h2>
            <div className="space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={selectAllCommunes} 
                disabled={isCommuneFilterDisabled}
              >
                Tout
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={clearAllCommunes} 
                disabled={isCommuneFilterDisabled}
              >
                Aucun
              </Button>
            </div>
          </div>
          {isCommuneFilterDisabled ? (
            <div className="text-sm text-gray-400 italic">
              Sélectionnez une seule province pour filtrer par commune
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {communes.map((c) => (
                <div key={c} className="flex items-center space-x-2">
                  <Checkbox
                    id={`commune-${c}`}
                    checked={selectedCommunes.includes(c)}
                    onCheckedChange={(checked) => toggleCommune(c, checked)}
                  >
                    <span className="text-gray-900">{c}</span>
                  </Checkbox>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Marque Filter */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Marque</h2>
            <div className="space-x-2">
              <Button variant="secondary" size="sm" onClick={selectAllMarques}>Tout</Button>
              <Button variant="secondary" size="sm" onClick={clearAllMarques}>Aucun</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {marques.map((m) => (
              <div key={m} className="flex items-center space-x-2">
                <Checkbox
                  id={`marque-${m}`}
                  checked={selectedMarques.includes(m)}
                  onCheckedChange={(checked) => toggleMarque(m, checked)}
                >
                  <span className="text-gray-900">{m}</span>
                </Checkbox>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nombre de stations par Marque</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="brand" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Map with normalized data */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Carte des stations</h2>
        <div className="h-96">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <MapPreview stations={filtered} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100 rounded">
              <div className="text-center">
                <p>Google Maps API key not configured</p>
                <p className="text-sm mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// =============================================================================
// Updated Map Component for Normalized Data
// =============================================================================

// src/components/dashboard/MapPreviewNormalized.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { StationWithDetails } from '@/types/normalized-station';

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

// =============================================================================
// Updated Station Form for Normalized Structure
// =============================================================================

// src/components/stations/StationFormNormalized.tsx
'use client';

import { StationWithDetails, StationFormData } from '@/types/normalized-station';
import { useNormalizedStationForm } from '@/hooks/useNormalizedStationForm';
import { useProvinces, useCommunes, useMarques } from '@/hooks/useNormalizedStations';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface StationFormProps {
  mode: 'create' | 'edit';
  station?: StationWithDetails;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function StationFormNormalized({ mode, station, onSaved, onCancel }: StationFormProps) {
  const { form, errors, submitting, updateField, submit } = useNormalizedStationForm(mode, station);
  const { provinces } = useProvinces();
  const { communes } = useCommunes();
  const { marques } = useMarques();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok && onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors['__form'] && <ErrorMessage error={errors['__form']} />}

      {/* Station Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la Station</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Nom de Station" 
            name="NomStation" 
            value={form.NomStation} 
            onChange={(e) => updateField('NomStation', e.target.value)} 
            required
          />
          <Input 
            label="Type" 
            name="Type" 
            value={form.Type} 
            onChange={(e) => updateField('Type', e.target.value as 'service' | 'remplissage')}
            required
          />
          <div className="md:col-span-2">
            <Input 
              label="Adresse" 
              name="Adresse" 
              value={form.Adresse} 
              onChange={(e) => updateField('Adresse', e.target.value)}
              required
            />
          </div>
          <Input 
            label="Latitude" 
            name="Latitude" 
            value={form.Latitude} 
            onChange={(e) => updateField('Latitude', e.target.value)} 
            type="number"
            step="any"
            required
          />
          <Input 
            label="Longitude" 
            name="Longitude" 
            value={form.Longitude} 
            onChange={(e) => updateField('Longitude', e.target.value)}
            type="number"
            step="any"
            required
          />
        </div>
      </div>

      {/* Marque Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marque</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Marque" 
            name="Marque" 
            value={form.Marque} 
            onChange={(e) => updateField('Marque', e.target.value)}
            required
          />
          <Input 
            label="Raison Sociale" 
            name="RaisonSociale" 
            value={form.RaisonSociale} 
            onChange={(e) => updateField('RaisonSociale', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Location Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Province" 
            name="Province" 
            value={form.Province} 
            onChange={(e) => updateField('Province', e.target.value)}
            required
          />
          <Input 
            label="Commune" 
            name="Commune" 
            value={form.Commune} 
            onChange={(e) => updateField('Commune', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Gerant Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gérant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            label="Nom du Gérant" 
            name="Gerant" 
            value={form.Gerant} 
            onChange={(e) => updateField('Gerant', e.target.value)}
            required
          />
          <Input 
            label="CIN Gérant" 
            name="CINGerant" 
            value={form.CINGerant} 
            onChange={(e) => updateField('CINGerant', e.target.value)}
            required
          />
          <Input 
            label="Téléphone" 
            name="Telephone" 
            value={form.Telephone} 
            onChange={(e) => updateField('Telephone', e.target.value)}
          />
        </div>
      </div>

      {/* Proprietaire Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriétaire</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type Propriétaire</label>
            <select 
              value={form.TypeProprietaire} 
              onChange={(e) => updateField('TypeProprietaire', e.target.value as 'Physique' | 'Morale')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Physique">Physique</option>
              <option value="Morale">Morale</option>
            </select>
          </div>
          {form.TypeProprietaire === 'Physique' ? (
            <Input 
              label="Nom Propriétaire" 
              name="NomProprietaire" 
              value={form.NomProprietaire} 
              onChange={(e) => updateField('NomProprietaire', e.target.value)}
            />
          ) : (
            <Input 
              label="Nom Entreprise" 
              name="NomEntreprise" 
              value={form.NomEntreprise} 
              onChange={(e) => updateField('NomEntreprise', e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Autorisation Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Autorisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type Autorisation</label>
            <select 
              value={form.TypeAutorisation} 
              onChange={(e) => updateField('TypeAutorisation', e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="création">Création</option>
              <option value="transformation">Transformation</option>
              <option value="transfert">Transfert</option>
              <option value="changement de marques">Changement de marques</option>
            </select>
          </div>
          <Input 
            label="Numéro Autorisation" 
            name="NumeroAutorisation" 
            value={form.NumeroAutorisation} 
            onChange={(e) => updateField('NumeroAutorisation', e.target.value)}
          />
          <Input 
            label="Date Autorisation" 
            name="DateAutorisation" 
            type="date"
            value={form.DateAutorisation} 
            onChange={(e) => updateField('DateAutorisation', e.target.value)}
          />
        </div>
      </div>

      {/* Capacites Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacités de Stockage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Capacité Gasoil (L)" 
            name="CapaciteGasoil" 
            type="number"
            value={form.CapaciteGasoil} 
            onChange={(e) => updateField('CapaciteGasoil', e.target.value)}
          />
          <Input 
            label="Capacité SSP (L)" 
            name="CapaciteSSP" 
            type="number"
            value={form.CapaciteSSP} 
            onChange={(e) => updateField('CapaciteSSP', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={submitting}>
          {mode === 'create' ? 'Créer' : 'Enregistrer'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}