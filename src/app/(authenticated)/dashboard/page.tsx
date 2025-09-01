// src/app/(authenticated)/dashboard/page.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useStations } from '@/hooks/stations/useStations';
import MapPreview from '@/components/dashboard/MapPreview';

import { StationWithDetails } from '@/types/station'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '@/components/ui/Button'; // Assuming Button component exists
import { Checkbox } from '@/components/ui/Checkbox'; // Assuming Checkbox component exists

// --- UI Components (from old file) ---
function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`border rounded-lg p-4 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function LoadingSpinner() {
  return <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full" />;
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3">{message}</div>;
}

function formatCapacity(n: number) {
  return (n?.toLocaleString('fr-FR') || '0') + ' L';
}

export default function DashboardPage() {
  const { stations, loading, error } = useStations();

  // ----- Filter State -----
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);
  const [selectedMarques, setSelectedMarques] = useState<string[]>([]);

  // ----- Memoized Filter Options -----
  const provinces = useMemo(() => Array.from(new Set(stations.map(s => s.province.NomProvince.trim()))).sort(), [stations]);
  const marques = useMemo(() => Array.from(new Set(stations.map(s => s.marque.Marque.trim()))).sort(), [stations]);
  
  const communes = useMemo(() => {
    if (selectedProvinces.length !== 1) return [];
    const province = selectedProvinces[0];
    const communeSet = new Set<string>();
    stations.forEach(s => {
      if (s.province.NomProvince.trim() === province) {
        communeSet.add(s.commune.NomCommune.trim());
      }
    });
    return Array.from(communeSet).sort();
  }, [stations, selectedProvinces]);

  const isCommuneFilterDisabled = selectedProvinces.length !== 1;

  // ----- Auto-select all on initial load -----
  useEffect(() => {
    if (provinces.length > 0) setSelectedProvinces(provinces);
  }, [provinces]);

  useEffect(() => {
    if (marques.length > 0) setSelectedMarques(marques);
  }, [marques]);

  useEffect(() => {
    if (!isCommuneFilterDisabled && communes.length > 0) {
        setSelectedCommunes(communes);
    }
  }, [communes, isCommuneFilterDisabled]);

  // ----- Filter Toggling Logic -----
  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string, checked: boolean) => {
    setter(prev => checked ? [...prev, item] : prev.filter(p => p !== item));
  };
  
  const handleProvinceToggle = (p: string, checked: boolean) => {
      setSelectedProvinces(prev => {
          const newSelection = checked ? [...prev, p] : prev.filter(item => item !== p);
          // When province selection changes, reset communes to avoid invalid state
          setSelectedCommunes([]);
          return newSelection;
      });
  };

  // ----- Filtered Data -----
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const province = s.province.NomProvince.trim();
      const commune = s.commune.NomCommune.trim();
      const marque = s.marque.Marque.trim();

      if (!selectedProvinces.includes(province)) return false;
      if (!isCommuneFilterDisabled && !selectedCommunes.includes(commune)) return false;
      if (!selectedMarques.includes(marque)) return false;
      
      return true;
    });
  }, [stations, selectedProvinces, selectedCommunes, selectedMarques, isCommuneFilterDisabled]);

  // ----- Stats Calculations (now on filtered data) -----
  const stats = useMemo(() => {
    let gasoil = 0, ssp = 0, service = 0, remplissage = 0;
    filteredStations.forEach((s) => {
      if (s.station.Type === 'service') service++;
      if (s.station.Type === 'remplissage') remplissage++;
      s.capacites.forEach((c) => {
        if (c.TypeCarburant === 'Gasoil') gasoil += c.CapaciteLitres || 0;
        if (c.TypeCarburant === 'SSP') ssp += c.CapaciteLitres || 0;
      });
    });
    return { total: filteredStations.length, gasoil, ssp, service, remplissage };
  }, [filteredStations]);

  // ----- Chart Data (now on filtered data) -----
  const chartDataByMarque = useMemo(() => {
    const map = new Map<string, number>();
    filteredStations.forEach((s) => {
      const name = s.marque.Marque?.trim() || '—';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStations]);

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Stations-service Dashboard</h1>
        <p className="text-sm text-gray-600">Vue d'ensemble avec filtres interactifs.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Total stations (filtrées)</div>
          <div className="text-2xl font-semibold">{stats.total}</div>
        </Card>
        <Card>
            <div className="text-sm text-gray-500">Capacité Gasoil</div>
            <div className="text-xl font-semibold">{formatCapacity(stats.gasoil)}</div>
        </Card>
        <Card>
            <div className="text-sm text-gray-500">Capacité SSP</div>
            <div className="text-xl font-semibold">{formatCapacity(stats.ssp)}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Province</h2>
            <div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedProvinces(provinces)}>Tout</Button>
              <Button variant="secondary" size="sm" onClick={() => { setSelectedProvinces([]); setSelectedCommunes([]); }}>Aucun</Button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {provinces.map(p => (
              <div key={p} className="flex items-center"><Checkbox id={`p-${p}`} checked={selectedProvinces.includes(p)} onCheckedChange={c => handleProvinceToggle(p, !!c)} /><label htmlFor={`p-${p}`} className="ml-2">{p}</label></div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`font-semibold ${isCommuneFilterDisabled ? 'text-gray-400' : ''}`}>Commune</h2>
            <div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedCommunes(communes)} disabled={isCommuneFilterDisabled}>Tout</Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedCommunes([])} disabled={isCommuneFilterDisabled}>Aucun</Button>
            </div>
          </div>
          {isCommuneFilterDisabled ? <div className="text-sm text-gray-400 italic">Sélectionnez une seule province.</div> : (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {communes.map(c => (
              <div key={c} className="flex items-center"><Checkbox id={`c-${c}`} checked={selectedCommunes.includes(c)} onCheckedChange={s => toggleSelection(setSelectedCommunes, c, !!s)} /><label htmlFor={`c-${c}`} className="ml-2">{c}</label></div>
            ))}
          </div>
          )}
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Marque</h2>
            <div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedMarques(marques)}>Tout</Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedMarques([])}>Aucun</Button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {marques.map(m => (
              <div key={m} className="flex items-center"><Checkbox id={`m-${m}`} checked={selectedMarques.includes(m)} onCheckedChange={c => toggleSelection(setSelectedMarques, m, !!c)} /><label htmlFor={`m-${m}`} className="ml-2">{m}</label></div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Stations par Marque</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataByMarque} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Map */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Carte des stations</h2>
        <div className="h-96">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <MapPreview stations={filteredStations} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100 rounded">API Key manquant.</div>
          )}
        </div>
      </Card>
    </div>
  );
}