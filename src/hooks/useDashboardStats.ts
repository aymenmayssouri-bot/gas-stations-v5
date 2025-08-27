'use client';

import { useMemo } from 'react';
import { GasStation } from '@/types/station';
import { DashboardStats } from '@/types/dashboard';
import { 
  calculateAveragePrice, 
  getUniqueBrands,
  getStationsWithShops,
  getMostCommonFuelType 
} from '@/lib/utils/stationUtils';

export function useDashboardStats(
  allStations: GasStation[], 
  filteredStations: GasStation[]
): DashboardStats {
  
  return useMemo(() => {
    const totalStations = allStations.length;
    const filteredCount = filteredStations.length;
    
    // Calculate averages from filtered stations
    const avgDieselPrice = calculateAveragePrice(filteredStations, 'diesel');
    const avgGasoline95Price = calculateAveragePrice(filteredStations, 'gasoline95');
    
    // Other statistics
    const uniqueBrands = getUniqueBrands(filteredStations);
    const stationsWithShops = getStationsWithShops(filteredStations);
    const mostCommonFuelType = getMostCommonFuelType(filteredStations);
    
    return {
      total: {
        stations: totalStations,
        filtered: filteredCount
      },
      pricing: {
        avgDieselPrice,
        avgGasoline95Price
      },
      breakdown: {
        brands: uniqueBrands.length,
        stationsWithShops: stationsWithShops.length,
        mostCommonFuelType
      }
    };
  }, [allStations, filteredStations]);
}