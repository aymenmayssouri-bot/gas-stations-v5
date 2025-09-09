// src/lib/validations/stationValidation.ts
import { StationFormData } from '@/types/station';

export type NormalizedFormErrors = Partial<Record<keyof StationFormData | 'submit', string>>;

export function validateStationData(data: StationFormData): { 
  isValid: boolean; 
  errors: NormalizedFormErrors 
} {
  const errors: NormalizedFormErrors = {};

  // CHANGE: Updated required fields to include NomGerant, PrenomGerant instead of Gerant
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
    'NomGerant', // Added
    'PrenomGerant', // Added
    'CINGerant',
    // CHANGE: Added Telephone
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

  // CHANGE: Validate TypeProprietaire
  if (!['Physique', 'Morale'].includes(data.TypeProprietaire)) {
    errors.TypeProprietaire = 'Type de propriétaire doit être Physique ou Morale';
  }

  // CHANGE: Enhanced proprietaire validation
  const proprietaireName = data.TypeProprietaire === 'Physique' ? data.NomProprietaire.trim() : data.NomEntreprise.trim();
  if (proprietaireName) {
    // Owner provided, validate all fields
    if (data.TypeProprietaire === 'Physique') {
      if (!data.NomProprietaire.trim()) {
        errors.NomProprietaire = 'Nom du propriétaire requis pour type physique';
      }
      if (!data.PrenomProprietaire.trim()) {
        errors.PrenomProprietaire = 'Prénom du propriétaire requis pour type physique';
      }
    } else {
      if (!data.NomEntreprise.trim()) {
        errors.NomEntreprise = 'Nom de l\'entreprise requis pour type morale';
      }
    }
  } else {
    // No owner provided, check for partial data
    if (data.TypeProprietaire === 'Physique' && data.PrenomProprietaire.trim()) {
      errors.NomProprietaire = 'Nom du propriétaire requis si le prénom est fourni';
    }
    if (data.TypeProprietaire === 'Morale' && data.NomEntreprise.trim()) {
      errors.NomEntreprise = 'Nom de l\'entreprise requis pour type morale';
    }
  }

  // CHANGE: Validate autorisations array
  if (data.autorisations && data.autorisations.length > 0) {
    data.autorisations.forEach((auto, index) => {
      if (auto.NumeroAutorisation.trim() && !auto.TypeAutorisation) {
        errors.autorisations = `Type d'autorisation requis pour l'autorisation ${index + 1}`;
      }
      if (auto.TypeAutorisation && !auto.NumeroAutorisation.trim()) {
        errors.autorisations = `Numéro d'autorisation requis pour l'autorisation ${index + 1}`;
      }
      if (auto.DateAutorisation && !/^\d{4}-\d{2}-\d{2}$/.test(auto.DateAutorisation)) {
        errors.autorisations = `Format de date invalide pour l'autorisation ${index + 1} (YYYY-MM-DD)`;
      }
    });
  }

  // CHANGE: Validate Telephone format (basic example, adjust as needed)
  if (data.Telephone.trim() && !/^\+?\d{9,15}$/.test(data.Telephone.trim())) {
    errors.Telephone = 'Numéro de téléphone invalide (9 à 15 chiffres, + facultatif)';
  }

  // CHANGE: Set general submit error if validation fails
  if (Object.keys(errors).length > 0) {
    errors.submit = 'Veuillez corriger les erreurs dans le formulaire avant de soumettre.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}