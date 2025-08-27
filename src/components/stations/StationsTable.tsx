import React from 'react';
import { GasStation } from '@/types/station';
import Button from '@/components/ui/Button';
import { formatCapacity, formatDate } from '@/lib/utils/stationUtils';

interface StationsTableProps {
  stations: GasStation[];
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
}

export function StationsTable({ stations, onEdit, onDelete }: StationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-gray-700">
            <th className="px-4 py-3 text-left font-medium">Nom de Station</th>
            <th className="px-4 py-3 text-left font-medium">Marque</th>
            <th className="px-4 py-3 text-left font-medium">Gérant</th>
            <th className="px-4 py-3 text-left font-medium">Téléphone</th>
            <th className="px-4 py-3 text-left font-medium">Province</th>
            <th className="px-4 py-3 text-left font-medium">Mise en service</th>
            <th className="px-4 py-3 text-left font-medium">SSP</th>
            <th className="px-4 py-3 text-left font-medium">Gasoil</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {stations.map((s) => (
            <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-900 font-medium">{s['Nom de Station']}</td>
              <td className="px-4 py-3 text-gray-700">{s['Marque']}</td>
              <td className="px-4 py-3 text-gray-700">{s['Gérant']}</td>
              <td className="px-4 py-3 text-gray-700">{s['numéro de Téléphone']}</td>
              <td className="px-4 py-3 text-gray-700">{s['Province']}</td>
              <td className="px-4 py-3 text-gray-700">{formatDate(s['Date Mise en service'])}</td>
              <td className="px-4 py-3 text-gray-700 text-right">{formatCapacity(s['Capacité SSP'])}</td>
              <td className="px-4 py-3 text-gray-700 text-right">{formatCapacity(s['Capacité Gasoil'])}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(s)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(s)}>
                    Supprimer
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {stations.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <p className="text-lg font-medium">Aucune station trouvée</p>
                  <p className="text-sm mt-1">Ajoutez votre première station pour commencer</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}