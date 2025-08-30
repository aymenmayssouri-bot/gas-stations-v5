// src/hooks/ReferenceData/useCommuneCRUD.ts
import { useCallback, useState } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commune } from '@/types/station';

const COLLECTIONS = {
  COMMUNES: 'Communes', // NOTE: capital C
};

export function useCommuneCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCommune = useCallback(async (data: Omit<Commune, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, COLLECTIONS.COMMUNES), data as any);
    } catch (err: any) {
      setError(`Failed to create commune: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCommune = useCallback(async (id: string, data: Partial<Commune>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, COLLECTIONS.COMMUNES, id), data as any);
    } catch (err: any) {
      setError(`Failed to update commune: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCommune = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.COMMUNES, id));
    } catch (err: any) {
      setError(`Failed to delete commune: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCommune, updateCommune, deleteCommune, loading, error };
}