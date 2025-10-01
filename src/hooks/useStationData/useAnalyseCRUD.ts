'use client';

import { useCallback, useState } from 'react';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, where, getDocs, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Analyse } from '@/types/station';
import { generateUUID } from '@/utils/uuid';

// Add interface for Timestamp-like object
interface TimestampLike {
  seconds: number;
  nanoseconds: number;
}

export function useAnalyseCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnalyse = useCallback(async (data: Omit<Analyse, 'AnalyseID'>) => {
    setLoading(true); 
    setError(null);
    try {
      const analyseId = generateUUID();
      const fsPayload = {
        StationID: data.StationID,
        ProduitAnalyse: data.ProduitAnalyse,
        CodeAnalyse: data.CodeAnalyse,
        ResultatAnalyse: data.ResultatAnalyse,
        DateAnalyse: data.DateAnalyse ? Timestamp.fromDate(data.DateAnalyse) : null,
      };
      await setDoc(doc(db, COLLECTIONS.ANALYSES, analyseId), fsPayload);
      return analyseId;
    } catch (err: any) {
      setError(`Failed to create analyse: ${err.message}`); 
      throw err;
    } finally { 
      setLoading(false); 
    }
  }, []);

  const getAnalysesByStation = useCallback(async (stationId: string): Promise<Analyse[]> => {
    setLoading(true); 
    setError(null);
    try {
      const q = query(collection(db, COLLECTIONS.ANALYSES), where('StationID', '==', stationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const raw = d.data();
        const ts = raw?.DateAnalyse as Timestamp | TimestampLike | null | undefined;
        
        // Proper date conversion
        let dateAnalyse: Date | null = null;
        if (ts instanceof Timestamp) {
          dateAnalyse = ts.toDate();
        } else if (ts && typeof ts === 'object' && 'seconds' in ts) {
          // Handle Firestore Timestamp-like objects
          const timestampLike = ts as TimestampLike;
          dateAnalyse = new Date(timestampLike.seconds * 1000);
        } else if (ts) {
          // Fallback for other date formats
          try {
            dateAnalyse = new Date(ts as any);
            if (isNaN(dateAnalyse.getTime())) {
              dateAnalyse = null;
            }
          } catch {
            dateAnalyse = null;
          }
        }

        return {
          AnalyseID: d.id,
          StationID: stationId,
          ProduitAnalyse: raw?.ProduitAnalyse ?? 'Gasoil',
          CodeAnalyse: raw?.CodeAnalyse ?? '',
          ResultatAnalyse: raw?.ResultatAnalyse ?? '',
          DateAnalyse: dateAnalyse,
        } as Analyse;
      }).sort((a, b) => {
        const aTime = a.DateAnalyse?.getTime() || 0;
        const bTime = b.DateAnalyse?.getTime() || 0;
        return bTime - aTime;
      });
    } catch (err: any) {
      setError(`Failed to fetch analyses: ${err.message}`); 
      throw err;
    } finally { 
      setLoading(false); 
    }
  }, []);

  const updateAnalyse = useCallback(async (analyseId: string, data: Partial<Analyse>) => {
    setLoading(true); 
    setError(null);
    try {
      const fsPayload: any = { ...data };
      if (data.DateAnalyse instanceof Date) {
        fsPayload.DateAnalyse = Timestamp.fromDate(data.DateAnalyse);
      } else if (data.DateAnalyse === null) {
        fsPayload.DateAnalyse = null;
      }
      await updateDoc(doc(db, COLLECTIONS.ANALYSES, analyseId), fsPayload);
    } catch (err: any) {
      setError(`Failed to update analyse: ${err.message}`); 
      throw err;
    } finally { 
      setLoading(false); 
    }
  }, []);

  const deleteAnalyse = useCallback(async (analyseId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.ANALYSES, analyseId));
      return true;
    } catch (err: any) {
      setError(`Failed to delete analyse: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createAnalyse, getAnalysesByStation, updateAnalyse, deleteAnalyse, loading, error };
}