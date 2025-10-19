// src/utils/format.ts
import { StationWithDetails, ProprietairePhysique, ProprietaireMorale } from '@/types/station';

export function formatDate(value: any): string {
  if (!value) return 'N/A';
  
  // Handle Date objects
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return 'N/A';
    return value.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Handle Firestore Timestamps
  if (typeof value.toDate === 'function') {
    const date = value.toDate();
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Handle string dates
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
  
  return 'N/A';
}

// Add a new function to parse dates from dd/mm/yyyy format
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle dd/mm/yyyy format
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return !isNaN(date.getTime()) ? date : null;
}

// Add a function to format date for input fields
export function formatDateForInput(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
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