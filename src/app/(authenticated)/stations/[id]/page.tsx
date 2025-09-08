// src/app/(authenticated)/stations/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StationWithDetails } from '@/types/station';
import { useStations } from '@/hooks/stations/useStations';
import { Card, Button, LoadingSpinner, ErrorMessage } from '@/components/ui';
import dynamic from 'next/dynamic';
import { formatDate, getProprietaireName } from '@/utils/format';
import { StationForm } from '@/components/stations/StationForm';
import { Modal } from '@/components/ui/Modal';

// Dynamically import Map (to avoid SSR issues)
const GoogleMap = dynamic(() => import('@/components/dashboard/MapPreview'), { ssr: false });

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { stations, loading, error, refetch } = useStations();
  const [station, setStation] = useState<StationWithDetails | null>(null);
  const [showForm, setShowForm] = useState(false); // State for modal
  const [editingStation, setEditingStation] = useState<StationWithDetails | undefined>(undefined); // State for editing station

  useEffect(() => {
    if (stations.length > 0) {
      const found = stations.find((s) => s.station.StationID === id);
      setStation(found || null);
    }
  }, [stations, id]);

  // Handler to open the edit form
  const handleEdit = () => {
    setEditingStation(station || undefined);
    setShowForm(true);
  };

  // Handler for form save
  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingStation(undefined);
    await refetch(); // Refresh data after saving
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} />
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
          <Button onClick={handleEdit}>Modifier la station</Button>
          <Button onClick={() => router.push(`/stations/${id}/analyses`)} variant="secondary">
            Gérer les analyses
          </Button>
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
        <h2 className="text-lg font-semibold mb-2">Dernières Analyses</h2>
        {station.analyses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Code Analyse</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Date d'Analyse</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Produit</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Résultat</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {station.analyses.map((an) => (
                  <tr key={an.AnalyseID}>
                    <td className="px-4 py-2">{an.CodeAnalyse}</td>
                    <td className="px-4 py-2">{formatDate(an.DateAnalyse)}</td>
                    <td className="px-4 py-2">{an.ProduitAnalyse}</td>
                    <td className="px-4 py-2">{an.ResultatAnalyse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune analyse enregistrée pour cette station.</p>
        )}
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

      {/* Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStation(undefined);
        }}
        title="Modifier la station"
        size="xl"
      >
        <StationForm
          mode="edit"
          station={editingStation}
          onSaved={handleFormSaved}
        />
      </Modal>
    </div>
  );
}