// src/utils/stationFormUtils.ts

import {
  StationWithDetails,
  StationFormData,
  ProprietairePhysique,
  ProprietaireMorale,
} from '@/types/station';

export function stationWithDetailsToFormData(stationData: StationWithDetails): StationFormData {
  const gasoilCapacite = stationData.capacites.find(c => c.TypeCarburant === 'Gasoil');
  const sspCapacite = stationData.capacites.find(c => c.TypeCarburant === 'SSP');
  const mainAutorisation = stationData.autorisations[0]; // Take first autorisation

  return {
    id: stationData.station.id,
    NomStation: stationData.station.NomStation,
    Adresse: stationData.station.Adresse,
    Latitude: stationData.station.Latitude?.toString() || '',
    Longitude: stationData.station.Longitude?.toString() || '',
    Type: stationData.station.Type,
    
    Marque: stationData.marque.Marque,
    RaisonSociale: stationData.marque.RaisonSociale,
    
    Commune: stationData.commune.Commune,
    Province: stationData.province.Province,
    
    Gerant: stationData.gerant.Gerant,
    CINGerant: stationData.gerant.CINGerant,
    Telephone: stationData.gerant.Telephone || '',
    
    TypeProprietaire: stationData.proprietaire?.base.TypeProprietaire || 'Physique',
    NomProprietaire: stationData.proprietaire?.base.TypeProprietaire === 'Physique' ? 
      (stationData.proprietaire.details as ProprietairePhysique).NomProprietaire : '',
    NomEntreprise: stationData.proprietaire?.base.TypeProprietaire === 'Morale' ? 
      (stationData.proprietaire.details as ProprietaireMorale).NomEntreprise : '',
    
    TypeAutorisation: mainAutorisation?.TypeAutorisation || 'création',
    NumeroAutorisation: mainAutorisation?.NumeroAutorisation || '',
    DateAutorisation: mainAutorisation?.DateAutorisation ? 
      mainAutorisation.DateAutorisation.toISOString().slice(0, 10) : '',
    
    CapaciteGasoil: gasoilCapacite?.CapaciteLitres.toString() || '',
    CapaciteSSP: sspCapacite?.CapaciteLitres.toString() || ''
  };
}