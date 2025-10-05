// src/lib/validations/stationValidation.ts
import { StationFormData } from '@/types/station';

export type NormalizedFormErrors = Partial<Record<keyof StationFormData | 'submit', string>>;

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
    const hasValidAutorisation = data.autorisations.some(
      auto => auto.NumeroAutorisation.trim() && auto.TypeAutorisation
    );
    
    if (!hasValidAutorisation) {
      errors.autorisations = 'Champ obligatoire - Au moins une autorisation complète est requise';
    }

    // Validate each autorisation
    data.autorisations.forEach((auto, index) => {
      if (!auto.DateAutorisation || auto.DateAutorisation === 'YYYY-MM-DD') {
        // This is the new required field error
        errors.autorisations = `Champ obligatoire - Date d'autorisation requise pour l'autorisation ${index + 1}`;
      }
      if (auto.DateAutorisation && !/^\d{4}-\d{2}-\d{2}$/.test(auto.DateAutorisation)) {
        errors.autorisations = `Format de date invalide pour l'autorisation ${index + 1} (YYYY-MM-DD)`;
      }
    });
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