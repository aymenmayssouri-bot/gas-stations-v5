// File: src/lib/utils/tableUtils.ts
// The filtering logic for the table has been updated to search
// across the new fields.

import { GasStation } from '@/types/station';
import { SortConfig } from '@/types/table';

/**
 * Filter stations based on search query
 */
export function filterStations(stations: GasStation[], searchQuery: string): GasStation[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return stations;
  }

  const query = searchQuery.toLowerCase().trim();
  
  return stations.filter(station => {
    // Search in name, address, province, brand, and manager
    const searchableText = [
      station['Nom de Station'],
      station['Adesse'],
      station['Province'],
      station['Marque'],
      station['Gérant'],
      station['Propriétaire']
    ].join(' ').toLowerCase();
    
    return searchableText.includes(query);
  });
}

/**
 * Sort stations based on sort configuration
 */
export function sortStations(stations: GasStation[], sortConfig: SortConfig): GasStation[] {
  if (!sortConfig || !sortConfig.key) {
    return stations;
  }

  const sorted = [...stations].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof GasStation];
    const bValue = b[sortConfig.key as keyof GasStation];
    let compare = 0;

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      compare = aValue.localeCompare(bValue);
    }
    // Handle number comparison
    else if (typeof aValue === 'number' && typeof bValue === 'number') {
      compare = aValue - bValue;
    }
    // Handle date comparison
    else if (aValue instanceof Date && bValue instanceof Date) {
      compare = aValue.getTime() - bValue.getTime();
    } else {
      // Fallback for other types or mismatched types
      if (aValue === undefined && bValue === undefined) compare = 0;
      else if (aValue === undefined) compare = 1;
      else if (bValue === undefined) compare = -1;
      else compare = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.direction === 'asc' ? compare : -compare;
  });

  return sorted;
}