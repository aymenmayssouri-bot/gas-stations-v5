// src/components/dashboard/StationFilters.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StationWithDetails } from '@/types/station';
import { useAnalysesIndex } from '@/hooks/useStationData/useAnalysesIndex';
import { Card, Button, Checkbox } from '@/components/ui';

interface StationFiltersProps {
  stations: StationWithDetails[];
  onFilterChange: (filteredStations: StationWithDetails[]) => void;
}

export default function StationFilters({ stations, onFilterChange }: StationFiltersProps) {
  // ----- Filter State -----
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['en activité']);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);
  const [selectedMarques, setSelectedMarques] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<'all' | 'analysed' | 'not-analysed'>('all');
  const [analysisYear, setAnalysisYear] = useState<number | 'all'>('all');

  // ----- Memoized Filter Options -----
  const provinces = useMemo(() => Array.from(new Set(stations.map(s => s.province.NomProvince.trim()))).sort(), [stations]);
  const marques = useMemo(() => Array.from(new Set(stations.map(s => s.marque.Marque.trim()))).sort(), [stations]);
  
  const { years, filterStationsByAnalysis } = useAnalysesIndex();

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
          setSelectedCommunes([]); // Reset communes when province selection changes
          return newSelection;
      });
  };

  // ----- Filtered Data Calculation -----
  const filteredStations = useMemo(() => {
    let filtered = filterStationsByAnalysis(stations, analysisStatus, analysisYear);

    return filtered.filter(s => {
      const province = s.province.NomProvince.trim();
      const commune = s.commune.NomCommune.trim();
      const marque = s.marque.Marque.trim();
      const status = s.station.Statut.trim();

      if (!selectedProvinces.includes(province)) return false;
      if (!isCommuneFilterDisabled && !selectedCommunes.includes(commune)) return false;
      if (!selectedMarques.includes(marque)) return false;
      if (selectedStatuses.length === 0) return false;
      if (!selectedStatuses.includes(status)) return false;
      
      return true;
    });
  }, [stations, selectedProvinces, selectedCommunes, selectedMarques, isCommuneFilterDisabled, analysisStatus, analysisYear, filterStationsByAnalysis, selectedStatuses]);

  // ----- Inform Parent of Changes -----
  useEffect(() => {
    onFilterChange(filteredStations);
  }, [filteredStations, onFilterChange]);

  return (
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
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Analyse</h2>
        </div>
        <div className="space-y-2">
          {/* Status */}
          <select
            value={analysisStatus}
            onChange={(e) =>
              setAnalysisStatus(e.target.value as 'all' | 'analysed' | 'not-analysed')
            }
            className="border p-2 rounded w-full"
          >
            <option value="all">Toutes</option>
            <option value="analysed">Stations Analysées</option>
            <option value="not-analysed">Stations Non Analysées</option>
          </select>

          {/* Year, only if "analysed" */}
          {analysisStatus === 'analysed' && (
            <select
              value={analysisYear}
              onChange={(e) =>
                setAnalysisYear(
                  e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10)
                )
              }
              className="border p-2 rounded w-full"
            >
              <option value="all">Toutes les années</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>
      {/* Status Filter */}
      <Card>
        <h3 className="text-md font-semibold mb-2">Statut</h3>
        <div className="flex flex-wrap gap-3">
          {['en activité','en projet','en arrêt','archivé'].map((s) => (
            <label key={s} className="flex items-center gap-2">
              <Checkbox
                id={`status-${s}`}
                checked={selectedStatuses.includes(s)}
                onCheckedChange={(checked) => {
                  setSelectedStatuses((prev) =>
                    checked ? [...prev, s] : prev.filter((x) => x !== s)
                  );
                }}
              />
              
              <span>{s}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}