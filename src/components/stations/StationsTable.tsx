// src/components/stations/StationsTable.tsx
// Updated table component for normalized station data

import React from 'react';
import { StationWithDetails } from '@/types/station';
import Button from '@/components/ui/Button';

interface StationsTableProps {
  stations: StationWithDetails[];
  onEdit: (station: StationWithDetails) => void;
  onDelete: (station: StationWithDetails) => void;
}

function formatCapacity(capacity: number | null | undefined): string {
  if (capacity === null || capacity === undefined) return 'N/A';
  return `${capacity.toLocaleString('fr-FR')} L`;
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('fr-FR');
}

export function StationsTable({ stations, onEdit, onDelete }: StationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-gray-700">
            <th className="px-4 py-3 text-left font-medium">Station</th>
            <th className="px-4 py-3 text-left font-medium">Marque</th>
            <th className="px-4 py-3 text-left font-medium">Gérant</th>
            <th className="px-4 py-3 text-left font-medium">Téléphone</th>
            <th className="px-4 py-3 text-left font-medium">Localisation</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Propriétaire</th>
            <th className="px-4 py-3 text-left font-medium">Capacités</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {stations.map((stationData) => {
            const gasoilCapacite = stationData.capacites.find(c => c.TypeCarburant === 'Gasoil');
            const sspCapacite = stationData.capacites.find(c => c.TypeCarburant === 'SSP');
            
            const proprietaireText = stationData.proprietaire 
              ? stationData.proprietaire.base.TypeProprietaire === 'Physique'
                ? (stationData.proprietaire.details as any).NomProprietaire
                : (stationData.proprietaire.details as any).NomEntreprise
              : 'N/A';

            return (
              <tr key={stationData.station.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{stationData.station.NomStation}</div>
                    <div className="text-xs text-gray-500">{stationData.station.Adresse}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-gray-900">{stationData.marque.Marque}</div>
                    <div className="text-xs text-gray-500">{stationData.marque.RaisonSociale}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-gray-900">{stationData.gerant.Gerant}</div>
                    <div className="text-xs text-gray-500">CIN: {stationData.gerant.CINGerant}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{stationData.gerant.Telephone || 'N/A'}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-gray-900">{stationData.commune.Commune}</div>
                    <div className="text-xs text-gray-500">{stationData.province.Province}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stationData.station.Type === 'service' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {stationData.station.Type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700 text-xs max-w-24 truncate" title={proprietaireText}>
                    {proprietaireText}
                  </div>
                  {stationData.proprietaire && (
                    <div className="text-xs text-gray-500">
                      ({stationData.proprietaire.base.TypeProprietaire})
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="text-gray-500">G:</span> {formatCapacity(gasoilCapacite?.CapaciteLitres)}
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">SSP:</span> {formatCapacity(sspCapacite?.CapaciteLitres)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(stationData)}>
                      Modifier
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(stationData)}>
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
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