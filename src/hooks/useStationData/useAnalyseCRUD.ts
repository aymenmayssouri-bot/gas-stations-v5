// src/hooks/useStationData/useAnalyseCRUD.ts
'use client';

import { useCallback, useState } from 'react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, getDocs, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Analyse } from '@/types/station';

export function useAnalyseCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnalyse = useCallback(async (data: Omit<Analyse, 'AnalyseID'>) => {
    setLoading(true); setError(null);
    try {
      const payload = {
        StationID: data.StationID,
        ProduitAnalyse: data.ProduitAnalyse, // ADDED
        CodeAnalyse: data.CodeAnalyse,
        ResultatAnalyse: data.ResultatAnalyse,
        DateAnalyse: data.DateAnalyse ? Timestamp.fromDate(data.DateAnalyse) : null,
      };
      const ref = await addDoc(collection(db, COLLECTIONS.ANALYSES), payload);
      return ref.id;
    } catch (err: any) {
      setError(`Failed to create analyse: ${err.message}`); throw err;
    } finally { setLoading(false); }
  }, []);

  const getAnalysesByStation = useCallback(async (stationId: string): Promise<Analyse[]> => {
    setLoading(true); setError(null);
    try {
      const q = query(collection(db, COLLECTIONS.ANALYSES), where('StationID', '==', stationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const raw = d.data();
        const ts = raw?.DateAnalyse as Timestamp | null | undefined;
        return {
          AnalyseID: d.id,
          StationID: stationId,
          ProduitAnalyse: raw?.ProduitAnalyse ?? 'Gasoil', // ADDED (with default)
          CodeAnalyse: raw?.CodeAnalyse ?? '',
          ResultatAnalyse: raw?.ResultatAnalyse ?? '',
          DateAnalyse: ts ? ts.toDate() : null,
        } as Analyse;
      }).sort((a, b) => (b.DateAnalyse?.getTime() || 0) - (a.DateAnalyse?.getTime() || 0));
    } catch (err: any) {
      setError(`Failed to fetch analyses: ${err.message}`); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateAnalyse = useCallback(async (analyseId: string, data: Partial<Analyse>) => {
    setLoading(true); setError(null);
    try {
      const payload: any = { ...data };
      if (data.DateAnalyse instanceof Date) payload.DateAnalyse = Timestamp.fromDate(data.DateAnalyse);
      await updateDoc(doc(db, COLLECTIONS.ANALYSES, analyseId), payload);
    } catch (err: any) {
      setError(`Failed to update analyse: ${err.message}`); throw err;
    } finally { setLoading(false); }
  }, []);

  const deleteAnalyse = useCallback(async (analyseId: string) => {
    setLoading(true); setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.ANALYSES, analyseId));
    } catch (err: any) {
      setError(`Failed to delete analyse: ${err.message}`); throw err;
    } finally { setLoading(false); }
  }, []);

  return { createAnalyse, getAnalysesByStation, updateAnalyse, deleteAnalyse, loading, error };
}