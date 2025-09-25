// src/components/stations/NearbyStationsTable.tsx
'use client';

import { StationWithDetails } from '@/types/station';

interface NearbyStationsTableProps {
  stations: (StationWithDetails & { distance: number })[];
}

export default function NearbyStationsTable({ stations }: NearbyStationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="mb-2 text-sm text-gray-600">Stations à moins de 20 km par route (triées par distance croissante)</div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 border text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Code
            </th>
            <th className="px-4 py-2 border text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Marque
            </th>
            <th className="px-4 py-2 border text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Commune
            </th>
            <th className="px-4 py-2 border text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Distance (km)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stations.map((s) => (
            <tr key={s.station.StationID} className="hover:bg-gray-50">
              <td className="px-4 py-2 border text-sm text-gray-900">{s.station.Code || '-'}</td>
              <td className="px-4 py-2 border text-sm text-gray-900 font-medium">{s.marque.Marque || '-'}</td>
              <td className="px-4 py-2 border text-sm text-gray-900">{s.commune.NomCommune || '-'}</td>
              <td className="px-4 py-2 border text-sm font-semibold text-green-600">
                {s.distance.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}