// src/hooks/useStationData/useAnalysesIndex.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Analyse } from '@/types/station';

type Status = 'all' | 'analysed' | 'not-analysed';

const IN_LIMIT = 10;

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function useAnalysesIndex(stationIds?: string[]) {
  const [mapByStation, setMapByStation] = useState<Record<string, Analyse[]>>({});
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let docs: Analyse[] = [];

      if (stationIds && stationIds.length) {
        for (const ids of chunk(stationIds, IN_LIMIT)) {
          const q = query(
            collection(db, COLLECTIONS.ANALYSES),
            where('StationID', 'in', ids)
          );
          const snap = await getDocs(q);
          docs.push(...snap.docs.map(d => toAnalyse(d.data(), d.id)));
        }
      } else {
        const snap = await getDocs(collection(db, COLLECTIONS.ANALYSES));
        docs = snap.docs.map(d => toAnalyse(d.data(), d.id));
      }

      const byStation: Record<string, Analyse[]> = {};
      const yearSet = new Set<number>();

      for (const a of docs) {
        const sid = a.StationID;
        (byStation[sid] ||= []).push(a);
        if (a.DateAnalyse) yearSet.add(new Date(a.DateAnalyse).getFullYear());
      }

      // sort each station analyses by date desc
      for (const sid of Object.keys(byStation)) {
        byStation[sid].sort((a, b) => {
          const ta = a.DateAnalyse ? new Date(a.DateAnalyse).getTime() : 0;
          const tb = b.DateAnalyse ? new Date(b.DateAnalyse).getTime() : 0;
          return tb - ta;
        });
      }

      setMapByStation(byStation);
      setYears([...yearSet].sort((a, b) => b - a));
    } catch (e: any) {
      setError(e?.message || 'Failed to load analyses');
      setMapByStation({});
      setYears([]);
    } finally {
      setLoading(false);
    }
  }, [stationIds]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const hasAnalysis = useCallback((stationId: string) => {
    return !!(mapByStation[stationId]?.length);
  }, [mapByStation]);

  const filterStationsByAnalysis = useCallback(
    <T extends { station: { StationID: string } }>(
      stations: T[],
      status: Status,
      year: number | 'all'
    ) => {
      return stations.filter(s => {
        const arr = mapByStation[s.station.StationID] || [];
        const analysed = arr.length > 0;

        if (status === 'analysed') {
          if (!analysed) return false;
          if (year !== 'all') {
            return arr.some(a => a.DateAnalyse && new Date(a.DateAnalyse).getFullYear() === year);
          }
        } else if (status === 'not-analysed') {
          return !analysed;
        }
        return true; // 'all'
      });
    },
    [mapByStation]
  );

  return { mapByStation, years, hasAnalysis, filterStationsByAnalysis, loading, error, refetch: fetchAll };
}

function toAnalyse(raw: any, id: string): Analyse {
  // Normalize Timestamp -> Date
  const ts = raw?.DateAnalyse as Timestamp | Date | null | undefined;
  let date: Date | null = null;
  if (ts instanceof Timestamp) date = ts.toDate();
  else if (ts instanceof Date) date = ts;
  else date = null;

  return {
    AnalyseID: id,
    StationID: String(raw.StationID || ''),
    ProduitAnalyse: raw?.ProduitAnalyse ?? 'Gasoil', // ADDED (with default)
    DateAnalyse: date,
    CodeAnalyse: String(raw.CodeAnalyse || ''),
    ResultatAnalyse: String(raw.ResultatAnalyse || ''),
  };
}