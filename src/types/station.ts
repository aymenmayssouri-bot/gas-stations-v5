// src/types/station.ts
export type Station = {
  id: string;
  StationID?: string;
  NomStation: string;
  Adresse: string;
  Latitude: number;
  Longitude: number;
  Type: 'remplissage' | 'service';
  MarqueID: string;
  CommuneID: string;
  GerantID: string;
  ProprietaireID: string;
};

export type Marque = {
  id: string;
  MarqueID?: string;
  Marque: string;
  RaisonSociale: string;
};

export type Commune = {
  id: string;
  CommuneID?: string;
  NomCommune: string;
  ProvinceID: string;
};

export type Province = {
  id: string;
  ProvinceID?: string;
  NomProvince: string;
};

export type Gerant = {
  id: string;
  GerantID?: string;
  NomGerant: string;
  PrenomGerant: string;
  CINGerant: string;
  Telephone?: string;
  fullName?: string;
};

export type Proprietaire = {
  id: string;
  ProprietaireID?: string;
  TypeProprietaire: 'Physique' | 'Morale';
};

export type ProprietairePhysique = {
  id: string;
  ProprietaireID: string;
  NomProprietaire: string;
  PrenomProprietaire?: string;
};

export type ProprietaireMorale = {
  id: string;
  ProprietaireID: string;
  NomEntreprise: string;
};

export type Autorisation = {
  id: string;
  StationID: string;
  TypeAutorisation: 'création' | 'transformation' | 'transfert' | 'changement de marques';
  NumeroAutorisation: string;
  DateAutorisation: Date | null;
};

export type CapaciteStockage = {
  id: string;
  StationID: string;
  TypeCarburant: 'Gasoil' | 'SSP';
  CapaciteLitres: number;
};

export type StationWithDetails = {
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
};