// src/components/stations/StationsTable.tsx
'use client';

import React from 'react';
import { StationWithDetails } from '@/types/station';
import { SortConfig } from '@/types/table';
import TableHeader from './TableHeader';
import  TablePagination  from './TablePagination';

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
  // client-side slice (if you use server-side paging replace this logic)
  const start = (currentPage - 1) * pageSize;
  const visible = stations.slice(start, start + pageSize);

  return (
    <div className="w-full">
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <TableHeader
                label="Station"
                sortKey="NomStation"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Commune"
                sortKey="NomCommune"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Marque"
                sortKey="Marque"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No stations found.
                </td>
              </tr>
            ) : (
              visible.map((s) => (
                <tr key={s.station.StationID ?? s.station.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.station.NomStation}</td>
                  <td className="px-4 py-2">{s.commune?.NomCommune ?? '-'}</td>
                  <td className="px-4 py-2">{s.marque?.Marque ?? '-'}</td>
                  <td className="px-4 py-2 space-x-2 text-right">
                    <button onClick={() => onEdit(s)} className="text-blue-600 hover:underline">
                      Modifier
                    </button>
                    <button onClick={() => onDelete(s)} className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}