// src/components/dashboard/StationFilters.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StationWithDetails } from '@/types/station';
import { useAnalysesIndex } from '@/hooks/useStationData/useAnalysesIndex';
import { Card, Button, Checkbox, CardHeader, CardContent, CardTitle } from '@/components/ui';

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
  
  // Get all station IDs for analyses fetching
  const stationIds = useMemo(() => stations.map(s => s.station.StationID), [stations]);
  
  // Fetch all analyses for filtering (pass empty string to get all analyses)
  const { years, filterStationsByAnalysis, loading: analysesLoading } = useAnalysesIndex('');

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
    // First apply analysis filtering if not loading
    let filtered = !analysesLoading ? 
      filterStationsByAnalysis(stations, analysisStatus, analysisYear) : 
      stations;

    // Then apply other filters
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
  }, [stations, selectedProvinces, selectedCommunes, selectedMarques, isCommuneFilterDisabled, analysisStatus, analysisYear, filterStationsByAnalysis, selectedStatuses, analysesLoading]);

  // ----- Inform Parent of Changes -----
  useEffect(() => {
    onFilterChange(filteredStations);
  }, [filteredStations, onFilterChange]);

  return (
    <div className="grid col-span-2 gap-4">
      {/* Province and Commune in first row */}
      <Card className="col-span-1">
        <CardHeader className="border-b">
          <CardTitle>Province</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]"> {/* Fixed height */}
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {provinces.map(p => (
              <div key={p} className="flex items-center py-1.5">
                <Checkbox 
                  id={`p-${p}`} 
                  checked={selectedProvinces.includes(p)} 
                  onCheckedChange={c => handleProvinceToggle(p, !!c)} 
                />
                <label htmlFor={`p-${p}`} className="ml-2 text-sm">{p}</label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="border-b">
          <CardTitle className={`${isCommuneFilterDisabled ? 'text-gray-400' : ''}`}>
            Commune
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]"> {/* Fixed height */}
          {isCommuneFilterDisabled ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 italic">
              Sélectionnez une seule province.
            </div>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {communes.map(c => (
                <div key={c} className="flex items-center py-1.5">
                  <Checkbox 
                    id={`c-${c}`} 
                    checked={selectedCommunes.includes(c)} 
                    onCheckedChange={s => toggleSelection(setSelectedCommunes, c, !!s)} 
                  />
                  <label htmlFor={`c-${c}`} className="ml-2 text-sm">{c}</label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marque and Status in second row */}
      <Card className="col-span-1">
        <CardHeader className="border-b">
          <CardTitle>Marque</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]"> {/* Fixed height */}
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {marques.map(m => (
              <div key={m} className="flex items-center py-1.5">
                <Checkbox 
                  id={`m-${m}`} 
                  checked={selectedMarques.includes(m)} 
                  onCheckedChange={c => toggleSelection(setSelectedMarques, m, !!c)} 
                />
                <label htmlFor={`m-${m}`} className="ml-2 text-sm">{m}</label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="border-b">
          <CardTitle>Statut</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]"> {/* Fixed height */}
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {['en activité','en projet','en arrêt','archivé'].map((s) => (
              <div key={s} className="flex items-center py-1.5">
                <Checkbox
                  id={`status-${s}`}
                  checked={selectedStatuses.includes(s)}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses((prev) =>
                      checked ? [...prev, s] : prev.filter((x) => x !== s)
                    );
                  }}
                />
                <span className="ml-2 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis filter takes full width */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Status */}
            <select
              value={analysisStatus}
              onChange={(e) =>
                setAnalysisStatus(e.target.value as 'all' | 'analysed' | 'not-analysed')
              }
              className="border p-2 rounded w-full"
              disabled={analysesLoading}
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
                disabled={analysesLoading}
              >
                <option value="all">Toutes les années</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
            
            {analysesLoading && (
              <div className="text-sm text-gray-500">Chargement des analyses...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}