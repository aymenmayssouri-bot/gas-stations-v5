import { useCallback, useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Province } from '@/types/station';

const COLLECTIONS = {
  PROVINCES: 'provinces',
};

export function useProvinceCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProvince = useCallback(async (data: Omit<Province, 'id' | 'ProvinceID'>) => {
    setLoading(true);
    setError(null);
    try {
      // Add without ID; Firestore generates document ID, and ProvinceID can be set post-creation if needed
      await addDoc(collection(db, COLLECTIONS.PROVINCES), { ProvinceID: '', ...data } as any); // Placeholder for ProvinceID if required
    } catch (err: any) {
      setError(`Failed to create province: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProvince = useCallback(async (id: string, data: Partial<Province>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, COLLECTIONS.PROVINCES, id), data as any);
    } catch (err: any) {
      setError(`Failed to update province: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProvince = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.PROVINCES, id));
    } catch (err: any) {
      setError(`Failed to delete province: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProvince, updateProvince, deleteProvince, loading, error };
}