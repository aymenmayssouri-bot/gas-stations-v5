// src/hooks/useStationData/useAnalysesIndex.ts
'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Analyse } from '@/types/station';
import { analyseConverter } from '@/lib/firebase/converters';

type Status = 'all' | 'analysed' | 'not-analysed';

type AnalysesState = {
  analyses: Analyse[];
  years: number[];
  loading: boolean;
  error: string | null;
};

export function useAnalysesIndex(stationId: string | string[]) {
  const isMounted = useRef(true);
  const [state, setState] = useState<AnalysesState>({
    analyses: [],
    years: [],
    loading: true,
    error: null
  });

  const fetchAnalyses = useCallback(async () => {
    if (!isMounted.current) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const analysesRef = collection(db, COLLECTIONS.ANALYSES).withConverter(analyseConverter);
      
      let q;
      if (Array.isArray(stationId) && stationId.length > 0) {
        // Split into chunks of 10 if array is larger
        const chunks = stationId.reduce((acc, curr, i) => {
          const chunkIndex = Math.floor(i / 10);
          if (!acc[chunkIndex]) acc[chunkIndex] = [];
          acc[chunkIndex].push(curr);
          return acc;
        }, [] as string[][]);

        const allAnalyses: Analyse[] = [];
        
        for (const chunk of chunks) {
          const chunkQuery = query(
            analysesRef,
            where('StationID', 'in', chunk),
            orderBy('DateAnalyse', 'desc')
          );
          
          const snapshot = await getDocs(chunkQuery);
          allAnalyses.push(...snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              AnalyseID: doc.id,
              DateAnalyse: data.DateAnalyse instanceof Timestamp ? 
                data.DateAnalyse.toDate() : 
                data.DateAnalyse instanceof Date ?
                  data.DateAnalyse :
                  null
            };
          }));
        }

        if (!isMounted.current) return;

        const yearSet = new Set<number>();
        allAnalyses.forEach(analyse => {
          if (analyse.DateAnalyse) {
            yearSet.add(new Date(analyse.DateAnalyse).getFullYear());
          }
        });

        setState({
          analyses: allAnalyses,
          years: Array.from(yearSet).sort((a, b) => b - a),
          loading: false,
          error: null
        });
      } else {
        q = query(
          analysesRef,
          where('StationID', '==', stationId),
          orderBy('DateAnalyse', 'desc')
        );

        const snapshot = await getDocs(q);
        
        if (!isMounted.current) return;

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

        const yearSet = new Set<number>();
        analysesData.forEach(analyse => {
          if (analyse.DateAnalyse) {
            yearSet.add(new Date(analyse.DateAnalyse).getFullYear());
          }
        });
        const yearsArray = Array.from(yearSet).sort((a, b) => b - a);

        if (isMounted.current) {
          setState({
            analyses: analysesData,
            years: yearsArray,
            loading: false,
            error: null
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching analyses:', err);
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err?.message || 'Failed to load analyses'
        }));
      }
    }
  }, [stationId]);

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

  useEffect(() => {
    isMounted.current = true;
    fetchAnalyses();
    return () => {
      isMounted.current = false;
    };
  }, [JSON.stringify(stationId)]); // Use JSON.stringify to stabilize array dependency

  return {
    analyses: state.analyses,
    years: state.years,
    loading: state.loading,
    error: state.error,
    refetch: fetchAnalyses,
    filterStationsByAnalysis
  };
}