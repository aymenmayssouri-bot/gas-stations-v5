// src/components/stations/StationsTable.tsx
'use client';

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
}: StationsTableProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full table-auto text-sm text-gray-900">
          <thead className="bg-gray-100">
            <tr>
              <TableHeader label="Station" sortKey="NomStation" sortConfig={sortConfig} onSortChange={onSortChange} />
              <TableHeader label="Commune" sortKey="NomCommune" sortConfig={sortConfig} onSortChange={onSortChange} />
              <TableHeader label="Marque" sortKey="Marque" sortConfig={sortConfig} onSortChange={onSortChange} />
              <th className="px-4 py-2 text-right w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">Aucune station trouvée.</td>
              </tr>
            ) : (
              stations.map((s) => (
                <tr key={s.station.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.station.NomStation}</td>
                  <td className="px-4 py-2">{s.commune.NomCommune}</td>
                  <td className="px-4 py-2">{s.marque.Marque}</td>
                  <td className="px-4 py-2 space-x-2 text-right">
                    <button onClick={() => onEdit(s)} className="text-blue-600 hover:underline">Modifier</button>
                    <button onClick={() => onDelete(s)} className="text-red-600 hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}