import { useCallback, useState } from 'react';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Marque } from '@/types/station';
import { generateUUID } from '@/utils/uuid';

const COLLECTIONS = {
  MARQUES: 'marques',
};

export function useMarqueCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarque = useCallback(async (data: Omit<Marque, 'MarqueID'>) => {
    setLoading(true);
    setError(null);
    try {
      const marqueId = generateUUID();
      const payload: Marque = {
        MarqueID: marqueId,
        ...data
      };
      await setDoc(doc(db, COLLECTIONS.MARQUES, marqueId), payload);
    } catch (err: any) {
      setError(`Failed to create marque: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMarque = useCallback(async (id: string, data: Partial<Marque>) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...data };
      delete payload.MarqueID; // Remove ID from update payload
      await updateDoc(doc(db, COLLECTIONS.MARQUES, id), payload);
    } catch (err: any) {
      setError(`Failed to update marque: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMarque = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.MARQUES, id));
    } catch (err: any) {
      setError(`Failed to delete marque: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createMarque, updateMarque, deleteMarque, loading, error };
}