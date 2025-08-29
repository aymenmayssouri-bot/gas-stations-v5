// src/types/station.ts

export interface Province {
  id?: string;
  NomProvince: string; // <-- Changed from Province
}

export interface Commune {
  id?: string;
  NomCommune: string; // <-- Changed from Commune
  ProvinceID: string;
}

export interface Marque {
  id?: string;
  Marque: string;
  RaisonSociale: string;
}

export interface Gerant {
  id?: string;
  NomGerant: string;     // <-- Changed from Gerant
  PrenomGerant: string;  // <-- Added
  CINGerant: string;
  Telephone?: string;
  readonly fullName?: string; // <-- Added for convenience
}

export interface Proprietaire {
  id?: string;
  TypeProprietaire: 'Physique' | 'Morale';
}

export interface ProprietairePhysique {
  id?: string;
  ProprietaireID: string;
  NomProprietaire: string;    // <-- Changed
  PrenomProprietaire: string; // <-- Added
  readonly fullName?: string;   // <-- Added for convenience
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
  
  Marque: string;
  RaisonSociale: string;
  
  Commune: string;   // Will use NomCommune for display/lookup
  Province: string;  // Will use NomProvince for display/lookup
  
  // Gerant data
  NomGerant: string;      // <-- Changed
  PrenomGerant: string;   // <-- Added
  CINGerant: string;
  Telephone: string;
  
  // Proprietaire data
  TypeProprietaire: 'Physique' | 'Morale';
  NomProprietaire: string;      // <-- Changed
  PrenomProprietaire: string; // <-- Added
  NomEntreprise: string;
  
  TypeAutorisation: 'création' | 'transformation' | 'transfert' | 'changement de marques';
  NumeroAutorisation: string;
  DateAutorisation: string;
  
  CapaciteGasoil: string;
  CapaciteSSP: string;
}