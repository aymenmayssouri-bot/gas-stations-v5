// src/lib/utils/stationUtils.ts
import { GasStation, StationType } from '@/types/station';

export function extractUniqueProvinces(stations: GasStation[]): string[] {
  const provinces = new Set<string>();
  stations.forEach(s => {
    const v = s['Province']?.trim();
    if (v) provinces.add(v);
  });
  return Array.from(provinces).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function extractUniqueBrands(stations: GasStation[]): string[] {
  const brands = new Set<string>();
  stations.forEach(s => {
    const v = s['Marque']?.trim();
    if (v) brands.add(v);
  });
  return Array.from(brands).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function formatCapacity(capacity: number | null | undefined): string {
  if (capacity === null || capacity === undefined) return 'N/A';
  return `${capacity.toLocaleString('fr-FR')} L`;
}

export function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('fr-FR');
}

// Missing functions that were referenced in useDashboardStats
export function getUniqueBrands(stations: GasStation[]): string[] {
  return extractUniqueBrands(stations);
}

export function getStationsByType(stations: GasStation[], type: StationType): GasStation[] {
  return stations.filter(station => station.Type === type);
}

export function calculateAveragePrice(stations: GasStation[], fuelType: string): number | null {
  // Since you don't have pricing in your current schema, return null
  // You can implement this later when you add pricing fields
  return null;
}

export function getStationsWithShops(stations: GasStation[]): GasStation[] {
  // Since you don't have shop info in your current schema, return empty array
  // You can implement this later when you add shop fields
  return [];
}

export function getMostCommonFuelType(stations: GasStation[]): string | null {
  // Since you don't have fuel type info in your current schema, return null
  // You can implement this later when you add fuel type fields
  return null;
}