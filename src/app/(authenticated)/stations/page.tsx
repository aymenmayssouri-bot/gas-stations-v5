// src\app\(authenticated)\stations\page.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStations } from "@/hooks/stations/useStations";
import { useDeleteStation } from "@/hooks/stations/useDeleteStation";
import { useAnalysesIndex } from "@/hooks/useStationData/useAnalysesIndex"; // Add this import
import StationsTable from "@/components/stations/StationsTable";
import { StationForm } from "@/components/stations/StationForm";
import TableActions from "@/components/stations/TableActions";
import { EmptyState } from "@/components/stations/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SortConfig } from "@/types/table";
import { StationWithDetails } from "@/types/station";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getProprietaireName } from '@/utils/format';

// Add these type definitions after the imports
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

// Extend Window interface to include showSaveFilePicker
interface ExtendedWindow extends Window {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

declare let window: ExtendedWindow;

function safeFullName(first?: string, last?: string) {
  return `${first || ''} ${last || ''}`.trim() || '-';
}

const exportToExcel = async (stations: StationWithDetails[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stations');

  worksheet.columns = [
    { header: 'Code', key: 'Code', width: 15 },
    { header: 'Marque', key: 'Marque', width: 20 },
    { header: 'Raison Sociale', key: 'RaisonSociale', width: 25 },
    { header: 'Nom Station', key: 'NomStation', width: 25 },
    { header: 'Propriétaire', key: 'Proprietaire', width: 25 },
    { header: 'Gérant', key: 'Gerant', width: 20 },
    { header: 'CIN Gérant', key: 'CINGerant', width: 15 },
    { header: 'Téléphone Gérant', key: 'TelephoneGerant', width: 20 },
    { header: 'Adresse', key: 'Adresse', width: 30 },
    { header: 'Province', key: 'Province', width: 20 },
    { header: 'Commune', key: 'Commune', width: 20 },
    { header: 'Latitude', key: 'Latitude', width: 15 },
    { header: 'Longitude', key: 'Longitude', width: 15 },
    { header: 'Type', key: 'Type', width: 15 },
    { header: 'Capacité SSP (L)', key: 'CapaciteSSP', width: 20 },
    { header: 'Capacité Gasoil (L)', key: 'CapaciteGasoil', width: 20 },
    { header: 'Statut', key: 'Statut', width: 15 },
  ];

  stations.forEach((s) => {
    const capSSP = s.capacites.filter(c => c.TypeCarburant === 'SSP').reduce((sum, c) => sum + (c.CapaciteLitres || 0), 0);
    const capGasoil = s.capacites.filter(c => c.TypeCarburant === 'Gasoil').reduce((sum, c) => sum + (c.CapaciteLitres || 0), 0);

    worksheet.addRow({
      Code: s.station.Code || '-',
      Marque: s.marque?.Marque || '-',
      RaisonSociale: s.marque?.RaisonSociale || '-',
      NomStation: s.station.NomStation || '-',
      Proprietaire: getProprietaireName(s),
      Gerant: safeFullName(s.gerant?.PrenomGerant, s.gerant?.NomGerant),
      CINGerant: s.gerant?.CINGerant || '-',
      TelephoneGerant: s.gerant?.Telephone || '-',
      Adresse: s.station.Adresse || '-',
      Province: s.province?.NomProvince || '-',
      Commune: s.commune?.NomCommune || '-',
      Latitude: s.station.Latitude || '-',
      Longitude: s.station.Longitude || '-',
      Type: s.station.Type || '-',
      CapaciteSSP: capSSP || '-',
      CapaciteGasoil: capGasoil || '-',
      Statut: s.station.Statut || '-',
    });
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E5E5' },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  // Try showSaveFilePicker for modern browsers
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${filename}.xlsx`,
        types: [
          {
            description: 'Excel Spreadsheet',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(buffer);
      await writable.close();
      return;
    } catch (error) {
      console.warn('showSaveFilePicker failed, falling back to saveAs:', error);
    }
  }

  // Fallback to file-saver
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

export default function StationsPage() {
  const { stations, loading, error, refetch } = useStations();
  const { deleteStation, loading: deleting } = useDeleteStation();
  const router = useRouter();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<StationWithDetails | undefined>(undefined);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation state
  const [stationToDelete, setStationToDelete] = useState<StationWithDetails | undefined>(undefined);

  // Table state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "NomStation", direction: "asc" });
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [triggerExport, setTriggerExport] = useState(false);

  // Add new state for analyse filters
  const [analysisStatus, setAnalysisStatus] = useState<'all' | 'analysed' | 'not-analysed'>('all');
  const [analysisYear, setAnalysisYear] = useState<number | 'all'>('all');
  
  // Get all station IDs
  const stationIds = useMemo(() => stations.map(s => s.station.StationID), [stations]);
  
  // Use useAnalysesIndex hook
  const { years, filterStationsByAnalysis, loading: analysesLoading } = useAnalysesIndex(stationIds);

  // Update filtered stations to include analyse filtering
  const filteredStations = useMemo(() => {
    let filtered = stations;
    
    // Apply analyse filters
    if (!analysesLoading) {
      filtered = filterStationsByAnalysis(filtered, analysisStatus, analysisYear);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((station) => {
        return (
          station.station.NomStation?.toLowerCase().includes(query) ||
          station.commune?.NomCommune?.toLowerCase().includes(query) ||
          station.province?.NomProvince?.toLowerCase().includes(query) ||
          station.marque?.Marque?.toLowerCase().includes(query) ||
          station.station.Adresse?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [stations, searchQuery, analysisStatus, analysisYear, filterStationsByAnalysis, analysesLoading]);

  // Sort filtered stations
  const sortedStations = useMemo(() => {
    const sorted = [...filteredStations];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case "NomStation":
          aValue = a.station.NomStation;
          bValue = b.station.NomStation;
          break;
        case "NomCommune":
          aValue = a.commune?.NomCommune || '';
          bValue = b.commune?.NomCommune || '';
          break;
        case "Marque":
          aValue = a.marque?.Marque || '';
          bValue = b.marque?.Marque || '';
          break;
        case "NomProvince":
          aValue = a.province?.NomProvince || '';
          bValue = b.province?.NomProvince || '';
          break;
        case "Adresse":
          aValue = a.station.Adresse || '';
          bValue = b.station.Adresse || '';
          break;
        default:
          return 0;
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStations, sortConfig]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(sortedStations.length / pageSize));
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const handleSortChange = (config: SortConfig) => {
    setSortConfig(config);
    setCurrentPage(1);
  };

  const handleRowDoubleClick = (stationId: string) => {
    router.push(`/stations/${stationId}`);
  };

  const handleAddNew = () => {
    setEditingStation(undefined);
    setShowForm(true);
  };

  const handleEdit = (station: StationWithDetails) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const handleDelete = (station: StationWithDetails) => {
    setStationToDelete(station);
  };

  const confirmDelete = async () => {
    if (!stationToDelete?.station.StationID) return;
    try {
      await deleteStation(stationToDelete.station.StationID);
      await refetch();
      setStationToDelete(undefined);
    } catch (error) {
      console.error('Failed to delete station:', error);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingStation(undefined);
    await refetch();
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleExport = async (filteredStations: StationWithDetails[]) => {
    if (isExporting) return; // Prevent multiple simultaneous exports
    setIsExporting(true);
    try {
      await exportToExcel(filteredStations, 'Stations_Export');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l’exportation. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
      setTriggerExport(false);
    }
  };

  const handleExportTrigger = () => {
    if (isExporting) return; // Prevent triggering during export
    setTriggerExport(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  const hasSearch = searchQuery.trim().length > 0;
  const showEmptyState = sortedStations.length === 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stations-service</h1>
        <p className="text-sm text-gray-600">Gestion des stations avec structure normalisée.</p>
      </div>

      <TableActions
        onAddNew={handleAddNew}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalStations={stations.length}
        onRefresh={handleRefresh}
        onExport={handleExportTrigger}
        isExporting={isExporting}
        // Add new props
        analysisStatus={analysisStatus}
        onAnalysisStatusChange={setAnalysisStatus}
        analysisYear={analysisYear}
        onAnalysisYearChange={setAnalysisYear}
        years={years}
        analysesLoading={analysesLoading}
      />

      {showEmptyState ? (
        <EmptyState
          hasSearch={hasSearch}
          searchQuery={searchQuery}
          totalStations={stations.length}
        />
      ) : (
        <StationsTable
          stations={sortedStations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onRowDoubleClick={handleRowDoubleClick}
          onExport={handleExport}
          triggerExport={triggerExport}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStation(undefined);
        }}
        title={editingStation ? "Modifier la station" : "Créer une station"}
        size="xl"
      >
        <StationForm
          mode={editingStation ? "edit" : "create"}
          station={editingStation}
          onSaved={handleFormSaved}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!stationToDelete}
        onClose={() => setStationToDelete(undefined)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer la station "${stationToDelete?.station.NomStation}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleting}
        variant="danger"
      />
    </div>
  );
}