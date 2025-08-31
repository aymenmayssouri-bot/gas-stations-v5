// src/components/stations/StationsTable.tsx - FIXED VERSION
'use client';

import React from 'react';
import { StationWithDetails } from '@/types/station';
import { SortConfig } from '@/types/table';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';

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
}

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim() || '-';
}

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
}: StationsTableProps) {
  // Client-side slice for pagination
  const start = (currentPage - 1) * pageSize;
  const visible = stations.slice(start, start + pageSize);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b text-gray-900">
            <tr>
              <TableHeader
                label="Station"
                sortKey="NomStation"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Adresse"
                sortKey="Adresse"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Commune"
                sortKey="NomCommune"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              {/* FIXED: Use correct sort key for Province */}
              <TableHeader
                label="Province"
                sortKey="NomProvince"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Marque"
                sortKey="Marque"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Gérant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200"> 
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucune station trouvée.
                </td>
              </tr>
            ) : (
              visible.map((s) => (
                <tr key={s.station.StationID} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.station.NomStation || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{s.station.Adresse || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{s.commune?.NomCommune || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{s.province?.NomProvince || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{s.marque?.Marque || '-'}</div>
                    {s.marque?.RaisonSociale && (
                      <div className="text-xs text-gray-500">{s.marque.RaisonSociale}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {safeFullName(s.gerant?.PrenomGerant, s.gerant?.NomGerant)}
                    </div>
                    {s.gerant?.CINGerant && (
                      <div className="text-xs text-gray-500">CIN: {s.gerant.CINGerant}</div>
                    )}
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
                  <td className="px-4 py-3 text-right space-x-2">
                    <button 
                      onClick={() => onEdit(s)} 
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => onDelete(s)} 
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {visible.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <TablePagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={onPageChange} 
          />
        </div>
      )}
    </div>
  );
}