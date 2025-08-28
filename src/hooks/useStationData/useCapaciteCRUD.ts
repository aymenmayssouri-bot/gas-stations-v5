// src/hooks/stationData/useCapaciteCRUD.ts
import { useCallback, useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CapaciteStockage } from '@/types/station';

const COLLECTIONS = {
  CAPACITES_STOCKAGE: 'capacites_stockage',
};

export function useCapaciteCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCapacite = useCallback(async (data: Omit<CapaciteStockage, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE), data);
    } catch (err: any) {
      setError(`Failed to create capacite: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCapacite = useCallback(async (id: string, data: Partial<CapaciteStockage>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, COLLECTIONS.CAPACITES_STOCKAGE, id), data);
    } catch (err: any) {
      setError(`Failed to update capacite: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCapacite = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.CAPACITES_STOCKAGE, id));
    } catch (err: any) {
      setError(`Failed to delete capacite: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCapacite, updateCapacite, deleteCapacite, loading, error };
}