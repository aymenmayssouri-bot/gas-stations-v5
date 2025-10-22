// src/utils/format.ts
import { StationWithDetails, ProprietairePhysique, ProprietaireMorale } from '@/types/station';

/**
 * Format any date value to DD/MM/YYYY string for display
 */
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

/**
 * Parse a date string in DD/MM/YYYY format to a Date object
 * Returns null if the date is invalid
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Remove any extra whitespace
  dateStr = dateStr.trim();
  
  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Validate ranges
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;
  if (year < 1900 || year > 2100) return null;
  
  // Create date (month is 0-indexed in JavaScript)
  const date = new Date(year, month - 1, day);
  
  // Verify the date is valid (handles cases like 31/02/2023)
  if (date.getDate() !== day || 
      date.getMonth() !== month - 1 || 
      date.getFullYear() !== year) {
    return null;
  }
  
  return date;
}

/**
 * Format a Date object to DD/MM/YYYY string for form input
 * Returns empty string if date is invalid
 */
export function formatDateForInput(date: Date | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Validate a date string in DD/MM/YYYY format
 * Returns true if valid, false otherwise
 */
export function isValidDateString(dateStr: string): boolean {
  return parseDateString(dateStr) !== null;
}

/**
 * Get the full name of a station's proprietaire
 */
export function getProprietaireName(station: StationWithDetails): string {
  if (!station.proprietaire) return 'N/A';
  const { base, details } = station.proprietaire;

  if (base.TypeProprietaire === 'Physique') {
    const prenom = (details as any).PrenomProprietaire || '';
    const nom = (details as any).NomProprietaire || '';
    return `${prenom} ${nom}`.trim() || 'N/A';
  }

  if (base.TypeProprietaire === 'Morale') {
    return (details as any).NomEntreprise || 'N/A';
  }

  return 'N/A';
}