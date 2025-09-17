// src\components\stations\StationsTable.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { StationWithDetails } from '@/types/station';
import { SortConfig, FilterConfig } from '@/types/table';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import { getProprietaireName } from '@/utils/format';

export interface StationsTableProps {
  stations: StationWithDetails[];
  onEdit: (station: StationWithDetails) => void;
  onDelete: (station: StationWithDetails) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onRowDoubleClick: (stationId: string) => void;
  onExport: (filteredStations: StationWithDetails[]) => void;
  triggerExport: boolean;
}

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim() || '-';
}

const getCellValue = (station: StationWithDetails, key: string): string => {
  switch (key) {
    case 'Code':
      return String(station.station.Code || '');
    case 'NomStation':
      return station.station.NomStation || '';
    case 'Adresse':
      return station.station.Adresse || '';
    case 'NomCommune':
      return station.commune?.NomCommune || '';
    case 'NomProvince':
      return station.province?.NomProvince || '';
    case 'Marque':
      return station.marque?.Marque || '';
    case 'Gerant':
      return safeFullName(station.gerant?.PrenomGerant, station.gerant?.NomGerant) || '';
    case 'Type':
      return station.station.Type || '';
    case 'Status':
      return station.station.Statut || '';
    case 'TypeGerance':
      return station.station.TypeGerance || '';
    case 'Statut':
      return station.station.Statut || '';
    default:
      return '';
  }
};

export default function StationsTable({
  stations,
  onEdit,
  onDelete,
  sortConfig,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onRowDoubleClick,
  onExport,
  triggerExport,
}: StationsTableProps) {
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  const filterValues = useMemo(() => {
    return {
      Code: [...new Set(stations.map(s => String(s.station.Code || '')))].sort(),
      NomStation: [...new Set(stations.map(s => s.station.NomStation || ''))].sort(),
      Adresse: [...new Set(stations.map(s => s.station.Adresse || ''))].sort(),
      NomCommune: [...new Set(stations.map(s => s.commune?.NomCommune || ''))].sort(),
      NomProvince: [...new Set(stations.map(s => s.province?.NomProvince || ''))].sort(),
      Marque: [...new Set(stations.map(s => s.marque?.Marque || ''))].sort(),
      Gerant: [...new Set(stations.map(s => 
        safeFullName(s.gerant?.PrenomGerant, s.gerant?.NomGerant) || ''
      ))].sort(),
      Type: [...new Set(stations.map(s => s.station.Type || ''))].sort(),
      Statut: [...new Set(stations.map(s => s.station.Statut || ''))].sort(),
      TypeGerance: [...new Set(stations.map(s => s.station?.TypeGerance || ''))].sort(),
    };
  }, [stations]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = filters.filter(filter => filter.key !== key);
    if (value) {
      newFilters.push({ key, value });
    }
    setFilters(newFilters);
    onPageChange(1);
  };

  const getFilterValue = (key: string) => {
    return filters.find(filter => filter.key === key)?.value || '';
  };

  const filteredStations = useMemo(() => {
    if (filters.length === 0) return stations;

    return stations.filter(station => {
      return filters.every(filter => {
        const value = getCellValue(station, filter.key).toLowerCase();
        return value.includes(filter.value.toLowerCase());
      });
    });
  }, [stations, filters]);

  const sortedStations = useMemo(() => {
    const sorted = [...filteredStations];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'Code':
          aValue = String(a.station.Code || '');
          bValue = String(b.station.Code || '');
          break;
        case 'NomStation':
          aValue = a.station.NomStation;
          bValue = b.station.NomStation;
          break;
        case 'Adresse':
          aValue = a.station.Adresse;
          bValue = b.station.Adresse;
          break;
        case 'NomCommune':
          aValue = a.commune?.NomCommune || '';
          bValue = b.commune?.NomCommune || '';
          break;
        case 'NomProvince':
          aValue = a.province?.NomProvince || '';
          bValue = b.province?.NomProvince || '';
          break;
        case 'Marque':
          aValue = a.marque?.Marque || '';
          bValue = b.marque?.Marque || '';
          break;
        case 'Gerant':
          aValue = safeFullName(a.gerant?.PrenomGerant, a.gerant?.NomGerant);
          bValue = safeFullName(b.gerant?.PrenomGerant, b.gerant?.NomGerant);
          break;
        case 'Type':
          aValue = a.station.Type;
          bValue = b.station.Type;
          break;
        case 'Status':
          aValue = a.station.Statut;
          bValue = b.station.Statut;
          break;
        case 'TypeGerance':
          aValue = a.station.TypeGerance;
          bValue = b.station.TypeGerance;
          break;
        default:
          return 0;
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStations, sortConfig]);

  const actualTotalPages = Math.max(1, Math.ceil(sortedStations.length / pageSize));
  const actualCurrentPage = Math.min(currentPage, actualTotalPages);

  const start = (actualCurrentPage - 1) * pageSize;
  const visible = sortedStations.slice(start, start + pageSize);

  const clearAllFilters = () => {
    setFilters([]);
  };

  useEffect(() => {
    if (triggerExport) {
      onExport(sortedStations);
    }
  }, [triggerExport, onExport, sortedStations]);

  const filteredCommunes = useMemo(() => {
    const selectedProvince = getFilterValue('NomProvince');
    if (!selectedProvince) return filterValues.NomCommune;
    
    return filterValues.NomCommune.filter(commune => {
      const station = stations.find(s => s.commune.NomCommune === commune);
      return station?.province.NomProvince === selectedProvince;
    });
  }, [stations, filterValues.NomCommune, getFilterValue]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border overflow-hidden">
      {filters.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-700">Filtres appliqués:</span>
            {filters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {filter.key}: {filter.value}
                <button
                  onClick={() => handleFilterChange(filter.key, '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Effacer tous les filtres
          </button>
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full" style={{ tableLayout: 'fixed', width: '1815px', minWidth: '1815px' }}>
            <thead className="bg-gray-50 border-b-2 border-gray-300 text-gray-500 sticky top-0 z-10">
              <tr>
                <TableHeader
                  label="Code"
                  sortKey="Code"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.Code}
                  selectedFilterValue={getFilterValue('Code')}
                  onFilterChange={handleFilterChange}
                  width="80px"
                />
                <TableHeader
                  label="Marque"
                  sortKey="Marque"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.Marque}
                  selectedFilterValue={getFilterValue('Marque')}
                  onFilterChange={handleFilterChange}
                  width="120px"
                />
                <TableHeader
                  label="Nom Station"
                  sortKey="NomStation"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.NomStation}
                  selectedFilterValue={getFilterValue('NomStation')}
                  onFilterChange={handleFilterChange}
                  width="150px"
                />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '150px' }}>
                  Propriétaire
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '150px' }}>
                  Gérant
                </th>
                <TableHeader
                  label="Adresse"
                  sortKey="Adresse"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.Adresse}
                  selectedFilterValue={getFilterValue('Adresse')}
                  onFilterChange={handleFilterChange}
                  width="200px"
                />
                <TableHeader
                  label="Province"
                  sortKey="NomProvince"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.NomProvince}
                  selectedFilterValue={getFilterValue('NomProvince')}
                  onFilterChange={handleFilterChange}
                  width="120px"
                />
                <TableHeader
                  label="Commune"
                  sortKey="NomCommune"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filteredCommunes}
                  selectedFilterValue={getFilterValue('NomCommune')}
                  onFilterChange={handleFilterChange}
                  width="120px"
                />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '100px' }}>
                  Latitude
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '100px' }}>
                  Longitude
                </th>
                <TableHeader
                  label="Type"
                  sortKey="Type"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.Type}
                  selectedFilterValue={getFilterValue('Type')}
                  onFilterChange={handleFilterChange}
                  width="100px"
                />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '100px' }}>
                  Cap. SSP (T)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '100px' }}>
                  Cap. Gasoil (T)
                </th>
                <TableHeader
                  label="Statut"
                  sortKey="Status"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.Statut}
                  selectedFilterValue={getFilterValue('Status')}
                  onFilterChange={handleFilterChange}
                  width="100px"
                />
                <TableHeader
                  label="Type Gérance"
                  sortKey="TypeGerance"
                  sortConfig={sortConfig}
                  onSortChange={onSortChange}
                  filterValues={filterValues.TypeGerance}
                  selectedFilterValue={getFilterValue('TypeGerance')}
                  onFilterChange={handleFilterChange}
                  width="120px"
                />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" style={{ width: '120px' }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-sm text-gray-500">
                    {filters.length > 0 ? (
                      <div>
                        <p>Aucune station ne correspond aux filtres appliqués.</p>
                        <button
                          onClick={clearAllFilters}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Effacer tous les filtres
                        </button>
                      </div>
                    ) : (
                      'Aucune station trouvée.'
                    )}
                  </td>
                </tr>
              ) : (
                visible.map((s) => {
                  const capSSP = s.capacites.filter(c => c.TypeCarburant === 'SSP').reduce((sum, c) => sum + (c.CapaciteLitres || 0), 0);
                  const capGasoil = s.capacites.filter(c => c.TypeCarburant === 'Gasoil').reduce((sum, c) => sum + (c.CapaciteLitres || 0), 0);

                  return (
                    <tr
                      key={s.station.StationID}
                      className="hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={() => onRowDoubleClick(s.station.StationID)}
                    >
                      <td className="px-4 py-3 truncate" title={s.station.Code?.toString()}>
                        <div className="text-sm text-gray-900">{s.station.Code || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.marque?.Marque}>{s.marque?.Marque || '-'}</div>
                        {s.marque?.RaisonSociale && (
                          <div className="text-xs text-gray-500 truncate" title={s.marque.RaisonSociale}>{s.marque.RaisonSociale}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate" title={s.station.NomStation}>{s.station.NomStation || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={getProprietaireName(s)}>{getProprietaireName(s)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate">
                          {safeFullName(s.gerant?.PrenomGerant, s.gerant?.NomGerant)}
                        </div>
                        {s.gerant && (
                          <div className="text-xs text-gray-500 truncate">
                            {[s.gerant.CINGerant].filter(Boolean) || '-'}
                            <br />
                            {[s.gerant.Telephone].filter(Boolean) || '-'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.station.Adresse}>{s.station.Adresse || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.province?.NomProvince}>{s.province?.NomProvince || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.commune?.NomCommune}>{s.commune?.NomCommune || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.station.Latitude?.toString()}>{s.station.Latitude || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.station.Longitude?.toString()}>{s.station.Longitude || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          s.station.Type === 'service' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.station.Type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{capSSP || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{capGasoil || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.station.Statut}>{s.station.Statut || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate" title={s.station.TypeGerance}>
                          {s.station.TypeGerance || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => onEdit(s)} 
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {visible.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <TablePagination 
            currentPage={actualCurrentPage} 
            totalPages={actualTotalPages} 
            onPageChange={onPageChange} 
          />
        </div>
      )}
    </div>
  );
}