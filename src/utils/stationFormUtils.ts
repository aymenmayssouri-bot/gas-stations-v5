// src/utils/stationFormUtils.ts
import { StationWithDetails, StationFormData } from '@/types/station';

export function stationWithDetailsToFormData(stationData: StationWithDetails): StationFormData {
  const { station, marque, commune, province, gerant, proprietaire, autorisations, capacites } = stationData;

  // Get capacities by type
  const gasoilCapacity = capacites?.find(c => c.TypeCarburant === 'Gasoil');
  const sspCapacity = capacites?.find(c => c.TypeCarburant === 'SSP');

  // Format date for HTML input
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  return {
    id: station.StationID,
    NomStation: station.NomStation || '',
    Adresse: station.Adresse || '',
    Latitude: station.Latitude ? station.Latitude.toString() : '0', // Default to '0' for number input
    Longitude: station.Longitude ? station.Longitude.toString() : '0', // Default to '0' for number input
    Type: station.Type || 'service',
    Marque: marque?.Marque || '',
    RaisonSociale: marque?.RaisonSociale || '',
    Province: province?.NomProvince || '',
    Commune: commune?.NomCommune || '',
    PrenomGerant: gerant?.PrenomGerant || '',
    NomGerant: gerant?.NomGerant || '',
    CINGerant: gerant?.CINGerant || '',
    Telephone: gerant?.Telephone || '',
    TypeProprietaire: proprietaire?.base?.TypeProprietaire || 'Physique',
    PrenomProprietaire: proprietaire?.base?.TypeProprietaire === 'Physique'
      ? (proprietaire.details as any)?.PrenomProprietaire || ''
      : '',
    NomProprietaire: proprietaire?.base?.TypeProprietaire === 'Physique'
      ? (proprietaire.details as any)?.NomProprietaire || ''
      : '',
    NomEntreprise: proprietaire?.base?.TypeProprietaire === 'Morale'
      ? (proprietaire.details as any)?.NomEntreprise || ''
      : '',
    autorisations: autorisations?.map(a => ({
      TypeAutorisation: a.TypeAutorisation,
      NumeroAutorisation: a.NumeroAutorisation || '',
      DateAutorisation: formatDateForInput(a.DateAutorisation)
    })) ?? [{ TypeAutorisation: 'création', NumeroAutorisation: '', DateAutorisation: '' }],
    CapaciteGasoil: gasoilCapacity?.CapaciteLitres?.toString() || '0', // Default to '0' for number input
    CapaciteSSP: sspCapacity?.CapaciteLitres?.toString() || '0', // Default to '0' for number input
    TypeGerance: station.TypeGerance || 'libre',
    Statut: station.Statut || 'en activité',
    Commentaires: station.Commentaires || '', // Added to match StationFormData
    NombreVolucompteur: station.NombreVolucompteur ? station.NombreVolucompteur.toString() : '0' // Default to '0'
  };
}