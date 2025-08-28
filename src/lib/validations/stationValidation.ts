import { StationFormData } from '@/types/station';

export type NormalizedFormErrors = Partial<Record<keyof StationFormData | 'submit', string>>;

export function validateStationData(data: StationFormData): { 
  isValid: boolean; 
  errors: NormalizedFormErrors 
} {
  const errors: NormalizedFormErrors = {};

  const required: (keyof StationFormData)[] = [
    'NomStation',
    'Adresse',
    'Latitude',
    'Longitude',
    'Type',
    'Marque',
    'RaisonSociale',
    'Commune',
    'Province',
    'Gerant',
    'CINGerant',
  ];
  
  for (const key of required) {
    const v = data[key];
    if (v === undefined || v === null || String(v).trim() === '') {
      errors[key] = 'Champ obligatoire';
    }
  }

  // Validate coordinates
  const toNumber = (s: string) => (s === '' ? null : Number(String(s).replace(/,/g, '.')));

  const lat = toNumber(data.Latitude);
  if (lat === null || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.Latitude = 'Latitude invalide (entre -90 et 90)';
  }

  const lng = toNumber(data.Longitude);
  if (lng === null || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.Longitude = 'Longitude invalide (entre -180 et 180)';
  }

  // Validate capacities if provided
  if (data.CapaciteGasoil.trim()) {
    const gasoil = toNumber(data.CapaciteGasoil);
    if (gasoil === null || gasoil < 0) {
      errors.CapaciteGasoil = 'Capacité Gasoil invalide';
    }
  }

  if (data.CapaciteSSP.trim()) {
    const ssp = toNumber(data.CapaciteSSP);
    if (ssp === null || ssp < 0) {
      errors.CapaciteSSP = 'Capacité SSP invalide';
    }
  }

  // Validate proprietaire based on type
  if (data.TypeProprietaire === 'Physique' && !data.NomProprietaire.trim()) {
    errors.NomProprietaire = 'Nom propriétaire requis pour type physique';
  }

  if (data.TypeProprietaire === 'Morale' && !data.NomEntreprise.trim()) {
    errors.NomEntreprise = 'Nom entreprise requis pour type morale';
  }

  // Simple date validation if provided
  const looksLikeDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (data.DateAutorisation && !looksLikeDate(data.DateAutorisation)) {
    errors.DateAutorisation = 'Format de date attendu: YYYY-MM-DD';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}