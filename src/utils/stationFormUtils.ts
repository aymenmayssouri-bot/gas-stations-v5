// src/utils/stationFormUtils.ts
import { StationWithDetails, StationFormData } from '@/types/station';

export function stationWithDetailsToFormData(stationData: StationWithDetails): StationFormData {
  const { station, marque, commune, province, gerant, proprietaire, autorisations, capacites } = stationData;
  
  // Get the first authorization (if any)
  const firstAuth = autorisations?.[0];
  
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
    id: station.id,
    NomStation: station.NomStation || '',
    Adresse: station.Adresse || '',
    Latitude: station.Latitude ? station.Latitude.toString() : '',
    Longitude: station.Longitude ? station.Longitude.toString() : '',
    Type: station.Type || 'service',
    
    // Marque
    Marque: marque?.Marque || '',
    RaisonSociale: marque?.RaisonSociale || '',
    
    // Location
    Province: province?.NomProvince || province?.Province || '',
    Commune: commune?.NomCommune || commune?.Commune || '',
    
    // Manager - FIX: Use the correct field names
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
    
    // Authorization
    TypeAutorisation: firstAuth?.TypeAutorisation || 'création',
    NumeroAutorisation: firstAuth?.NumeroAutorisation || '',
    DateAutorisation: formatDateForInput(firstAuth?.DateAutorisation || null),
    
    // Capacities
    CapaciteGasoil: gasoilCapacity?.CapaciteLitres?.toString() || '',
    CapaciteSSP: sspCapacity?.CapaciteLitres?.toString() || '',
  };
}