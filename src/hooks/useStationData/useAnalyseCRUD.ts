// src/hooks/stationData/useAnalyseCRUD.ts
import { useCallback, useState } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Analyse } from '@/types/station';

const COLLECTIONS = {
  ANALYSES: 'analyses',
};

export function useAnalyseCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new analyse document in Firestore.
   */
  const createAnalyse = useCallback(async (data: Omit<Analyse, 'AnalyseID'>) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, COLLECTIONS.ANALYSES), {
        ...data,
        DateAnalyse: data.DateAnalyse ? Timestamp.fromDate(data.DateAnalyse) : null,
      });
    } catch (err: any) {
      setError(`Failed to create analyse: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches all analyses for a specific station.
   */
  const getAnalysesByStation = useCallback(async (stationId: string): Promise<Analyse[]> => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, COLLECTIONS.ANALYSES), where('StationID', '==', stationId));
      const querySnapshot = await getDocs(q);
      const analyses = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          AnalyseID: doc.id,
          DateAnalyse: data.DateAnalyse ? (data.DateAnalyse as Timestamp).toDate() : null,
        } as Analyse;
      });
      return analyses;
    } catch (err: any) {
      setError(`Failed to get analyses: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Updates an existing analyse document.
   */
  const updateAnalyse = useCallback(async (analyseId: string, data: Partial<Analyse>) => {
    setLoading(true);
    setError(null);
    try {
      const updateData: { [key: string]: any } = { ...data };
      if (data.DateAnalyse) {
        updateData.DateAnalyse = Timestamp.fromDate(data.DateAnalyse);
      }
      await updateDoc(doc(db, COLLECTIONS.ANALYSES, analyseId), updateData);
    } catch (err: any) {
      setError(`Failed to update analyse: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deletes an analyse document from Firestore.
   */
  const deleteAnalyse = useCallback(async (analyseId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.ANALYSES, analyseId));
    } catch (err: any) {
      setError(`Failed to delete analyse: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createAnalyse, getAnalysesByStation, updateAnalyse, deleteAnalyse, loading, error };
}