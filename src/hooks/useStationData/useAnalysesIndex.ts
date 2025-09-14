// src/hooks/useStationData/useAnalysesIndex.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Analyse } from '@/types/station';
import { analyseConverter } from '@/lib/firebase/converters';

type Status = 'all' | 'analysed' | 'not-analysed';

export function useAnalysesIndex(stationId: string | string[]) {
  const [analyses, setAnalyses] = useState<Analyse[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async () => {
    console.log('Fetching analyses for station(s):', stationId);
    setLoading(true);
    setError(null);

    try {
      const analysesRef = collection(db, COLLECTIONS.ANALYSES).withConverter(analyseConverter);
      
      let q;
      
      // Handle different cases: single station, multiple stations, or all stations
      if (Array.isArray(stationId) && stationId.length > 0) {
        // Multiple specific stations
        q = query(
          analysesRef,
          where('StationID', 'in', stationId.slice(0, 10)), // Firestore 'in' limit is 10
          orderBy('DateAnalyse', 'desc')
        );
      } else if (typeof stationId === 'string' && stationId !== '') {
        // Single station
        q = query(
          analysesRef,
          where('StationID', '==', stationId),
          orderBy('DateAnalyse', 'desc')
        );
      } else {
        // All analyses (when stationId is empty string or empty array)
        q = query(
          analysesRef,
          orderBy('DateAnalyse', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      
      const analysesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          AnalyseID: doc.id,
          DateAnalyse: data.DateAnalyse instanceof Timestamp ? 
            data.DateAnalyse.toDate() : 
            data.DateAnalyse
        };
      });

      // Extract unique years from analyses
      const yearSet = new Set<number>();
      analysesData.forEach(analyse => {
        if (analyse.DateAnalyse) {
          yearSet.add(new Date(analyse.DateAnalyse).getFullYear());
        }
      });
      setYears(Array.from(yearSet).sort((a, b) => b - a));

      setAnalyses(analysesData);
    } catch (err: any) {
      console.error('Error fetching analyses:', err);
      setError(err?.message || 'Failed to load analyses');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // Add filtering functionality
  const filterStationsByAnalysis = useCallback(
    <T extends { station: { StationID: string } }>(
      stations: T[],
      status: Status,
      year: number | 'all'
    ) => {
      return stations.filter(s => {
        // Find analyses for this specific station
        const stationAnalyses = analyses.filter(a => a.StationID === s.station.StationID);
        const hasAnalyses = stationAnalyses.length > 0;

        if (status === 'analysed') {
          if (!hasAnalyses) return false;
          if (year !== 'all') {
            return stationAnalyses.some(
              a => a.DateAnalyse && 
              a.DateAnalyse instanceof Date && 
              !isNaN(a.DateAnalyse.getTime()) && 
              a.DateAnalyse.getFullYear() === year
            );
          }
          return true;
        } else if (status === 'not-analysed') {
          return !hasAnalyses;
        }
        return true; // 'all'
      });
    },
    [analyses]
  );

  useEffect(() => {
    // Always fetch when the hook is called, regardless of stationId value
    fetchAnalyses();
  }, [fetchAnalyses]);

  return { 
    analyses, 
    years,
    loading, 
    error, 
    refetch: fetchAnalyses,
    filterStationsByAnalysis
  };
}