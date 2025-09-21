// src/types/station.ts
export type Station = {
  StationID: string;
  Code: number;
  NomStation: string;
  Adresse: string;
  Latitude: number;
  Longitude: number;
  Type: 'remplissage' | 'service';
  Statut: 'en activité' | 'en projet' | 'en arrêt' | 'archivé';
  TypeGerance: 'libre' | 'direct' | 'partenariat';
  NombreVolucompteur: number;
  Commentaires: string;
  MarqueID: string;
  CommuneID: string;
  GerantID: string;
  ProprietaireID: string;
};

export type Marque = {
  MarqueID: string;
  Marque: string;
  RaisonSociale: string;
};

export type Commune = {
  CommuneID: string;
  NomCommune: string;
  ProvinceID: string;
};

export type Province = {
  ProvinceID: string;
  NomProvince: string;
};

export type Gerant = {
  GerantID: string;
  NomGerant: string;
  PrenomGerant: string;
  CINGerant: string;
  Telephone?: string;
  fullName?: string;
};

export type Proprietaire = {
  ProprietaireID: string;
  TypeProprietaire: 'Physique' | 'Morale';
};

export type ProprietairePhysique = {
  ProprietaireID: string;
  NomProprietaire: string;
  PrenomProprietaire: string;
};

export type ProprietaireMorale = {
  ProprietaireID: string;
  NomEntreprise: string;
};

export type Autorisation = {
  AutorisationID: string;
  StationID: string;
  TypeAutorisation: 'création' | 'mise en service';
  NumeroAutorisation: string;
  DateAutorisation: Date | null;
};

export type CapaciteStockage = {
  CapaciteID: string;
  StationID: string;
  TypeCarburant: 'Gasoil' | 'SSP';
  CapaciteLitres: number;
};

export type Analyse = {
  AnalyseID: string;
  StationID: string;
  ProduitAnalyse: 'Gasoil' | 'SSP';
  DateAnalyse: Date | null;
  CodeAnalyse: string;
  ResultatAnalyse: 'Positif' | 'Négatif';
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
  analyses: Analyse[];
  creationAutorisation?: Autorisation;
  miseEnServiceAutorisation?: Autorisation;
};

export type StationFormData = {
  id?: string;
  NomStation: string;
  Adresse: string;
  Latitude: string;
  Longitude: string;
  Type: 'remplissage' | 'service';
  Marque: string;
  RaisonSociale: string;
  Province: string;
  Commune: string;
  PrenomGerant: string;
  NomGerant: string;
  CINGerant: string;
  Telephone: string;
  TypeProprietaire: 'Physique' | 'Morale';
  PrenomProprietaire: string;
  NomProprietaire: string;
  NomEntreprise: string;
  autorisations: {
    TypeAutorisation: 'création' | 'mise en service';
    NumeroAutorisation: string;
    DateAutorisation: string;
  }[];
  CapaciteGasoil: string;
  CapaciteSSP: string;
  TypeGerance: 'libre' | 'direct' | 'partenariat';
  Statut: 'en activité' | 'en projet' | 'en arrêt' | 'archivé';
  Commentaires: string;
  NombreVolucompteur: string;
};