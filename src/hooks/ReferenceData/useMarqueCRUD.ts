import { useCallback, useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Marque } from '@/types/station';

const COLLECTIONS = {
  MARQUES: 'marques',
};

export function useMarqueCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarque = useCallback(async (data: Omit<Marque, 'id' | 'MarqueID'>) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, COLLECTIONS.MARQUES), { MarqueID: '', ...data } as any);
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
      await updateDoc(doc(db, COLLECTIONS.MARQUES, id), data as any);
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