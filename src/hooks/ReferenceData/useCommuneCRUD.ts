import { useCallback, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commune } from '@/types/station';
import { generateUUID } from '@/utils/uuid';

const COLLECTIONS = {
  COMMUNES: 'communes',
};

export function useCommuneCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCommune = useCallback(async (data: Omit<Commune, 'CommuneID'>) => {
    setLoading(true);
    setError(null);
    try {
      const communeId = generateUUID();
      const payload: Commune = {
        CommuneID: communeId,
        ...data
      };
      await setDoc(doc(db, COLLECTIONS.COMMUNES, communeId), payload);
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
      const payload = { ...data };
      delete payload.CommuneID; // Remove ID from update payload
      await updateDoc(doc(db, COLLECTIONS.COMMUNES, id), payload);
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