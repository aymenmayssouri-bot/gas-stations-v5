// src/components/stations/AnalyseTable.tsx
'use client';

import React, { useState } from 'react';
import { Analyse } from '@/types/station';
import { formatDate } from '@/utils/format';
import { useAnalyseCRUD } from '@/hooks/useStationData/useAnalyseCRUD';
import { Button } from '@/components/ui/Button';

interface AnalyseTableProps {
  analyses: Analyse[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (analyse: Analyse) => void;
  onRefresh?: () => void;
}

export default function AnalyseTable({ analyses, loading, error, onEdit, onRefresh }: AnalyseTableProps) {
  const { deleteAnalyse, loading: deleting } = useAnalyseCRUD();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (analyse: Analyse) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'analyse "${analyse.CodeAnalyse}" ?`)) {
      return;
    }

    setDeletingId(analyse.AnalyseID);
    
    try {
      await deleteAnalyse(analyse.AnalyseID);
      onRefresh?.(); // Refresh the analyses after deletion
    } catch (err) {
      console.error('Error deleting analyse:', err);
      alert('Erreur lors de la suppression de l\'analyse');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des analyses...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!analyses.length) {
    return <div className="text-gray-500 text-center py-4">Aucune analyse trouvée</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Résultat
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {analyses.map((analyse) => (
            <tr key={analyse.AnalyseID} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {analyse.CodeAnalyse}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analyse.DateAnalyse ? formatDate(analyse.DateAnalyse) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  analyse.ProduitAnalyse === 'Gasoil' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {analyse.ProduitAnalyse}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  analyse.ResultatAnalyse === 'Conforme' 
                    ? 'bg-green-100 text-green-800' 
                    : analyse.ResultatAnalyse === 'Non Conforme'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {analyse.ResultatAnalyse}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(analyse)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Modifier
                  </button>
                )}
                <button
                  onClick={() => handleDelete(analyse)}
                  disabled={deletingId === analyse.AnalyseID}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deletingId === analyse.AnalyseID ? 'Suppression...' : 'Supprimer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}