// src/hooks/stationData/useAutorisationCRUD.ts
import { useCallback, useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Autorisation } from '@/types/station';

const COLLECTIONS = {
  AUTORISATIONS: 'autorisations',
};

export function useAutorisationCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAutorisation = useCallback(async (data: Omit<Autorisation, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, COLLECTIONS.AUTORISATIONS), {
        ...data,
        DateAutorisation: data.DateAutorisation ? Timestamp.fromDate(data.DateAutorisation) : null,
      });
    } catch (err: any) {
      setError(`Failed to create autorisation: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAutorisation = useCallback(async (id: string, data: Partial<Autorisation>) => {
    setLoading(true);
    setError(null);
    try {
      const updateData = {
        ...data,
        DateAutorisation: data.DateAutorisation ? Timestamp.fromDate(data.DateAutorisation) : null,
      };
      await updateDoc(doc(db, COLLECTIONS.AUTORISATIONS, id), updateData);
    } catch (err: any) {
      setError(`Failed to update autorisation: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAutorisation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.AUTORISATIONS, id));
    } catch (err: any) {
      setError(`Failed to delete autorisation: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createAutorisation, updateAutorisation, deleteAutorisation, loading, error };
}