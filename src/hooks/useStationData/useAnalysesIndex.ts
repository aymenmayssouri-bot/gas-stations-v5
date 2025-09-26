// src/hooks/useStationData/useAnalysesIndex.ts
'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Analyse } from '@/types/station';
import { analyseConverter } from '@/lib/firebase/converters';

type Status = 'all' | 'analysed' | 'not-analysed';

type AnalysesState = {
  analyses: Analyse[];
  loading: boolean;
  error: string | null;
};

export function useAnalysesIndex(stationId: string | string[]) {
  const isMounted = useRef(true);
  const [state, setState] = useState<AnalysesState>({
    analyses: [],
    loading: true,
    error: null
  });

  // Memoize stationId to prevent unnecessary re-renders
  const stationIdMemo = useMemo(() => {
    if (Array.isArray(stationId)) {
      return stationId.filter(Boolean).sort().join(',');
    }
    return stationId || '';
  }, [stationId]);

  const fetchAnalyses = useCallback(async () => {
    if (!isMounted.current) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const analysesRef = collection(db, COLLECTIONS.ANALYSES).withConverter(analyseConverter);
      let allAnalyses: Analyse[] = [];
      
      if (Array.isArray(stationId) && stationId.length > 0) {
        const validStationIds = stationId.filter(Boolean);
        
        // Split into chunks of 10 due to Firebase 'in' query limit
        const chunks = validStationIds.reduce((acc, curr, i) => {
          const chunkIndex = Math.floor(i / 10);
          if (!acc[chunkIndex]) acc[chunkIndex] = [];
          acc[chunkIndex].push(curr);
          return acc;
        }, [] as string[][]);

        for (const chunk of chunks) {
          const chunkQuery = query(
            analysesRef,
            where('StationID', 'in', chunk),
            orderBy('DateAnalyse', 'desc')
          );
          
          const snapshot = await getDocs(chunkQuery);
          
          const chunkAnalyses = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Better date conversion logic
            let dateAnalyse: Date | null = null;
            
            if (data.DateAnalyse instanceof Timestamp) {
              dateAnalyse = data.DateAnalyse.toDate();
            } else if (data.DateAnalyse instanceof Date && !isNaN(data.DateAnalyse.getTime())) {
              dateAnalyse = data.DateAnalyse;
            } else if (typeof data.DateAnalyse === 'string' && data.DateAnalyse) {
              const parsed = new Date(data.DateAnalyse);
              if (!isNaN(parsed.getTime())) {
                dateAnalyse = parsed;
              }
            }
            
            const analyse: Analyse = {
              ...data,
              AnalyseID: doc.id,
              DateAnalyse: dateAnalyse
            };
            
            return analyse;
          });
          allAnalyses.push(...chunkAnalyses);
        }
      } else if (typeof stationId === 'string' && stationId) {
        const q = query(
          analysesRef,
          where('StationID', '==', stationId),
          orderBy('DateAnalyse', 'desc')
        );

        const snapshot = await getDocs(q);
        
        allAnalyses = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Better date conversion logic
          let dateAnalyse: Date | null = null;
          
          if (data.DateAnalyse instanceof Timestamp) {
            dateAnalyse = data.DateAnalyse.toDate();
          } else if (data.DateAnalyse instanceof Date && !isNaN(data.DateAnalyse.getTime())) {
            dateAnalyse = data.DateAnalyse;
          } else if (typeof data.DateAnalyse === 'string' && data.DateAnalyse) {
            const parsed = new Date(data.DateAnalyse);
            if (!isNaN(parsed.getTime())) {
              dateAnalyse = parsed;
            }
          }
          
          const analyse: Analyse = {
            ...data,
            AnalyseID: doc.id,
            DateAnalyse: dateAnalyse
          };
          
          return analyse;
        });
      }

      if (!isMounted.current) return;

      setState({
        analyses: allAnalyses,
        loading: false,
        error: null
      });
    } catch (err: any) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err?.message || 'Failed to load analyses'
        }));
      }
    }
  }, [stationIdMemo]); // Use memoized stationId

  const filterStationsByAnalysis = useCallback(
    <T extends { station: { StationID: string } }>(
      stations: T[],
      status: Status,
      year: number | 'all'
    ) => {
      return stations.filter(s => {
        const stationAnalyses = state.analyses.filter(a => a.StationID === s.station.StationID);
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
        return true;
      });
    },
    [state.analyses]
  );

  // Compute years from analyses
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    state.analyses.forEach(analyse => {
      if (analyse.DateAnalyse && analyse.DateAnalyse instanceof Date && !isNaN(analyse.DateAnalyse.getTime())) {
        yearSet.add(analyse.DateAnalyse.getFullYear());
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [state.analyses]);

  useEffect(() => {
    isMounted.current = true;
    
    const shouldFetch = stationId && (Array.isArray(stationId) ? stationId.length > 0 : true);
    
    if (shouldFetch) {
      fetchAnalyses();
    } else {
      setState({
        analyses: [],
        loading: false,
        error: null
      });
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [stationIdMemo]);

  return {
    analyses: state.analyses,
    years,
    loading: state.loading,
    error: state.error,
    refetch: fetchAnalyses,
    filterStationsByAnalysis
  };
}