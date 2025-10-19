// src/lib/validations/stationValidation.ts
import { parseDateString } from '@/utils/format';
import { StationFormData } from '@/types/station';

type AutorisationError = Partial<Record<'TypeAutorisation' | 'NumeroAutorisation' | 'DateAutorisation', string>>;

export type NormalizedFormErrors = Partial<{
  [K in keyof StationFormData]: K extends 'autorisations' ? string | AutorisationError[] : string;
}> & {
  submit?: string;
};

export function validateStationData(data: StationFormData): { 
  isValid: boolean; 
  errors: NormalizedFormErrors 
} {
  const errors: NormalizedFormErrors = {};

  // Required fields for general information
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
    'NomGerant', 
    'PrenomGerant', 
    'CINGerant',
    'Telephone',
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

  // Validate TypeProprietaire
  if (!['Physique', 'Morale'].includes(data.TypeProprietaire)) {
    errors.TypeProprietaire = 'Champ obligatoire';
  }

  // Validate proprietaire fields - REQUIRED
  if (data.TypeProprietaire === 'Physique') {
    if (!data.NomProprietaire.trim()) {
      errors.NomProprietaire = 'Champ obligatoire';
    }
    if (!data.PrenomProprietaire.trim()) {
      errors.PrenomProprietaire = 'Champ obligatoire';
    }
  } else if (data.TypeProprietaire === 'Morale') {
    if (!data.NomEntreprise.trim()) {
      errors.NomEntreprise = 'Champ obligatoire';
    }
  }

  // Validate autorisations - AT LEAST ONE REQUIRED
  if (!data.autorisations || data.autorisations.length === 0) {
    errors.autorisations = 'Au moins une autorisation est requise';
  } else {
    const autorisationErrors: AutorisationError[] = data.autorisations.map(() => ({}));
    let hasErrors = false;

    data.autorisations.forEach((auto, index) => {
      if (!auto.TypeAutorisation) {
        autorisationErrors[index].TypeAutorisation = 'Type obligatoire';
        hasErrors = true;
      }
      if (!auto.NumeroAutorisation.trim()) {
        autorisationErrors[index].NumeroAutorisation = 'Numéro obligatoire';
        hasErrors = true;
      }
      if (!auto.DateAutorisation.trim()) {
        autorisationErrors[index].DateAutorisation = 'Date obligatoire';
        hasErrors = true;
      } else {
        const parsedDate = parseDateString(auto.DateAutorisation);
        if (!parsedDate) {
          autorisationErrors[index].DateAutorisation = 'Format de date invalide (JJ/MM/AAAA)';
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      errors.autorisations = autorisationErrors;
    }
  }

  // Validate Telephone format (basic example, adjust as needed)
  if (data.Telephone.trim() && !/^\+?\d{9,15}$/.test(data.Telephone.trim())) {
    errors.Telephone = 'Numéro de téléphone invalide (9 à 15 chiffres, + facultatif)';
  }

  // Set general submit error if validation fails
  if (Object.keys(errors).length > 0) {
    errors.submit = 'Veuillez corriger les erreurs dans le formulaire avant de soumettre.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}