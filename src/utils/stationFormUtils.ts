
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
    Latitude: station.Latitude ? station.Latitude.toString() : '',
    Longitude: station.Longitude ? station.Longitude.toString() : '',
    Type: station.Type || 'service',
    
    // Marque
    Marque: marque?.Marque || '',
    RaisonSociale: marque?.RaisonSociale || '',
    
    // Location
    Province: province?.NomProvince || '',
    Commune: commune?.NomCommune || '',
    
    // Manager
    PrenomGerant: gerant?.PrenomGerant || '',
    NomGerant: gerant?.NomGerant || '',
    CINGerant: gerant?.CINGerant || '',
    Telephone: gerant?.Telephone || '',
    
    // Owner
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
    
    // Authorizations
    autorisations: autorisations?.map(a => ({
      TypeAutorisation: a.TypeAutorisation,
      NumeroAutorisation: a.NumeroAutorisation,
      DateAutorisation: formatDateForInput(a.DateAutorisation)
    })) ?? [{ TypeAutorisation: 'création', NumeroAutorisation: '', DateAutorisation: '' }],
    
    // Capacities
    CapaciteGasoil: gasoilCapacity?.CapaciteLitres?.toString() || '',
    CapaciteSSP: sspCapacity?.CapaciteLitres?.toString() || '',

    TypeGerance: station.TypeGerance || 'libre',
    Statut: station.Statut || 'en activité',
  };
}