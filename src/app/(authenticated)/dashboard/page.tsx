'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGasStations } from '@/hooks/useGasStations';
import { useAuth } from '@/lib/auth/provider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import MapPreview from '@/components/dashboard/MapPreview';
import { GasStation } from '@/types/station';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatCapacity(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' L';
}

export default function DashboardPage() {
  const { stations, loading, error } = useGasStations();
  const { currentUser } = useAuth();

  // ----- Filters (by Province, Commune, Marque) -----
  const provinces = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(s => {
      const province = s['Province'];
      if (province && province.trim()) {
        set.add(province.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [stations]);

  const marques = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(s => {
      const marque = s['Marque'];
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
      const province = s['Province'];
      const commune = s['Commune'];
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
      const province = s['Province'];
      if (!province || !selectedProvinces.includes(province.trim())) return false;
      
      // Commune filter (only if single province is selected)
      if (selectedProvinces.length === 1) {
        const commune = s['Commune'];
        if (!commune || !selectedCommunes.includes(commune.trim())) return false;
      }
      
      // Marque filter
      const marque = s['Marque'];
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
      const gasoil = s['Capacité Gasoil'];
      const ssp = s['Capacité SSP'];
      
      if (typeof gasoil === 'number' && gasoil > 0) {
        totalGasoil += gasoil;
      }
      if (typeof ssp === 'number' && ssp > 0) {
        totalSSP += ssp;
      }
    });

    return { total, totalGasoil, totalSSP };
  }, [filtered]);

  // ----- Chart data for brands -----
  const chartData = useMemo(() => {
    const brandCounts = new Map<string, number>();
    
    filtered.forEach(s => {
      const brand = s['Marque'];
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
          <p className="text-yellow-800">No gas stations found in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stations-service</h1>
        <p className="text-sm text-gray-600">Vue d'ensemble, filtres par province/commune/marque.</p>
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

      {/* Filters */}
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

      {/* Map with updated MapPreview component */}
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