// src/types/normalized-station.ts
// New normalized types for the restructured database

export interface Province {
  id?: string;
  Province: string;
}

export interface Commune {
  id?: string;
  Commune: string;
  ProvinceID: string;
}

export interface Marque {
  id?: string;
  Marque: string;
  RaisonSociale: string;
}

export interface Gerant {
  id?: string;
  Gerant: string;
  CINGerant: string;
  Telephone?: string;
}

export interface Proprietaire {
  id?: string;
  TypeProprietaire: 'Physique' | 'Morale';
}

export interface ProprietairePhysique {
  id?: string;
  ProprietaireID: string;
  NomProprietaire: string;
}

export interface ProprietaireMorale {
  id?: string;
  ProprietaireID: string;
  NomEntreprise: string;
}

export interface Station {
  id?: string;
  NomStation: string;
  Adresse: string;
  Latitude: number | null;
  Longitude: number | null;
  Type: 'service' | 'remplissage';
  MarqueID: string;
  CommuneID: string;
  GerantID: string;
  ProprietaireID?: string;
}

export interface Autorisation {
  id?: string;
  StationID: string;
  TypeAutorisation: 'création' | 'transformation' | 'transfert' | 'changement de marques';
  NumeroAutorisation: string;
  DateAutorisation: Date | null;
}

export interface CapaciteStockage {
  id?: string;
  StationID: string;
  TypeCarburant: 'Gasoil' | 'SSP';
  CapaciteLitres: number;
}

// Composite types for joined data
export interface StationWithDetails {
  station: Station;
  marque: Marque;
  commune: Commune;
  province: Province;
  gerant: Gerant;
  proprietaire?: {
    base: Proprietaire;
    details: ProprietairePhysique | ProprietaireMorale;
  };
  autorisations: Autorisation[];
  capacites: CapaciteStockage[];
}

// Form data types
export interface StationFormData {
  id?: string;
  NomStation: string;
  Adresse: string;
  Latitude: string;
  Longitude: string;
  Type: 'service' | 'remplissage';
  
  // Marque data
  Marque: string;
  RaisonSociale: string;
  
  // Location data
  Commune: string;
  Province: string;
  
  // Gerant data
  Gerant: string;
  CINGerant: string;
  Telephone: string;
  
  // Proprietaire data
  TypeProprietaire: 'Physique' | 'Morale';
  NomProprietaire: string; // For Physique
  NomEntreprise: string;   // For Morale
  
  // Autorisation data
  TypeAutorisation: 'création' | 'transformation' | 'transfert' | 'changement de marques';
  NumeroAutorisation: string;
  DateAutorisation: string;
  
  // Capacites data
  CapaciteGasoil: string;
  CapaciteSSP: string;
}