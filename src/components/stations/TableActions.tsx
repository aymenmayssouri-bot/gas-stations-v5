'use client';

import { SearchInput } from '@/components/ui';
import { Button } from '@/components/ui';
import { RefreshCcw } from 'lucide-react'; // Add this import for refresh icon
import { FileSpreadsheet } from 'lucide-react'; // Add this import for excel icon

interface TableActionsProps {
  onAddNew: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalStations: number;
  onRefresh: () => void;
  onExport: () => void;
  isExporting: boolean;
  // Add new props for analyse filters
  analysisStatus: 'all' | 'analysed' | 'not-analysed';
  onAnalysisStatusChange: (status: 'all' | 'analysed' | 'not-analysed') => void;
  analysisYear: number | 'all';
  onAnalysisYearChange: (year: number | 'all') => void;
  years: number[];
  analysesLoading?: boolean;
  onResetAllFilters: () => void; // Add this new prop
}

export default function TableActions({
  onAddNew,
  searchQuery,
  onSearchChange,
  totalStations,
  onRefresh,
  onExport,
  isExporting,
  analysisStatus,
  onAnalysisStatusChange,
  analysisYear,
  onAnalysisYearChange,
  years,
  analysesLoading,
  onResetAllFilters,
}: TableActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Button 
          onClick={onAddNew}
          variant="default" 
          className="bg-black hover:bg-gray-800"
        >
          Ajouter une station
        </Button>
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="bg-[#217346] hover:bg-[#1a5c38] text-white flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Exportation...' : 'Exporter le tableau'}
        </Button>
        <Button
          onClick={onResetAllFilters}  // Change from onRefresh to onResetAllFilters
          variant="secondary"
          className="flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Rafraîchir
        </Button>
      </div>

      {/* Add analyse filters with label */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Analyses PP :</span>
        <select
          value={analysisStatus}
          onChange={(e) => onAnalysisStatusChange(e.target.value as 'all' | 'analysed' | 'not-analysed')}
          className="border rounded px-2 py-1 text-sm"
          disabled={analysesLoading}
        >
          <option value="all">Toutes les stations</option>
          <option value="analysed">Stations Analysées</option>
          <option value="not-analysed">Stations Non Analysées</option>
        </select>

        {analysisStatus === 'analysed' && (
          <select
            value={analysisYear}
            onChange={(e) => onAnalysisYearChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="border rounded px-2 py-1 text-sm"
            disabled={analysesLoading}
          >
            <option value="all">Toutes les années</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Rechercher une station..."
        />
        <div className="text-sm text-gray-500">
          {totalStations} station{totalStations !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}