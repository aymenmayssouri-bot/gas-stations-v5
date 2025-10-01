import { useCallback, useState } from 'react';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Province } from '@/types/station';
import { generateUUID } from '@/utils/uuid';

const COLLECTIONS = {
  PROVINCES: 'provinces',
};

export function useProvinceCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProvince = useCallback(async (data: Omit<Province, 'ProvinceID'>) => {
    setLoading(true);
    setError(null);
    try {
      const provinceId = generateUUID();
      const payload: Province = {
        ProvinceID: provinceId,
        ...data
      };
      await setDoc(doc(db, COLLECTIONS.PROVINCES, provinceId), payload);
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
      const payload = { ...data };
      delete payload.ProvinceID; // Remove ID from update payload
      await updateDoc(doc(db, COLLECTIONS.PROVINCES, id), payload);
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