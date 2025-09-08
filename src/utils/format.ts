// src/utils/format.ts
import { StationWithDetails, ProprietairePhysique, ProprietaireMorale } from '@/types/station';

export function formatDate(value: any): string {
  if (!value) return 'N/A';
  if (value instanceof Date) {
    // Format as DD/MM/YYYY
    return value.toLocaleDateString('fr-FR');
  }
  // Handle Firestore Timestamps
  if (typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('fr-FR');
  }
  return String(value);
}

/**
 * 5. FIX: Safely gets the full name of a station's owner.
 * This function is now more robust. The "N/A" issue likely stems from Firestore data
 * where a 'proprietaires' entry exists without its corresponding details in
 * 'proprietaires_physiques' or 'proprietaires_morales'.
 */
export function getProprietaireName(station: StationWithDetails): string {
  if (!station.proprietaire) return 'N/A';
  const { base, details } = station.proprietaire;

  if (base.TypeProprietaire === 'Physique') {
    return `${(details as any).PrenomProprietaire || ''} ${(details as any).NomProprietaire || ''}`.trim() || 'N/A';
  }

  if (base.TypeProprietaire === 'Morale') {
    return (details as any).NomEntreprise || 'N/A';
  }

  return 'N/A';
}