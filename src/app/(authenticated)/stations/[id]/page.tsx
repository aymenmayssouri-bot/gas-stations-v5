// src/app/(authenticated)/stations/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StationWithDetails, Analyse } from '@/types/station';
import { useStations } from '@/hooks/stations/useStations';
import { Card, Button, LoadingSpinner, ErrorMessage } from '@/components/ui';
import dynamic from 'next/dynamic';
import { formatDate, getProprietaireName } from '@/utils/format';
import { StationForm } from '@/components/stations/StationForm';
import { Modal } from '@/components/ui/Modal';
import { useAnalysesIndex } from '@/hooks/useStationData/useAnalysesIndex';
import AnalyseTable from '@/components/stations/AnalyseTable';
import AnalyseForm from '@/components/stations/AnalyseForm';
import { useDeleteStation } from '@/hooks/stations/useDeleteStation';

// Dynamically import Map (to avoid SSR issues)
const GoogleMap = dynamic(() => import('@/components/dashboard/MapPreview'), { ssr: false });

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { stations, loading: stationsLoading, error: stationsError, refetch } = useStations();
  const { analyses, loading: analysesLoading, error: analysesError, refetch: refetchAnalyses } = useAnalysesIndex(id);
  const { deleteStation, loading: deleteLoading } = useDeleteStation();
  
  const [station, setStation] = useState<StationWithDetails | null>(null);
  
  // Modal states
  const [showStationForm, setShowStationForm] = useState(false);
  const [editingStation, setEditingStation] = useState<StationWithDetails | undefined>(undefined);
  
  // Analysis modal states
  const [showAnalyseForm, setShowAnalyseForm] = useState(false);
  const [analyseFormMode, setAnalyseFormMode] = useState<'create' | 'edit'>('create');
  const [editingAnalyse, setEditingAnalyse] = useState<Analyse | undefined>(undefined);

  // Get analyses for current station
  const stationAnalyses = analyses || [];

  useEffect(() => {
    if (stations.length > 0) {
      const found = stations.find((s) => s.station.StationID === id);
      setStation(found || null);
    }
  }, [stations, id]);

  // Handler to open the station edit form
  const handleEditStation = () => {
    setEditingStation(station || undefined);
    setShowStationForm(true);
  };

  // Handler for station form save
  const handleStationFormSaved = async () => {
    setShowStationForm(false);
    setEditingStation(undefined);
    await refetch();
  };

  // Handler to open analysis create form
  const handleCreateAnalyse = () => {
    setAnalyseFormMode('create');
    setEditingAnalyse(undefined);
    setShowAnalyseForm(true);
  };

  // Handler to open analysis edit form
  const handleEditAnalyse = (analyse: Analyse) => {
    setAnalyseFormMode('edit');
    setEditingAnalyse(analyse);
    setShowAnalyseForm(true);
  };

  // Handler for analysis form save
  const handleAnalyseFormSaved = async () => {
    setShowAnalyseForm(false);
    setEditingAnalyse(undefined);
    await refetchAnalyses();
  };

  // Handler for analysis form cancel
  const handleAnalyseFormCancel = () => {
    setShowAnalyseForm(false);
    setEditingAnalyse(undefined);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!station || deleteLoading) return;
    
    if (!confirm("Est ce que vous êtes sûr de vouloir supprimer cette station ?")) {
      return;
    }
    
    try {
      await deleteStation(station.station.StationID);
      router.push('/stations');
    } catch (error) {
      console.error('Failed to delete station:', error);
    }
  };

  useEffect(() => {
    console.log('Current station:', station);
    console.log('Current analyses:', analyses);
  }, [station, analyses]);

  if (stationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (stationsError) {
    return (
      <div className="p-6">
        <ErrorMessage message={stationsError} />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-6">
        <ErrorMessage message="Station introuvable." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{station.station.NomStation}</h1>
        <div className="space-x-2">
          <Button onClick={handleEditStation}>Modifier la station</Button>
          <Button onClick={handleDelete} variant="danger">Supprimer</Button>
        </div>
      </div>

      {/* Informations générales */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
          <div><strong>Code:</strong> {station.station.Code || 'N/A'}</div>
          <div><strong>Nom de la station:</strong> {station.station.NomStation}</div>
          <div><strong>Statut:</strong> <span className="capitalize">{station.station.Statut || 'N/A'}</span></div>
          
          <div><strong>Marque:</strong> {station.marque.Marque}</div>
          <div><strong>Raison Sociale:</strong> {station.marque.RaisonSociale || 'N/A'}</div>
          <div><strong>Type:</strong> <span className="capitalize">{station.station.Type}</span></div>
          
          
          <div><strong>Propriétaire:</strong> {getProprietaireName(station)}</div>
          <div className="col-span-2"><strong>Gérant:</strong> {station.gerant.fullName} (CIN: {station.gerant.CINGerant || 'N/A'}, Tél: {station.gerant.Telephone || 'N/A'})</div>
          <div><strong>Type de Gérance:</strong> <span className="capitalize">{station.station.TypeGerance}</span></div>
          
          <div className="col-span-3 border-t pt-4 mt-2"><strong>Adresse:</strong> {station.station.Adresse}</div>
          <div><strong>Province:</strong> {station.province.NomProvince}</div>
          <div><strong>Commune:</strong> {station.commune.NomCommune}</div>
          <div/>
          
          <div><strong>Latitude:</strong> {station.station.Latitude}</div>
          <div><strong>Longitude:</strong> {station.station.Longitude}</div>
        </div>
      </Card>

      {/* Capacités */}
      {station.capacites?.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-2">Capacités de stockage</h2>
          <ul className="list-disc pl-6 text-sm">
            {station.capacites.map((c) => (
              <li key={c.CapaciteID}>
                {c.TypeCarburant} – {c.CapaciteLitres.toLocaleString('fr-FR')} litres
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Autorisations */}
      {station.autorisations?.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-2">Autorisations</h2>
          <ul className="list-disc pl-6 text-sm">
            {station.autorisations.map((a) => (
              <li key={a.AutorisationID}>
                {a.TypeAutorisation} – N° {a.NumeroAutorisation} (du {formatDate(a.DateAutorisation)})
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Analyses Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Analyses</h2>
          <Button onClick={handleCreateAnalyse} size="sm">
            Nouvelle Analyse
          </Button>
        </div>
        <AnalyseTable 
          analyses={stationAnalyses}
          loading={analysesLoading}
          error={analysesError}
          onEdit={handleEditAnalyse}
          onRefresh={refetchAnalyses}
        />
      </Card>

      {/* Map */}
      {station.station.Latitude && station.station.Longitude && (
        <Card>
          <h2 className="text-lg font-semibold mb-2">Localisation</h2>
          <div className="h-80">
            <GoogleMap stations={[station]} />
          </div>
        </Card>
      )}

      {/* Station Edit Modal */}
      <Modal
        isOpen={showStationForm}
        onClose={() => {
          setShowStationForm(false);
          setEditingStation(undefined);
        }}
        title="Modifier la station"
        size="xl"
      >
        <StationForm
          mode="edit"
          station={editingStation}
          onSaved={handleStationFormSaved}
        />
      </Modal>

      {/* Analysis Form Modal */}
      <Modal
        isOpen={showAnalyseForm}
        onClose={handleAnalyseFormCancel}
        title={analyseFormMode === 'create' ? 'Nouvelle Analyse' : 'Modifier l\'Analyse'}
        size="lg"
      >
        <AnalyseForm
          mode={analyseFormMode}
          stationId={id}
          analyse={editingAnalyse}
          onSaved={handleAnalyseFormSaved}
          onCancel={handleAnalyseFormCancel}
        />
      </Modal>
    </div>
  );
}