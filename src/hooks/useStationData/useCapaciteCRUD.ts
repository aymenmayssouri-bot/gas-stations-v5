import { useCallback, useState } from 'react';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CapaciteStockage } from '@/types/station';
import { generateUUID } from '@/utils/uuid';

const COLLECTIONS = {
  CAPACITES_STOCKAGE: 'capacites_stockage',
};

export function useCapaciteCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCapacite = useCallback(async (data: Omit<CapaciteStockage, 'CapaciteID'>) => {
    setLoading(true);
    setError(null);
    try {
      const capaciteId = generateUUID();
      const payload: CapaciteStockage = {
        CapaciteID: capaciteId,
        ...data
      };
      await setDoc(doc(db, COLLECTIONS.CAPACITES_STOCKAGE, capaciteId), payload);
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
      const payload = { ...data };
      delete payload.CapaciteID; // Remove ID from update payload
      await updateDoc(doc(db, COLLECTIONS.CAPACITES_STOCKAGE, id), payload);
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