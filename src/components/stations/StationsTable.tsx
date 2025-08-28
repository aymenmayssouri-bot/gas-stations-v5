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

  // 🔹 New props
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function StationsTable({
  stations,
  onEdit,
  onDelete,
  sortConfig,
  onSortChange,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
}: StationsTableProps) {
  return (
    <div className="space-y-4">
      {/* 🔎 Search bar */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Rechercher une station..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader
                label="Nom"
                sortKey="NomStation"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Commune"
                sortKey="Commune"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <TableHeader
                label="Marque"
                sortKey="Marque"
                sortConfig={sortConfig}
                onSortChange={onSortChange}
              />
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Aucune station trouvée.
                </td>
              </tr>
            ) : (
              stations.map((s) => (
                <tr key={s.station.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.station.NomStation}</td>
                  <td className="px-4 py-2">{s.commune.Commune}</td>
                  <td className="px-4 py-2">{s.marque.Marque}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => onEdit(s)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="text-red-600 hover:underline"
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

      {/* 📄 Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}