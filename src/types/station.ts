export type StationType = 'service' | 'remplissage';
export type StationAuthorization =
  | 'création'
  | 'transformation'
  | 'transfert'
  | 'changement de marques';

export interface GasStation {
  id: string;
  'Raison sociale': string;
  'Marque': string;
  'Nom de Station': string;
  'Propriétaire': string;
  'Gérant': string;
  'CIN Gérant': string;
  'Adesse': string;
  'Latitude': number | null;
  'Longitude': number | null;
  'Commune': string;
  'Province': string;
  'Type': StationType;
  'Type Autorisation': StationAuthorization;
  'Date Creation': Date | null;
  'numéro de création': string;
  'Date Mise en service': Date | null;
  'numéro de Mise en service': string;
  'Capacité Gasoil': number | null;
  'Capacité SSP': number | null;
  'numéro de Téléphone': string;
}

/**
 * Form shape: all strings (what <input> elements bind to)
 */
export interface GasStationFormData {
  id?: string;
  'Raison sociale': string;
  'Marque': string;
  'Nom de Station': string;
  'Propriétaire': string;
  'Gérant': string;
  'CIN Gérant': string;
  'Adesse': string;
  'Latitude': string;   // numeric string
  'Longitude': string;  // numeric string
  'Commune': string;
  'Province': string;
  'Type': StationType;
  'Type Autorisation': StationAuthorization;
  'Date Creation': string;          // yyyy-mm-dd
  'numéro de création': string;
  'Date Mise en service': string;   // yyyy-mm-dd
  'numéro de Mise en service': string;
  'Capacité Gasoil': string;        // numeric string
  'Capacité SSP': string;           // numeric string
  'numéro de Téléphone': string;
}

/** Minimal shape when creating a new station from a form */
export type NewGasStation = Omit<GasStationFormData, 'id'>;