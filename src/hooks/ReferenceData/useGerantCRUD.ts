// src/hooks/referenceData/useGerantCRUD.ts
import { useCallback, useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Gerant } from '@/types/station';

const COLLECTIONS = {
  GERANTS: 'gerants',
};

export function useGerantCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGerant = useCallback(async (data: Omit<Gerant, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, COLLECTIONS.GERANTS), data);
    } catch (err: any) {
      setError(`Failed to create gerant: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGerant = useCallback(async (id: string, data: Partial<Gerant>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, COLLECTIONS.GERANTS, id), data);
    } catch (err: any) {
      setError(`Failed to update gerant: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGerant = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.GERANTS, id));
    } catch (err: any) {
      setError(`Failed to delete gerant: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGerant, updateGerant, deleteGerant, loading, error };
}