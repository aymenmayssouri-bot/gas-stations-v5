'use client';

import React from 'react';
import { Analyse } from '@/types/station';
import { formatDate } from '@/utils/format';

interface AnalyseTableProps {
  analyses: Analyse[];
  loading?: boolean;
  error?: string | null;
}

export default function AnalyseTable({ analyses, loading, error }: AnalyseTableProps) {
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
                  analyse.ResultatAnalyse === 'Positive' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {analyse.ResultatAnalyse}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}